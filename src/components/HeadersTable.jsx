import { useState } from 'react'

export default function HeadersTable({ headers }) {
  const [copied, setCopied] = useState(null)
  const [filter, setFilter] = useState('')

  const entries = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .filter(([k, v]) => {
      if (!filter) return true
      const q = filter.toLowerCase()
      return k.includes(q) || v.toLowerCase().includes(q)
    })

  function copy(text, key) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>All Response Headers</h2>
        <p>{Object.keys(headers).length} headers returned</p>
      </div>
      <div className="table-filter-row">
        <input
          className="input-field table-filter-input"
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter headers…"
          spellCheck={false}
        />
      </div>
      <div className="table-wrap">
        <table className="dns-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>HEADER</th>
              <th>VALUE</th>
              <th style={{ width: '52px' }}></th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr><td colSpan={3} style={{ color: 'var(--muted)', padding: '1.25rem 1rem' }}>No headers match "{filter}"</td></tr>
            ) : entries.map(([key, value]) => (
              <tr key={key}>
                <td className="td-mono td-nowrap">{key}</td>
                <td className="td-mono td-value" style={{ wordBreak: 'break-all' }}>{value}</td>
                <td>
                  <button
                    className="copy-btn"
                    onClick={() => copy(`${key}: ${value}`, key)}
                    title="Copy header"
                  >
                    {copied === key ? '✓' : 'copy'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
