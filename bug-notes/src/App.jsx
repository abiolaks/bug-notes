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
  const [filter, setFilter] = useState('all')

  function addBug(e) {
    e.preventDefault()
    if (!title.trim()) return
    const bug = {
      id: crypto.randomUUID(),
      title: title.trim(),
      status,
      createdAt: new Date().toLocaleString(),
    }
    setBugs(prev => [bug, ...prev])
    setTitle('')
    setStatus('open')
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

  const filtered = filter === 'all'
    ? bugs
    : bugs.filter(bug => bug.status === filter)

  const openCount = bugs.filter(b => b.status === 'open').length
  const fixedCount = bugs.filter(b => b.status === 'fixed').length

  return (
    <div className="app">
      <h1>🐛 Bug Notes</h1>

      <form onSubmit={addBug} className="bug-form">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
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
        <button type="submit" className="add-btn">Add Bug</button>
      </form>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({bugs.length})
        </button>
        <button
          className={`filter-btn ${filter === 'open' ? 'active' : ''}`}
          onClick={() => setFilter('open')}
        >
          Open ({openCount})
        </button>
        <button
          className={`filter-btn ${filter === 'fixed' ? 'active' : ''}`}
          onClick={() => setFilter('fixed')}
        >
          Fixed ({fixedCount})
        </button>
      </div>

      {bugs.length === 0 ? (
        <p className="empty">No bugs yet — add one above! 🐛</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No {filter} bugs to show. 🎉</p>
      ) : (
        <ul className="bug-list">
          {filtered.map(bug => (
            <li key={bug.id} className={`bug-item ${bug.status}`}>
              <div className="bug-info">
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
