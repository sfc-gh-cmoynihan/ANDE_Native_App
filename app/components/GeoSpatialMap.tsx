"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from "react-leaflet"
import { useEffect } from "react"
import L from "leaflet"

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

function Legend({ showClaims, showMechanics, showGaps, claimCount, mechanicCount, gapCount }: {
  showClaims: boolean
  showMechanics: boolean
  showGaps: boolean
  claimCount: number
  mechanicCount: number
  gapCount: number
}) {
  const map = useMap()

  useEffect(() => {
    const legend = new (L.Control as any)({ position: "topleft" })
    legend.onAdd = () => {
      const div = L.DomUtil.create("div")
      div.style.cssText = "background: white; padding: 10px 14px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 12px; line-height: 2;"

      const items: string[] = []
      if (showClaims) {
        items.push(`<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block"></span> Claims (${claimCount.toLocaleString()})</div>`)
      }
      if (showMechanics) {
        items.push(`<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #16a34a;display:inline-block"></span> Toyota Mechanics (${mechanicCount})</div>`)
      }
      if (showGaps) {
        items.push(`<div style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:50%;background:rgba(245,158,11,0.3);border:1px dashed #f59e0b;display:inline-block"></span> Coverage Gaps (${gapCount})</div>`)
      }
      div.innerHTML = `<div style="font-weight:700;margin-bottom:4px;font-size:11px;color:#374151">LAYERS</div>` + items.join("")
      return div
    }
    legend.addTo(map)
    return () => { legend.remove() }
  }, [map, showClaims, showMechanics, showGaps, claimCount, mechanicCount, gapCount])

  return null
}

export function GeoSpatialMap({ claims, mechanics, gapZones, showClaims, showMechanics, showGaps }: {
  claims: Claim[]
  mechanics: Mechanic[]
  gapZones: GapZone[]
  showClaims: boolean
  showMechanics: boolean
  showGaps: boolean
}) {
  return (
    <MapContainer
      center={[54.5, -2.5]}
      zoom={6}
      style={{ height: "100%", width: "100%", borderRadius: "var(--radius)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <Legend
        showClaims={showClaims}
        showMechanics={showMechanics}
        showGaps={showGaps}
        claimCount={claims.length}
        mechanicCount={mechanics.length}
        gapCount={gapZones.length}
      />

      {showClaims && claims.map((claim) => (
        <CircleMarker
          key={claim.CLAIM_ID}
          center={[claim.LAT, claim.LNG]}
          radius={3}
          fillColor="#ef4444"
          fillOpacity={0.6}
          stroke={false}
        >
          <Popup>
            <div style={{ fontSize: 11 }}>
              <p style={{ fontWeight: 700 }}>{claim.CLAIM_ID}</p>
              <p>{claim.CUSTOMER_NAME}</p>
              <p>Toyota {claim.VEHICLE_MODEL}</p>
              <p>{claim.CLAIM_TYPE} - £{claim.CLAIM_AMOUNT?.toLocaleString()}</p>
              <p>{claim.STATUS} | {claim.CITY}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {showMechanics && mechanics.map((mech) => (
        <CircleMarker
          key={mech.MECHANIC_ID}
          center={[mech.LAT, mech.LNG]}
          radius={8}
          fillColor="#22c55e"
          fillOpacity={0.9}
          color="#16a34a"
          weight={2}
        >
          <Popup>
            <div style={{ fontSize: 11 }}>
              <p style={{ fontWeight: 700 }}>{mech.GARAGE_NAME}</p>
              <p>{mech.ADDRESS}, {mech.CITY}</p>
              <p>{mech.POSTCODE}</p>
              <p>Rating: {mech.RATING}/5</p>
              <p>{mech.SPECIALIZATION}</p>
              <p>{mech.PHONE}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {showGaps && gapZones.map((zone) => (
        <Circle
          key={zone.name}
          center={[zone.lat, zone.lng]}
          radius={zone.radius}
          fillColor="#f59e0b"
          fillOpacity={0.15}
          color="#f59e0b"
          weight={2}
          dashArray="5,5"
        >
          <Popup>
            <div style={{ fontSize: 11 }}>
              <p style={{ fontWeight: 700, color: "#dc2626" }}>Coverage Gap</p>
              <p>{zone.name}</p>
              <p>No Toyota Approved Mechanic nearby</p>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  )
}
