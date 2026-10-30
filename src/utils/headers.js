// Security header definitions — each has a weight (1=standard, 2=critical)
// and an evaluate(value) that returns { status: 'pass'|'warn'|'missing', note }
export const SECURITY_DEFS = [
  {
    key: 'strict-transport-security',
    label: 'Strict-Transport-Security',
    abbr: 'HSTS',
    description: 'Forces HTTPS — prevents protocol downgrade attacks.',
    weight: 2,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      const m = v.match(/max-age=(\d+)/i)
      if (!m) return { status: 'warn', note: 'max-age directive missing' }
      const age = parseInt(m[1])
      if (age < 2592000) return { status: 'warn', note: `max-age ${age}s is too short (min 30 days)` }
      const notes = []
      if (!/includeSubDomains/i.test(v)) notes.push('consider includeSubDomains')
      if (!/preload/i.test(v)) notes.push('consider preload')
      return { status: 'pass', note: notes.join('; ') }
    },
  },
  {
    key: 'content-security-policy',
    label: 'Content-Security-Policy',
    abbr: 'CSP',
    description: "Restricts resource origins — mitigates XSS and data injection.",
    weight: 2,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      const unsafe = []
      if (v.includes("'unsafe-inline'")) unsafe.push("'unsafe-inline'")
      if (v.includes("'unsafe-eval'")) unsafe.push("'unsafe-eval'")
      if (unsafe.length) return { status: 'warn', note: `${unsafe.join(', ')} weakens CSP` }
      return { status: 'pass', note: '' }
    },
  },
  {
    key: 'x-frame-options',
    label: 'X-Frame-Options',
    abbr: 'XFO',
    description: 'Prevents clickjacking by controlling iframe embedding.',
    weight: 1,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      const u = v.toUpperCase().trim()
      if (u === 'DENY' || u === 'SAMEORIGIN') return { status: 'pass', note: '' }
      return { status: 'warn', note: `"${v}" — DENY or SAMEORIGIN preferred` }
    },
  },
  {
    key: 'x-content-type-options',
    label: 'X-Content-Type-Options',
    abbr: 'XCTO',
    description: 'Prevents MIME-sniffing attacks.',
    weight: 1,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      if (v.toLowerCase().trim() === 'nosniff') return { status: 'pass', note: '' }
      return { status: 'warn', note: `Expected "nosniff", got "${v}"` }
    },
  },
  {
    key: 'referrer-policy',
    label: 'Referrer-Policy',
    abbr: 'RP',
    description: 'Controls referrer info leaked to other origins.',
    weight: 1,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      const safe = ['no-referrer', 'no-referrer-when-downgrade', 'origin', 'strict-origin', 'strict-origin-when-cross-origin']
      if (safe.includes(v.toLowerCase().trim())) return { status: 'pass', note: '' }
      if (v.toLowerCase().includes('unsafe-url')) return { status: 'warn', note: '"unsafe-url" leaks full URLs to third parties' }
      return { status: 'pass', note: '' }
    },
  },
  {
    key: 'permissions-policy',
    label: 'Permissions-Policy',
    abbr: 'PP',
    description: 'Controls browser feature access (camera, mic, geolocation, etc.).',
    weight: 1,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      return { status: 'pass', note: '' }
    },
  },
  {
    key: 'cross-origin-opener-policy',
    label: 'Cross-Origin-Opener-Policy',
    abbr: 'COOP',
    description: 'Isolates browsing context — prevents cross-origin window attacks.',
    weight: 1,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      const l = v.toLowerCase().trim()
      if (l === 'same-origin' || l === 'same-origin-allow-popups') return { status: 'pass', note: '' }
      return { status: 'warn', note: `"${v}" — "same-origin" preferred` }
    },
  },
  {
    key: 'cross-origin-embedder-policy',
    label: 'Cross-Origin-Embedder-Policy',
    abbr: 'COEP',
    description: 'Prevents cross-origin resource embedding without explicit permission.',
    weight: 1,
    evaluate(v) {
      if (!v) return { status: 'missing', note: '' }
      const l = v.toLowerCase().trim()
      if (l === 'require-corp' || l === 'credentialless') return { status: 'pass', note: '' }
      return { status: 'warn', note: `"${v}" — "require-corp" preferred` }
    },
  },
]

// Headers that indicate server info exposure (informational flags)
export const INFO_HEADERS = ['server', 'x-powered-by', 'x-aspnet-version', 'x-aspnetmvc-version']

// Proxy-injected headers to exclude from the raw display
const PROXY_HEADERS = new Set([
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-expose-headers',
  'access-control-max-age',
  'x-cors-headers',
  'x-request-url',
  'x-final-url',
])

export function calcScore(analysis) {
  // HSTS + CSP = 20pts each, rest = 10pts each
  const weights = { 2: 20, 1: 10 }
  let earned = 0
  let max = 0

  for (const { def, result } of analysis) {
    const w = weights[def.weight]
    max += w
    if (result.status === 'pass') earned += w
    else if (result.status === 'warn') earned += Math.round(w * 0.5)
  }

  return max > 0 ? Math.round((earned / max) * 100) : 0
}

export function calcGrade(score) {
  if (score >= 90) return 'A+'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 45) return 'C'
  if (score >= 30) return 'D'
  return 'F'
}

function parseHeaders(res) {
  const headers = {}

  // corsproxy.io puts ALL original response headers in x-cors-headers as JSON
  const corsJson = res.headers.get('x-cors-headers')
  if (corsJson) {
    try {
      const parsed = JSON.parse(corsJson)
      if (Array.isArray(parsed)) {
        for (const [k, v] of parsed) headers[k.toLowerCase()] = v
      } else {
        for (const [k, v] of Object.entries(parsed)) headers[k.toLowerCase()] = v
      }
    } catch {}
  }

  // Fill in directly accessible headers (covers cases where x-cors-headers absent)
  for (const [key, value] of res.headers) {
    if (!PROXY_HEADERS.has(key) && !(key in headers)) {
      headers[key] = value
    }
  }

  return headers
}

export async function analyzeUrl(rawUrl) {
  const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`

  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) })

  const headers = parseHeaders(res)

  const analysis = SECURITY_DEFS.map(def => ({
    def,
    value: headers[def.key] ?? null,
    result: def.evaluate(headers[def.key] ?? null),
  }))

  const score = calcScore(analysis)
  const grade = calcGrade(score)

  const infoFlags = INFO_HEADERS
    .filter(h => headers[h])
    .map(h => ({ key: h, value: headers[h] }))

  return {
    url,
    status: res.status,
    headers,
    analysis,
    score,
    grade,
    infoFlags,
  }
}
