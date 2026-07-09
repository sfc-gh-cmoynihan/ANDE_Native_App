"use client"

import { useState, useEffect } from "react"
import { MapPin, Wrench, AlertTriangle, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"

const GeoSpatialMap = dynamic(
  () => import("@/components/GeoSpatialMap").then(m => ({ default: m.GeoSpatialMap })),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "var(--bg-secondary)" }}>
        <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={18} />
          Loading map...
        </div>
      </div>
    ),
  }
)

interface Claim {
  CLAIM_ID: string
  CUSTOMER_NAME: string
  CLAIM_DATE: string
  CLAIM_AMOUNT: number
  CLAIM_TYPE: string
  VEHICLE_MODEL: string
  CITY: string
  STATUS: string
  LNG: number
  LAT: number
}

interface Mechanic {
  MECHANIC_ID: string
  GARAGE_NAME: string
  ADDRESS: string
  CITY: string
  POSTCODE: string
  PHONE: string
  RATING: number
  SPECIALIZATION: string
  LNG: number
  LAT: number
}

interface GapZone {
  name: string
  lat: number
  lng: number
  radius: number
}

const GAP_ZONES: GapZone[] = [
  { name: "Cape Wrath, Highland", lat: 58.6256, lng: -4.9998, radius: 40000 },
  { name: "Cornwall (Penzance)", lat: 50.1186, lng: -5.5371, radius: 35000 },
  { name: "North Marden, West Sussex", lat: 50.9562, lng: -0.8785, radius: 15000 },
  { name: "Kettlebaston, Suffolk", lat: 52.1334, lng: 0.8879, radius: 15000 },
  { name: "Fordwich, Kent", lat: 51.3003, lng: 1.1268, radius: 15000 },
  { name: "Manningtree, Essex", lat: 51.9453, lng: 1.0612, radius: 15000 },
  { name: "St Davids, Pembrokeshire", lat: 51.8812, lng: -5.2692, radius: 30000 },
  { name: "Invernaver, Highland", lat: 58.4850, lng: -4.3750, radius: 35000 },
  { name: "Rotherslock, Highland", lat: 57.8900, lng: -5.1500, radius: 30000 },
  { name: "Strumpshaw, Norfolk", lat: 52.6100, lng: 1.4700, radius: 15000 },
  { name: "Taston, Oxfordshire", lat: 51.8750, lng: -1.5200, radius: 15000 },
]

export function GeoSpatialPanel() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [showClaims, setShowClaims] = useState(true)
  const [showMechanics, setShowMechanics] = useState(true)
  const [showGaps, setShowGaps] = useState(true)

  useEffect(() => {
    fetch("/api/geospatial")
      .then((r) => r.json())
      .then((data) => {
        setClaims(data.claims || [])
        setMechanics(data.mechanics || [])
        setStats(data.stats || {})
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="loading"><div className="spinner" /> Loading geospatial data...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h2>GeoSpatial — UK Claims & Mechanic Network</h2>
        <p>Insurance claims distribution with Toyota approved mechanic coverage analysis</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{Number(stats.TOTAL_CLAIMS || 0).toLocaleString()}</div>
          <div className="stat-label">Total UK Claims</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">£{Number(stats.TOTAL_AMOUNT || 0).toLocaleString()}</div>
          <div className="stat-label">Total Claim Value</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#22c55e" }}>{mechanics.length}</div>
          <div className="stat-label">Approved Mechanics</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: "#ef4444" }}>{GAP_ZONES.length}</div>
          <div className="stat-label">Coverage Gaps</div>
        </div>
      </div>

      {/* Layer toggles */}
      <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, padding: "12px 20px", marginBottom: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
          <input type="checkbox" checked={showClaims} onChange={(e) => setShowClaims(e.target.checked)} />
          <MapPin size={14} color="#ef4444" />
          <span>Claims ({claims.length.toLocaleString()} shown)</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
          <input type="checkbox" checked={showMechanics} onChange={(e) => setShowMechanics(e.target.checked)} />
          <Wrench size={14} color="#22c55e" />
          <span>Toyota Mechanics ({mechanics.length})</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
          <input type="checkbox" checked={showGaps} onChange={(e) => setShowGaps(e.target.checked)} />
          <AlertTriangle size={14} color="#f59e0b" />
          <span>Coverage Gaps ({GAP_ZONES.length})</span>
        </label>
      </div>

      {/* Map */}
      <div className="card" style={{ padding: 0, overflow: "hidden", height: 560 }}>
        <GeoSpatialMap
          claims={claims}
          mechanics={mechanics}
          gapZones={GAP_ZONES}
          showClaims={showClaims}
          showMechanics={showMechanics}
          showGaps={showGaps}
        />
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 12, color: "var(--text-muted)", marginTop: 12, paddingLeft: 4 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
          Insurance Claims
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #16a34a", display: "inline-block" }} />
          Toyota Approved Mechanics
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(245, 158, 11, 0.3)", border: "1px dashed #f59e0b", display: "inline-block" }} />
          No Mechanic Coverage
        </span>
      </div>
    </div>
  )
}
