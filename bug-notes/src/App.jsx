import { useState, useEffect } from 'react'
import './App.css'

const STORAGE_KEY = 'bug-notes'

function loadBugs() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function App() {
  const [bugs, setBugs] = useState(loadBugs)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('open')
  const [statusFilter, setStatusFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [severity, setSeverity] = useState('low')
  const [error, setError] = useState('')

  function addBug(e) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    const isDuplicate = bugs.some(
      bug => bug.title.toLowerCase() === trimmed.toLowerCase()
    )
    if (isDuplicate) {
      setError('A bug with this title already exists.')
      return
    }

    const bug = {
      id: crypto.randomUUID(),
      title: trimmed,
      status,
      severity,
      createdAt: new Date().toLocaleString(),
    }
    setBugs(prev => [bug, ...prev])
    setTitle('')
    setStatus('open')
    setSeverity('low')
    setError('')
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bugs))
  }, [bugs])

  function toggleBug(id) {
    setBugs(prev =>
      prev.map(bug =>
        bug.id === id
          ? { ...bug, status: bug.status === 'open' ? 'fixed' : 'open' }
          : bug
      )
    )
  }

  let filtered = bugs
  if (statusFilter !== 'all') {
    filtered = filtered.filter(bug => bug.status === statusFilter)
  }
  if (severityFilter !== 'all') {
    filtered = filtered.filter(bug => bug.severity === severityFilter)
  }

  const openCount = bugs.filter(b => b.status === 'open').length
  const fixedCount = bugs.filter(b => b.status === 'fixed').length

  return (
    <div className="app">
      <h1>🐛 Bug Notes</h1>

      <form onSubmit={addBug} className="bug-form">
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setError('') }}
          placeholder="What's bugging you?"
          className="title-input"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="status-select"
        >
          <option value="open">🔴 Open</option>
          <option value="fixed">🟢 Fixed</option>
        </select>
        <select
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          className="severity-select"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
        <button type="submit" className="add-btn">Add Bug</button>
        {error && <p className="form-error">{error}</p>}
      </form>

      <div className="filters">
        <button
          className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
          onClick={() => setStatusFilter('all')}
        >
          All ({bugs.length})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`}
          onClick={() => setStatusFilter('open')}
        >
          Open ({openCount})
        </button>
        <button
          className={`filter-btn ${statusFilter === 'fixed' ? 'active' : ''}`}
          onClick={() => setStatusFilter('fixed')}
        >
          Fixed ({fixedCount})
        </button>
      </div>

      <div className="filters severity-filters">
        <button
          className={`filter-btn ${severityFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSeverityFilter('all')}
        >
          Any severity
        </button>
        <button
          className={`filter-btn severity-low ${severityFilter === 'low' ? 'active' : ''}`}
          onClick={() => setSeverityFilter('low')}
        >
          Low
        </button>
        <button
          className={`filter-btn severity-medium ${severityFilter === 'medium' ? 'active' : ''}`}
          onClick={() => setSeverityFilter('medium')}
        >
          Medium
        </button>
        <button
          className={`filter-btn severity-high ${severityFilter === 'high' ? 'active' : ''}`}
          onClick={() => setSeverityFilter('high')}
        >
          High
        </button>
      </div>

      {bugs.length === 0 ? (
        <p className="empty">No bugs yet — add one above! 🐛</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No matching bugs. 🎉</p>
      ) : (
        <ul className="bug-list">
          {filtered.map(bug => (
            <li key={bug.id} className={`bug-item ${bug.status}`}>
              <div className="bug-info">
                <span className={`severity-badge ${bug.severity || 'low'}`}>
                  {bug.severity || 'low'}
                </span>
                <span className="bug-status">
                  {bug.status === 'open' ? '🔴' : '🟢'}
                </span>
                <span className="bug-title">{bug.title}</span>
                <span className="bug-date">{bug.createdAt}</span>
              </div>
              <button
                onClick={() => toggleBug(bug.id)}
                className="toggle-btn"
              >
                {bug.status === 'open' ? 'Mark Fixed' : 'Reopen'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
