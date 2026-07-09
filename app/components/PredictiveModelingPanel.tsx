"use client"
import { useState, useEffect } from "react"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

interface PredictionData {
  monthlyHistory: { MONTH: string; CLAIMS: number; TOTAL_AMOUNT: number }[]
  seasonalIndices: { monthNum: number; monthName: string; claims: number; totalAmount: number; seasonalIndex: number }[]
  policyYearRisk: { POLICY_YEAR: number; CLAIMS: number; AVG_AMOUNT: number; TOTAL_AMOUNT: number }[]
  claimTypes: { CLAIM_TYPE: string; CLAIMS: number; TOTAL_AMOUNT: number }[]
  forecast: { month: string; monthName: string; predicted: number; seasonalFactor: number }[]
  staffing: { month: string; monthName: string; predicted: number; seasonalFactor: number; recommendedAgents: number }[]
  kpis: {
    peakMonth: string
    peakMonthClaims: number
    avgClaimsPerMonth: number
    totalHistoricalClaims: number
    peakForecastMonth: string
    peakForecastClaims: number
    highestRiskPolicyYear: number | string
  }
}

export function PredictiveModelingPanel() {
  const [data, setData] = useState<PredictionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/predictions")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#64748b" }}>Loading predictions...</div>
  if (error) return <div style={{ padding: 60, textAlign: "center", color: "#ef4444" }}>Error: {error}</div>
  if (!data) return null

  // Combine history + forecast for the main chart
  const combinedTimeline = [
    ...data.monthlyHistory.map(h => ({ month: h.MONTH, actual: h.CLAIMS, predicted: null as number | null })),
    ...data.forecast.map(f => ({ month: f.month, actual: null as number | null, predicted: f.predicted })),
  ]

  // Policy year data with risk labels
  const policyYearData = data.policyYearRisk.map(r => ({
    year: `Year ${r.POLICY_YEAR}`,
    claims: r.CLAIMS,
    avgAmount: Math.round(r.AVG_AMOUNT),
  }))

  // Seasonal heatmap data
  const seasonalData = data.seasonalIndices.map(s => ({
    month: s.monthName,
    claims: s.claims,
    index: Math.round(s.seasonalIndex * 100) / 100,
  }))

  return (
    <div style={{ padding: "24px 32px", height: "calc(100vh - 120px)", overflowY: "auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Predictive Claims Modeling</h1>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Forecast claims volumes by season and policy year to plan call center staffing</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        <KPICard label="Peak Season" value={data.kpis.peakMonth} subtitle={`${data.kpis.peakMonthClaims} claims historically`} color="#f59e0b" />
        <KPICard label="Avg Claims/Month" value={String(data.kpis.avgClaimsPerMonth)} subtitle="across all months" color="#0ea5e9" />
        <KPICard label="Highest Risk Year" value={`Year ${data.kpis.highestRiskPolicyYear}`} subtitle="policy year with most claims" color="#ef4444" />
        <KPICard label="Peak Forecast" value={String(data.kpis.peakForecastClaims)} subtitle={`projected for ${data.kpis.peakForecastMonth}`} color="#10b981" />
      </div>

      {/* Claims Forecast Timeline */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Claims Volume: History & 12-Month Forecast</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={combinedTimeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={1} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="actual" name="Actual Claims" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" name="Forecast" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeDasharray="5 5" connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        {/* Seasonal Pattern */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Seasonal Claims Pattern</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(value: number, name: string) => [value, name === "claims" ? "Claims" : "Seasonal Index"]} />
              <Bar dataKey="claims" name="Claims" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>Higher claims in spring/summer months suggest increased driving activity and weather-related incidents.</p>
        </div>

        {/* Policy Year Risk */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Policy Year Risk Curve</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={policyYearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="claims" name="Claims" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgAmount" name="Avg Amount (€)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>Year 2 policies show higher average claim amounts — consider renewal pricing adjustments.</p>
        </div>
      </div>

      {/* Staffing Planner */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px 0" }}>Call Center Staffing Planner</h2>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px 0" }}>Recommended agents based on forecasted claims volume (1 agent ≈ 15 claims/day capacity)</p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data.staffing} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} interval={0} />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: "Claims", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: "Agents", angle: 90, position: "insideRight", style: { fontSize: 11 } }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line yAxisId="left" type="monotone" dataKey="predicted" name="Predicted Claims" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="recommendedAgents" name="Recommended Agents" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Staffing Table */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px 0" }}>Monthly Staffing Recommendations</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)" }}>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Month</th>
              <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Forecast Claims</th>
              <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Seasonal Factor</th>
              <th style={{ textAlign: "right", padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Agents Needed</th>
              <th style={{ textAlign: "left", padding: "8px 12px", color: "#64748b", fontWeight: 600 }}>Staffing Level</th>
            </tr>
          </thead>
          <tbody>
            {data.staffing.map((row, i) => {
              const level = row.seasonalFactor >= 1.3 ? "High" : row.seasonalFactor >= 0.9 ? "Normal" : "Low"
              const levelColor = level === "High" ? "#ef4444" : level === "Normal" ? "#f59e0b" : "#10b981"
              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 12px" }}>{row.month}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>{row.predicted}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>{row.seasonalFactor}x</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 600 }}>{row.recommendedAgents}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: `${levelColor}15`, color: levelColor }}>{level}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KPICard({ label, value, subtitle, color }: { label: string; value: string; subtitle: string; color: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: "20px 24px" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{subtitle}</div>
    </div>
  )
}
