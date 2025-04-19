import React, { useEffect, useState } from 'react'
import { supabase } from '../client'
import { useNavigate } from 'react-router-dom'

// Import all map images
const mapModules = import.meta.glob('../Maps/*.avif', { eager: true })
const mapImages = Object.fromEntries(
  Object.entries(mapModules).map(([path, module]) => {
    const name = path.split('/').pop().replace('.avif','')
    return [name, module.default]
  })
)

// Import all agent images
const agentModules = import.meta.glob('../Agent-Imgs/*.avif', { eager: true })
const agentImages = Object.fromEntries(
  Object.entries(agentModules).map(([path, module]) => {
    const name = path.split('/').pop().replace('.avif','')
    return [name, module.default]
  })
)

export default function ViewLineups() {
  const [lineups, setLineups]     = useState([])
  const [error, setError]         = useState(null)
  const [selected, setSelected]   = useState(null)
  const [notes, setNotes]         = useState('')
  const [editingNotes, setEditingNotes] = useState(false)
  const navigate = useNavigate()

  const fetchLineups = async () => {
    const res = await supabase
      .from('lineups')
      .select('*')
      .order('created_at', { ascending: false })
    if (res.error) setError(res.error)
    else setLineups(res.data || [])
  }

  useEffect(() => {
    fetchLineups()
  }, [])

  const openDetail = (l) => {
    setSelected(l)
    setNotes(l.notes || '')
    setEditingNotes(false)
  }

  const saveNotes = async () => {
    const { error } = await supabase
      .from('lineups')
      .update({ notes })
      .eq('id', selected.id)
    if (!error) {
      fetchLineups()
      setSelected(prev => ({ ...prev, notes }))
      setEditingNotes(false)
      alert('Notes saved!')
    } else {
      alert('Error saving notes: ' + error.message)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Delete this lineup?')) {
      const { error } = await supabase
        .from('lineups')
        .delete()
        .eq('id', selected.id)
      if (!error) {
        fetchLineups()
        setSelected(null)
        alert('Lineup deleted.')
      } else {
        alert('Error deleting lineup: ' + error.message)
      }
    }
  }

  if (error) {
    return <div className="lineups"><p style={{ color: 'red' }}>{error.message}</p></div>
  }

  // LIST VIEW
  if (!selected) {
    return (
      <div className="card-grid maps">
        {lineups.map(l => (
          <div
            key={l.id}
            className="card clickable view-lineup-card"
            onClick={() => openDetail(l)}
          >
            <img
              src={mapImages[l.map]}
              alt={l.map}
              onError={e => { e.target.style.display = 'none' }}
            />
            <div className="team-name">{l.team_name}</div>
            <div className="map-name">{l.map}</div>
          </div>
        ))}
      </div>
    )
  }

  // DETAIL VIEW
  return (
    <div className="detail-view">
      <h2>{selected.team_name}</h2>

      {/* Map card */}
      <div className="card-grid maps detail-map-card">
        <div className="card">
          <img
            src={mapImages[selected.map]}
            alt={selected.map}
            onError={e => { e.target.style.display = 'none' }}
          />
          <span>{selected.map}</span>
        </div>
      </div>

      {/* Agent cards */}
      <h3>Agents</h3>
      <div className="card-grid agents">
        {selected.agents.map(agent => (
          <div key={agent} className="card">
            <img
              src={agentImages[agent]}
              alt={agent}
              onError={e => { e.target.style.display = 'none' }}
            />
            <span>{agent}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="form-group">
        <label>Notes:</label>
        {!editingNotes ? (
          <>
            <p>{notes || 'No notes yet.'}</p>
            <button onClick={() => setEditingNotes(true)}>
              {notes ? 'Edit Notes' : 'Add Notes'}
            </button>
          </>
        ) : (
          <>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
            />
            <button onClick={saveNotes}>Save Notes</button>
            <button onClick={() => {
              setNotes(selected.notes || '')
              setEditingNotes(false)
            }}>
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="actions">
        <button onClick={() => navigate(`/edit/${selected.id}`)}>
          Edit Lineup
        </button>
        <button className="danger" onClick={handleDelete}>
          Delete Lineup
        </button>
        <button className="secondary" onClick={() => setSelected(null)}>
          Back to List
        </button>
      </div>
    </div>
  )
}
