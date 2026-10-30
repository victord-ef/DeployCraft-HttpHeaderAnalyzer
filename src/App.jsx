import { useState } from 'react'
import HeaderInput from './components/HeaderInput'
import SecurityScore from './components/SecurityScore'
import SecurityHeaders from './components/SecurityHeaders'
import HeadersTable from './components/HeadersTable'
import { analyzeUrl } from './utils/headers'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleAnalyze(url) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      setResult(await analyzeUrl(url))
    } catch (e) {
      setError(e.message ?? 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="breadcrumb">
          <a href="https://deploycraft.io" className="brand">DeployCraft.io</a>
          <span className="sep">/</span>
          <span className="crumb">HTTP Header Analyzer</span>
        </div>
        <a href="https://deploycraft.io/tools/networking/" className="header-link">
          🌐 Networking Tools
        </a>
      </header>

      <main className="app-main">
        <div className="page-hero">
          <h1>HTTP Header Analyzer</h1>
          <p>Inspect response headers and get a security grade — HSTS, CSP, X-Frame-Options, and more.</p>
        </div>

        <HeaderInput onAnalyze={handleAnalyze} loading={loading} />

        {loading && (
          <div className="loading-box">
            <span className="spinner" />
            Fetching headers…
          </div>
        )}

        {error && (
          <div className="error-box">
            ⚠ {error}
            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', opacity: 0.75 }}>
              Make sure the URL is reachable and includes a protocol (https://…)
            </div>
          </div>
        )}

        {result && !loading && (
          <>
            <SecurityScore
              grade={result.grade}
              score={result.score}
              status={result.status}
              url={result.url}
              infoFlags={result.infoFlags}
            />
            <SecurityHeaders analysis={result.analysis} />
            <HeadersTable headers={result.headers} />
          </>
        )}
      </main>
    </div>
  )
}
