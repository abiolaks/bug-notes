import './style.css'

// ── Types ──────────────────────────────────────────
type BugStatus = 'open' | 'fixed'
type Filter = 'all' | BugStatus

interface Bug {
  id: number
  title: string
  status: BugStatus
}

// ── State ──────────────────────────────────────────
const STORAGE_KEY = 'bug-notes'

let bugs: Bug[] = []
let nextId = 1
let filter: Filter = 'all'

function loadBugs(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    bugs = data.bugs ?? []
    nextId = data.nextId ?? 1
  } catch { /* corrupted data — start fresh */ }
}

function saveBugs(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ bugs, nextId }))
}

// ── DOM refs (lazy – grabbed after render) ────────
const app = document.querySelector<HTMLDivElement>('#app')!

// ── Render ─────────────────────────────────────────
function render(): void {
  const filtered = filter === 'all' ? bugs : bugs.filter(b => b.status === filter)
  const openCount = bugs.filter(b => b.status === 'open').length
  const fixedCount = bugs.filter(b => b.status === 'fixed').length

  app.innerHTML = `
    <div class="bug-tracker">
      <h1>🐛 Bug Notes</h1>

      <form id="bug-form" class="bug-form">
        <input
          id="bug-title"
          class="bug-input"
          type="text"
          placeholder="What broke?"
          maxlength="120"
          required
        />
        <select id="bug-status" class="bug-select">
          <option value="open">Open</option>
          <option value="fixed">Fixed</option>
        </select>
        <button type="submit" class="bug-btn">Add</button>
      </form>

      <div class="bug-filters">
        <button class="filter-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">
          All (${bugs.length})
        </button>
        <button class="filter-btn ${filter === 'open' ? 'active' : ''}" data-filter="open">
          Open (${openCount})
        </button>
        <button class="filter-btn ${filter === 'fixed' ? 'active' : ''}" data-filter="fixed">
          Fixed (${fixedCount})
        </button>
      </div>

      <ul class="bug-list">
        ${bugs.length === 0
          ? '<li class="bug-empty">No bug notes yet — add one above 👆</li>'
          : filtered.length === 0
            ? '<li class="bug-empty">No bugs match this filter</li>'
            : filtered.map(bug => `
            <li class="bug-item ${bug.status}">
              <span class="bug-title-text">${escapeHtml(bug.title)}</span>
              <span class="bug-badge ${bug.status}">${bug.status}</span>
              <button class="bug-toggle" data-id="${bug.id}">
                ${bug.status === 'open' ? '✅ Mark fixed' : '🔙 Reopen'}
              </button>
            </li>
          `).join('')
        }
      </ul>
    </div>
  `

  // re-wire events after innerHTML
  wireEvents()
}

// ── Events ─────────────────────────────────────────
function wireEvents(): void {
  document.getElementById('bug-form')!.addEventListener('submit', (e) => {
    e.preventDefault()
    const titleEl = document.getElementById('bug-title') as HTMLInputElement
    const statusEl = document.getElementById('bug-status') as HTMLSelectElement
    const title = titleEl.value.trim()
    if (!title) return

    bugs.push({ id: nextId++, title, status: statusEl.value as BugStatus })
    titleEl.value = ''
    saveBugs()
    render()
  })

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      filter = (btn as HTMLButtonElement).dataset.filter as Filter
      render()
    })
  })

  document.querySelectorAll('.bug-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number((btn as HTMLButtonElement).dataset.id)
      const bug = bugs.find(b => b.id === id)
      if (bug) {
        bug.status = bug.status === 'open' ? 'fixed' : 'open'
        saveBugs()
        render()
      }
    })
  })
}

// ── Helpers ────────────────────────────────────────
function escapeHtml(str: string): string {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

// ── Go ─────────────────────────────────────────────
loadBugs()
render()
