import { useState } from 'react'

const EXAMPLES = ['https://cloudflare.com', 'https://github.com', 'https://google.com', 'https://deploycraft.io']

export default function HeaderInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('https://deploycraft.io')

  function submit(u) {
    const trimmed = u.trim()
    if (trimmed) onAnalyze(trimmed)
  }

  function handleSubmit(e) {
    e.preventDefault()
    submit(url)
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>HTTP Header Check</h2>
        <p>Enter a URL to inspect response headers and security grade.</p>
      </div>
      <form onSubmit={handleSubmit} className="dns-form">
        <div className="input-row">
          <input
            className="input-field"
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <button className="btn-lookup" type="submit" disabled={loading || !url.trim()}>
            {loading ? 'Analyzing…' : 'Analyze →'}
          </button>
        </div>
        <div className="examples-row">
          <span className="examples-label">EXAMPLES:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              className="example-chip"
              onClick={() => { setUrl(ex); submit(ex) }}
            >
              {ex.replace('https://', '')}
            </button>
          ))}
        </div>
      </form>
    </div>
  )
}
