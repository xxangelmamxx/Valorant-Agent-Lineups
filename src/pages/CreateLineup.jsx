import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../client'

// lists of maps and agents
const maps = [
  'Bind','Haven','Split','Ascent','Icebox','Breeze','Fracture',
  'Lotus','Pearl','Sunset'
]
const agents = [
  'Jett','Sage','Omen','Phoenix','Raze','Reyna','Killjoy','Cypher','Viper','Sova',
  'Astra','Breach','Brimstone','Chamber','Clove','Deadlock','Fade','Gekko',
  'Harbor','Iso','Kay-O','Neon','Skye','Tejo','Vyse','Waylay','Yoru'
]

// eagerly import all map images from /src/Maps/*.avif
const mapModules = import.meta.glob('../Maps/*.avif', { eager: true })
const mapImages = Object.fromEntries(
  Object.entries(mapModules).map(([path, module]) => {
    const name = path.split('/').pop().replace('.avif','')
    return [name, module.default]
  })
)

// eagerly import all agent images from /src/Agent-Imgs/*.avif
const agentModules = import.meta.glob('../Agent-Imgs/*.avif', { eager: true })
const agentImages = Object.fromEntries(
  Object.entries(agentModules).map(([path, module]) => {
    const name = path.split('/').pop().replace('.avif','')
    return [name, module.default]
  })
)

export default function CreateLineup() {
  const [step, setStep] = useState(1)
  const [teamName, setTeamName] = useState('')
  const [selectedMap, setSelectedMap] = useState(null)
  const [selectedAgents, setSelectedAgents] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const navigate = useNavigate()

  // test connection on mount
  useEffect(() => {
    supabase.from('lineups').select().then(res => {
      if (res.error) {
        alert(`Test SELECT failed:\n${res.error.message}`)
      }
    })
  }, [])

  const handleFinalize = async () => {
    const res = await supabase
      .from('lineups')
      .insert({
        team_name: teamName,
        map: selectedMap,
        agents: selectedAgents
      })
      .select()
    if (res.error) {
      alert(`Insert failed: ${res.error.message}`)
    } else {
      setIsComplete(true)
    }
  }

  const resetForm = () => {
    setStep(1)
    setTeamName('')
    setSelectedMap(null)
    setSelectedAgents([])
    setIsComplete(false)
  }

  // Completion screen
  if (isComplete) {
    return (
      <div className="form-group">
        <h2>🎉 Lineup created successfully!</h2>
        <button onClick={resetForm}>Create Another Lineup</button>
        <button className="secondary" onClick={() => navigate('/view')}>
          View Lineups
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Step 1: Team Name */}
      {step === 1 && (
        <div className="form-group centered-step1">
          <label>Team Name:</label>
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
          />
          <button disabled={!teamName} onClick={() => setStep(2)}>
            Next
          </button>
        </div>
      )}

      {/* Step 2: Select a Map */}
      {step === 2 && (
        <div>
          <h2>Select a Map</h2>
          <div className="card-grid maps">
            {maps.map(map => {
              const sel = selectedMap === map
              return (
                <div
                  key={map}
                  className={`card ${sel ? 'selected' : ''}`}
                  onClick={() => setSelectedMap(map)}
                >
                  <img
                    src={mapImages[map]}
                    alt={map}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <span>{map}</span>
                </div>
              )
            })}
          </div>
          <button disabled={!selectedMap} onClick={() => setStep(3)}>
            Next
          </button>
        </div>
      )}

      {/* Step 3: Select 5 Agents */}
      {step === 3 && (
        <div>
          <h2>Select 5 Agents</h2>
          <div className="card-grid agents">
            {agents.map(agent => {
              const sel = selectedAgents.includes(agent)
              return (
                <div
                  key={agent}
                  className={`card ${sel ? 'selected' : ''}`}
                  onClick={() => {
                    if (sel) {
                      setSelectedAgents(a => a.filter(x => x !== agent))
                    } else if (selectedAgents.length < 5) {
                      setSelectedAgents(a => [...a, agent])
                    }
                  }}
                >
                  <img
                    src={agentImages[agent]}
                    alt={agent}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <span>{agent}</span>
                </div>
              )
            })}
          </div>
          <button
            disabled={selectedAgents.length !== 5}
            className="secondary"
            onClick={handleFinalize}
          >
            Finalize
          </button>
        </div>
      )}
    </div>
  )
}
