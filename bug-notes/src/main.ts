import './style.css'

// ── Types ──────────────────────────────────────────
type BugStatus = 'open' | 'fixed'
type Severity = 'low' | 'medium' | 'high'
type StatusFilter = 'all' | BugStatus
type SeverityFilter = 'all' | Severity

interface Bug {
  id: number
  title: string
  status: BugStatus
  severity: Severity
}

// ── State ──────────────────────────────────────────
const STORAGE_KEY = 'bug-notes'

let bugs: Bug[] = []
let nextId = 1
let statusFilter: StatusFilter = 'all'
let severityFilter: SeverityFilter = 'all'
let error = ''

function loadBugs(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    bugs = (data.bugs ?? []).map((b: Bug) => ({ ...b, severity: b.severity ?? 'medium' }))
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
  const byStatus = statusFilter === 'all' ? bugs : bugs.filter(b => b.status === statusFilter)
  const filtered = severityFilter === 'all' ? byStatus : byStatus.filter(b => b.severity === severityFilter)

  const openCount = bugs.filter(b => b.status === 'open').length
  const fixedCount = bugs.filter(b => b.status === 'fixed').length
  const lowCount = bugs.filter(b => b.severity === 'low').length
  const medCount = bugs.filter(b => b.severity === 'medium').length
  const highCount = bugs.filter(b => b.severity === 'high').length

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
        <select id="bug-severity" class="bug-select">
          <option value="low">Low</option>
          <option value="medium" selected>Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" class="bug-btn">Add</button>
      </form>

      ${error ? `<p class="bug-error">${error}</p>` : ''}

      <div class="bug-filters">
        <button class="filter-btn ${statusFilter === 'all' ? 'active' : ''}" data-status="all">
          All (${bugs.length})
        </button>
        <button class="filter-btn ${statusFilter === 'open' ? 'active' : ''}" data-status="open">
          Open (${openCount})
        </button>
        <button class="filter-btn ${statusFilter === 'fixed' ? 'active' : ''}" data-status="fixed">
          Fixed (${fixedCount})
        </button>
      </div>

      <div class="bug-filters severity-filters">
        <button class="filter-btn ${severityFilter === 'all' ? 'active' : ''}" data-severity="all">
          Any severity
        </button>
        <button class="filter-btn ${severityFilter === 'low' ? 'active' : ''}" data-severity="low">
          Low (${lowCount})
        </button>
        <button class="filter-btn ${severityFilter === 'medium' ? 'active' : ''}" data-severity="medium">
          Medium (${medCount})
        </button>
        <button class="filter-btn ${severityFilter === 'high' ? 'active' : ''}" data-severity="high">
          High (${highCount})
        </button>
      </div>

      <ul class="bug-list">
        ${bugs.length === 0
          ? '<li class="bug-empty">No bug notes yet — add one above 👆</li>'
          : filtered.length === 0
            ? '<li class="bug-empty">No bugs match these filters</li>'
            : filtered.map(bug => `
            <li class="bug-item ${bug.status}">
              <span class="bug-title-text">${escapeHtml(bug.title)}</span>
              <span class="bug-badge severity severity-${bug.severity}">${bug.severity}</span>
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

    // duplicate detection (case‑insensitive)
    const lower = title.toLowerCase()
    if (bugs.some(b => b.title.toLowerCase() === lower)) {
      error = `"${title}" is already tracked`
      render()
      return
    }

    error = ''
    const severityEl = document.getElementById('bug-severity') as HTMLSelectElement
    bugs.push({ id: nextId++, title, status: statusEl.value as BugStatus, severity: severityEl.value as Severity })
    titleEl.value = ''
    saveBugs()
    render()
  })

  document.querySelectorAll('.filter-btn[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      statusFilter = (btn as HTMLButtonElement).dataset.status as StatusFilter
      render()
    })
  })

  document.querySelectorAll('.filter-btn[data-severity]').forEach(btn => {
    btn.addEventListener('click', () => {
      severityFilter = (btn as HTMLButtonElement).dataset.severity as SeverityFilter
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
