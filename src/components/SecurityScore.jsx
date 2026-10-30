export default function SecurityScore({ grade, score, status, url, infoFlags }) {
  const gradeColor = {
    'A+': 'var(--green)',
    'A':  'var(--green)',
    'B':  'var(--cyan)',
    'C':  'var(--yellow)',
    'D':  '#f97316',
    'F':  'var(--red)',
  }[grade] ?? 'var(--muted)'

  return (
    <div className="card score-card">
      <div className="score-layout">
        <div className="grade-circle" style={{ borderColor: gradeColor, color: gradeColor }}>
          {grade}
        </div>
        <div className="score-details">
          <div className="score-url">{url}</div>
          <div className="score-bar-row">
            <div className="score-bar-bg">
              <div className="score-bar-fill" style={{ width: `${score}%`, background: gradeColor }} />
            </div>
            <span className="score-pct">{score}/100</span>
          </div>
          <div className="score-meta">
            HTTP {status}
            {infoFlags.length > 0 && (
              <span className="info-flag-row">
                {infoFlags.map(f => (
                  <span key={f.key} className="info-flag" title={`${f.key}: ${f.value}`}>
                    ⚠ {f.key}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
