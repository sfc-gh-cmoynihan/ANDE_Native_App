"use client"
import { useState, useEffect } from "react"
import { AlertCircle, Download, ChevronDown } from "lucide-react"

interface Claim {
  CLAIM_ID: string
  MASTER_CUSTOMER_ID: string
  CUSTOMER_NAME: string
  CUSTOMER_EMAIL: string
  CLAIM_TYPE: string
  CLAIM_DATE: string
  CLAIM_AMOUNT: number
  STATUS: string
  DESCRIPTION: string
  RESOLUTION_DATE: string
  COUNTRY: string
}

const CLAIM_STATUSES = ["Submitted", "Open", "Rejected", "Accepted", "Paid"] as const

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Submitted: { bg: "#42a5f520", text: "#42a5f5" },
  Open: { bg: "#ffa72620", text: "#ffa726" },
  Rejected: { bg: "#ef535020", text: "#ef5350" },
  Accepted: { bg: "#66bb6a20", text: "#66bb6a" },
  Paid: { bg: "#ab47bc20", text: "#ab47bc" },
}

const TYPE_COLORS: Record<string, string> = {
  "Private Motor Insurance": "#2196f3",
  "Commercial Motor Fleet": "#ff9800",
  "Payment Protection Insurance (PPI)": "#4caf50",
  "Reinsurance": "#9c27b0",
}

const FRAUD_SURNAMES = [
  "Boswell", "Loveridge", "Cooper", "Hearn", "Young",
  "Ward", "Connors", "McDonagh", "Joyce", "Fury", "Gorman",
]

export function FraudPanel() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/fraud")
      .then((r) => r.json())
      .then((d) => { setClaims(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (claimId: string, newStatus: string) => {
    setUpdatingStatus(claimId)
    try {
      const res = await fetch("/api/documents/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, status: newStatus }),
      })
      if (res.ok) {
        setClaims((prev) => prev.map((c) => c.CLAIM_ID === claimId ? { ...c, STATUS: newStatus } : c))
      }
    } catch { /* ignore */ }
    setUpdatingStatus(null)
    setStatusMenuOpen(null)
  }

  const groupedBySurname = FRAUD_SURNAMES.map((surname) => {
    const matching = claims.filter((c) => c.CUSTOMER_NAME.toUpperCase().includes(surname.toUpperCase()))
    return { surname, claims: matching }
  }).filter((g) => g.claims.length > 0)

  const johnJoClaims = claims.filter((c) => c.CUSTOMER_NAME.toUpperCase().includes("JOHN JO"))
  const totalValue = claims.reduce((s, c) => s + c.CLAIM_AMOUNT, 0)

  return (
    <div>
      <div className="page-header">
        <h2 style={{ color: "#ef5350" }}>Fraud Investigation</h2>
        <p>Claims flagged for investigation</p>
      </div>

      {loading && <div className="loading"><div className="spinner" /> Loading fraud claims...</div>}

      {!loading && claims.length > 0 && (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{claims.length}</div>
              <div className="stat-label">Flagged Claims</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">EUR {totalValue.toLocaleString()}</div>
              <div className="stat-label">Total Exposure</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{groupedBySurname.length}</div>
              <div className="stat-label">Families Matched</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{johnJoClaims.length}</div>
              <div className="stat-label">"John Jo" Matches</div>
            </div>
          </div>

          {johnJoClaims.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "#ef5350" }}>
                "John Jo" First Name Matches ({johnJoClaims.length})
              </h3>
              {renderClaimCards(johnJoClaims)}
            </div>
          )}

          {groupedBySurname.map(({ surname, claims: famClaims }) => (
            <div key={surname} style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                {surname} ({famClaims.length} claim{famClaims.length !== 1 ? "s" : ""} — EUR {famClaims.reduce((s, c) => s + c.CLAIM_AMOUNT, 0).toLocaleString()})
              </h3>
              {renderClaimCards(famClaims)}
            </div>
          ))}
        </>
      )}

      {!loading && claims.length === 0 && (
        <div className="card" style={{ marginTop: 20, textAlign: "center", color: "var(--text-muted)", padding: 40 }}>
          No fraud-flagged claims found.
        </div>
      )}
    </div>
  )

  function renderClaimCards(items: Claim[]) {
    return items.map((c) => {
      const statusStyle = STATUS_COLORS[c.STATUS] || { bg: "#9e9e9e20", text: "#9e9e9e" }
      const typeColor = TYPE_COLORS[c.CLAIM_TYPE] || "#757575"
      return (
        <div key={c.CLAIM_ID} className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <AlertCircle size={16} color={typeColor} />
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              background: `${typeColor}20`, color: typeColor, textTransform: "uppercase", letterSpacing: "0.5px"
            }}>
              {c.CLAIM_TYPE}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)" }}>
              {c.CLAIM_ID}
            </span>
            <span style={{
              marginLeft: "auto", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4,
              background: statusStyle.bg, color: statusStyle.text
            }}>
              {c.STATUS}
            </span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
            EUR {c.CLAIM_AMOUNT.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
            {c.CUSTOMER_NAME}{c.CUSTOMER_EMAIL ? ` • ${c.CUSTOMER_EMAIL}` : ""} • {c.CLAIM_DATE} • {c.COUNTRY}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-secondary)", background: "var(--bg-secondary)", padding: 10, borderRadius: 6 }}>
            {c.DESCRIPTION}
          </div>
          {c.RESOLUTION_DATE && (
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
              Resolution date: {c.RESOLUTION_DATE}
            </div>
          )}
          <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button
                className="btn"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}
                onClick={() => setStatusMenuOpen(statusMenuOpen === c.CLAIM_ID ? null : c.CLAIM_ID)}
                disabled={updatingStatus === c.CLAIM_ID}
              >
                {updatingStatus === c.CLAIM_ID ? "Updating..." : "Change Status"} <ChevronDown size={12} />
              </button>
              {statusMenuOpen === c.CLAIM_ID && (
                <div style={{
                  position: "absolute", bottom: "100%", right: 0, marginBottom: 4,
                  background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, overflow: "hidden", minWidth: 140
                }}>
                  {CLAIM_STATUSES.map((s) => {
                    const sColor = STATUS_COLORS[s] || { bg: "#9e9e9e20", text: "#9e9e9e" }
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(c.CLAIM_ID, s)}
                        style={{
                          display: "block", width: "100%", padding: "8px 14px", border: "none",
                          background: c.STATUS === s ? sColor.bg : "transparent",
                          color: c.STATUS === s ? sColor.text : "var(--text-primary)",
                          fontSize: 12, fontWeight: c.STATUS === s ? 700 : 500,
                          textAlign: "left", cursor: c.STATUS === s ? "default" : "pointer",
                        }}
                        disabled={c.STATUS === s}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <a
              href={`/api/documents/pdf?claimId=${encodeURIComponent(c.CLAIM_ID)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}
            >
              <Download size={13} /> Download PDF
            </a>
          </div>
        </div>
      )
    })
  }
}
