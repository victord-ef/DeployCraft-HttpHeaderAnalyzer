import { useState } from 'react'

const STATUS_META = {
  pass:    { label: 'Pass',    cls: 'sh-pass',    dot: 'dot-pass' },
  warn:    { label: 'Warn',    cls: 'sh-warn',    dot: 'dot-warn' },
  missing: { label: 'Missing', cls: 'sh-missing', dot: 'dot-missing' },
}

export default function SecurityHeaders({ analysis }) {
  const [expanded, setExpanded] = useState(null)

  function toggle(key) {
    setExpanded(prev => prev === key ? null : key)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Security Headers</h2>
        <p>Click a row to see the raw value and recommendation.</p>
      </div>
      <div className="sh-list">
        {analysis.map(({ def, value, result }) => {
          const meta = STATUS_META[result.status]
          const isOpen = expanded === def.key
          return (
            <div key={def.key} className={`sh-row ${meta.cls} ${isOpen ? 'sh-row-open' : ''}`}>
              <button className="sh-row-btn" onClick={() => toggle(def.key)}>
                <span className={`status-dot ${meta.dot}`} />
                <span className="sh-label">{def.label}</span>
                <span className="sh-abbr">{def.abbr}</span>
                <span className="sh-status-badge">{meta.label}</span>
                <span className="sh-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="sh-detail">
                  <p className="sh-desc">{def.description}</p>
                  {value ? (
                    <div className="sh-value-block">
                      <span className="sh-value-label">Value</span>
                      <code className="sh-value">{value}</code>
                    </div>
                  ) : (
                    <div className="sh-value-block sh-value-absent">
                      Header not present in response
                    </div>
                  )}
                  {result.note && (
                    <div className="sh-note">
                      <span className="sh-note-icon">→</span> {result.note}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
