// src/pages/EditLineup.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../client'

// map & agent lists
const mapsList = ['Bind','Haven','Split','Ascent','Icebox','Breeze','Fracture','Lotus','Pearl','Sunset']
const agentsList = [
  'Jett','Sage','Omen','Phoenix','Raze','Reyna','Killjoy','Cypher','Viper','Sova',
  'Astra','Breach','Brimstone','Chamber','Clove','Deadlock','Fade','Gekko',
  'Harbor','Iso','Kay-O','Neon','Skye','Tejo','Vyse','Waylay','Yoru'
]

// Eager‐load map images
const mapModules = import.meta.glob('../Maps/*.avif', { eager: true })
const mapImages = Object.fromEntries(
  Object.entries(mapModules).map(([path, module]) => {
    const name = path.split('/').pop().replace('.avif','')
    return [name, module.default]
  })
)

// Eager‐load agent images
const agentModules = import.meta.glob('../Agent-Imgs/*.avif', { eager: true })
const agentImages = Object.fromEntries(
  Object.entries(agentModules).map(([path, module]) => {
    const name = path.split('/').pop().replace('.avif','')
    return [name, module.default]
  })
)

export default function EditLineup() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [teamName, setTeamName] = useState('')
  const [selectedMap, setSelectedMap] = useState(null)
  const [selectedAgents, setSelectedAgents] = useState([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('lineups')
        .select('*')
        .eq('id', id)
        .single()
      if (error) {
        alert(error.message)
        return navigate('/view')
      }
      setTeamName(data.team_name)
      setSelectedMap(data.map)
      setSelectedAgents(data.agents)
      setNotes(data.notes || '')
      setLoading(false)
    }
    load()
  }, [id, navigate])

  const handleSave = async () => {
    const { error } = await supabase
      .from('lineups')
      .update({
        team_name: teamName,
        map: selectedMap,
        agents: selectedAgents,
        notes
      })
      .eq('id', id)
    if (error) {
      alert(error.message)
    } else {
      navigate('/view')
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <div className="form-group">
      <h2>Edit Lineup</h2>

      {/* Team Name */}
      <div className="form-group">
        <label>Team Name:</label>
        <input
          type="text"
          value={teamName}
          onChange={e => setTeamName(e.target.value)}
        />
      </div>

      {/* Map Selection */}
      <h3>Select Map</h3>
      <div className="card-grid maps">
        {mapsList.map(map => {
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

      {/* Agent Selection */}
      <h3>Select 5 Agents</h3>
      <div className="card-grid agents">
        {agentsList.map(agent => {
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

      {/* Notes */}
      <div className="form-group">
        <label>Notes:</label>
        <textarea
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <button onClick={handleSave}>Save</button>
      <button
        className="secondary"
        onClick={() => navigate('/view')}
        style={{ marginLeft: 12 }}
      >
        Cancel
      </button>
    </div>
  )
}
