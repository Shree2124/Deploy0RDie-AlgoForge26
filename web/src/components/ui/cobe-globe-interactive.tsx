"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

interface InteractiveMarker {
  id: string
  location: [number, number]
  name: string
  users: number
}

interface GlobeInteractiveProps {
  markers?: InteractiveMarker[]
  className?: string
  speed?: number
}

const defaultMarkers: InteractiveMarker[] = [
  { id: "delhi", location: [28.61, 77.21], name: "Delhi", users: 4200 },
  { id: "mumbai", location: [19.08, 72.88], name: "Mumbai", users: 3800 },
  { id: "bangalore", location: [12.97, 77.59], name: "Bangalore", users: 2900 },
  { id: "london", location: [51.51, -0.13], name: "London", users: 1420 },
  { id: "newyork", location: [40.71, -74.01], name: "New York", users: 1850 },
  { id: "tokyo", location: [35.68, 139.65], name: "Tokyo", users: 2100 },
  { id: "sydney", location: [-33.87, 151.21], name: "Sydney", users: 734 },
  { id: "nairobi", location: [-1.29, 36.82], name: "Nairobi", users: 567 },
]

export function GlobeInteractive({
  markers = defaultMarkers,
  className = "",
  speed = 0.003,
}: GlobeInteractiveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0) return
      if (globe) return

      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width, height: width,
        phi: 1.2, theta: 0.2, dark: 0, diffuse: 1.5,
        mapSamples: 16000, mapBrightness: 10,
        baseColor: [0.788, 0.984, 1],       // #c9fbff
        markerColor: [0.341, 0.451, 0.478],  // #57737a
        glowColor: [0.522, 0.741, 0.749],    // #85bdbf
        markerElevation: 0,
        markers: markers.map((m) => ({ location: m.location, size: 0.06, id: m.id })),
        arcs: [], arcColor: [0.341, 0.451, 0.478],
        arcWidth: 0.5, arcHeight: 0.25, opacity: 0.85,
      })

      function animate() {
        if (!isPausedRef.current) phi += speed
        globe!.update({
          phi: phi + phiOffsetRef.current + dragOffset.current.phi,
          theta: 0.2 + thetaOffsetRef.current + dragOffset.current.theta,
        })
        animationId = requestAnimationFrame(animate)
      }
      animate()
      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    if (canvas.offsetWidth > 0) {
      init()
    } else {
      const ro = new ResizeObserver((entries) => {
        if (entries[0]?.contentRect.width > 0) {
          ro.disconnect()
          init()
        }
      })
      ro.observe(canvas)
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [markers, speed])

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      <style>{`
        @keyframes fade-slide-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 0.8; transform: translateY(0); }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%", height: "100%", cursor: "grab", opacity: 0,
          transition: "opacity 1.2s ease", borderRadius: "50%", touchAction: "none",
        }}
      />
      {markers.map((m) => (
        <div
          key={m.id}
          onClick={() => setExpanded(expanded === m.id ? null : m.id)}
          style={{
            position: "absolute",
            // CSS Anchor Positioning
            positionAnchor: `--cobe-${m.id}`,
            bottom: "anchor(top)",
            left: "anchor(center)",
            translate: "-50% 0",
            marginBottom: 6,
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "center",
            padding: expanded === m.id ? "0.4rem 0.6rem" : "0.3rem 0.5rem",
            background: "#040f0f",
            color: "#c2fcf7",
            borderRadius: 3,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(4,15,15,0.3)",
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            transition: "opacity 0.4s, filter 0.4s, transform 0.2s, padding 0.2s",
            zoom: expanded === m.id ? 1.05 : 1,
          }}
        >
          <span style={{
            fontFamily: "monospace", fontSize: "0.6rem", fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase" as const,
          }}>{m.name}</span>
          {expanded === m.id && (
            <span style={{
              fontFamily: "system-ui, sans-serif", fontSize: "0.55rem",
              opacity: 0.8, marginTop: "0.15rem",
              animation: "fade-slide-in 0.2s ease-out",
              color: "#85bdbf",
            }}>
              {m.users.toLocaleString()} audits
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
