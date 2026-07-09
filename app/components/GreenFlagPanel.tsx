"use client"
import { useState, useEffect } from "react"
import { CheckCircle, XCircle, Shield } from "lucide-react"

interface AgentSummary {
  AGENT_NAME: string
  TOTAL_CALLS: number
  COMPLIANT_CALLS: number
  COMPLIANCE_PCT: number
}

interface CallDetail {
  CALL_ID: string
  AGENT_NAME: string
  CALL_DATE: string
  DURATION_SECONDS: number
  CALL_TYPE: string
  SENTIMENT: string
  FCA_COMPLIANT: boolean
}

export function GreenFlagPanel() {
  const [summary, setSummary] = useState<AgentSummary[]>([])
  const [detail, setDetail] = useState<CallDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/greenflag")
      .then((r) => r.json())
      .then((d) => {
        setSummary(d.summary || [])
        setDetail(d.detail || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading compliance data...</div>

  const totalCalls = summary.reduce((a, b) => a + b.TOTAL_CALLS, 0)
  const totalCompliant = summary.reduce((a, b) => a + b.COMPLIANT_CALLS, 0)
  const overallPct = totalCalls > 0 ? (totalCompliant * 100 / totalCalls).toFixed(1) : "0"

  const filteredCalls = selectedAgent
    ? detail.filter((c) => c.AGENT_NAME === selectedAgent)
    : detail

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Shield size={28} color="#16a34a" />
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: "var(--text-primary)" }}>FCA Compliance — Green Flag</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Checks each call for the required FCA regulatory disclosure statement
          </p>
        </div>
      </div>

      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 12, color: "#166534" }}>
        <strong>Required statement:</strong> &ldquo;Toyota Insurance Services (operated as Toyota Insurance Management UK Limited) is authorized and regulated by the Financial Conduct Authority (FCA) under the Firm Reference Number 983839&rdquo;
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Total Calls</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)" }}>{totalCalls}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Compliant Calls</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{totalCompliant}</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 8, padding: 20, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Overall Compliance</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: Number(overallPct) >= 80 ? "#16a34a" : Number(overallPct) >= 60 ? "#ca8a04" : "#dc2626" }}>{overallPct}%</div>
        </div>
      </div>

      {/* Agent Summary Table */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>Compliance by Agent</h3>
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 32 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600 }}>Agent</th>
              <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>Total Calls</th>
              <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>Compliant</th>
              <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>Non-Compliant</th>
              <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>Rate</th>
              <th style={{ padding: "10px 16px", textAlign: "center", fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((agent) => (
              <tr
                key={agent.AGENT_NAME}
                onClick={() => setSelectedAgent(selectedAgent === agent.AGENT_NAME ? null : agent.AGENT_NAME)}
                style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: selectedAgent === agent.AGENT_NAME ? "#f0fdf4" : "transparent" }}
              >
                <td style={{ padding: "10px 16px", fontWeight: 500 }}>{agent.AGENT_NAME}</td>
                <td style={{ padding: "10px 16px", textAlign: "center" }}>{agent.TOTAL_CALLS}</td>
                <td style={{ padding: "10px 16px", textAlign: "center", color: "#16a34a" }}>{agent.COMPLIANT_CALLS}</td>
                <td style={{ padding: "10px 16px", textAlign: "center", color: "#dc2626" }}>{agent.TOTAL_CALLS - agent.COMPLIANT_CALLS}</td>
                <td style={{ padding: "10px 16px", textAlign: "center" }}>
                  <span style={{
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: agent.COMPLIANCE_PCT >= 80 ? "#dcfce7" : agent.COMPLIANCE_PCT >= 60 ? "#fef9c3" : "#fee2e2",
                    color: agent.COMPLIANCE_PCT >= 80 ? "#166534" : agent.COMPLIANCE_PCT >= 60 ? "#854d0e" : "#991b1b",
                  }}>
                    {agent.COMPLIANCE_PCT}%
                  </span>
                </td>
                <td style={{ padding: "10px 16px", textAlign: "center" }}>
                  {agent.COMPLIANCE_PCT >= 80
                    ? <CheckCircle size={18} color="#16a34a" />
                    : agent.COMPLIANCE_PCT >= 60
                      ? <Shield size={18} color="#ca8a04" />
                      : <XCircle size={18} color="#dc2626" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Call Detail */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "var(--text-primary)" }}>
        Call Detail {selectedAgent && <span style={{ fontWeight: 400, color: "#64748b" }}>— {selectedAgent}</span>}
      </h3>
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", maxHeight: 400, overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid var(--border)", position: "sticky", top: 0 }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Call ID</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Agent</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600 }}>Date</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>Duration</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>Type</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 600 }}>FCA Statement</th>
            </tr>
          </thead>
          <tbody>
            {filteredCalls.map((call) => (
              <tr key={call.CALL_ID} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11 }}>{call.CALL_ID}</td>
                <td style={{ padding: "8px 12px" }}>{call.AGENT_NAME}</td>
                <td style={{ padding: "8px 12px", color: "#64748b" }}>{new Date(call.CALL_DATE).toLocaleDateString("en-IE")}</td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>{Math.floor(call.DURATION_SECONDS / 60)}m {call.DURATION_SECONDS % 60}s</td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <span style={{ padding: "2px 6px", borderRadius: 4, background: "#e0f2fe", color: "#0369a1", fontSize: 11 }}>{call.CALL_TYPE}</span>
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  {call.FCA_COMPLIANT
                    ? <CheckCircle size={16} color="#16a34a" />
                    : <XCircle size={16} color="#dc2626" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
