import { useEffect, useRef, useState } from 'react'

const LEGO_COLORS = ['#E53935','#1565C0','#FFD700','#FF9800','#4CAF50','#AB47BC','#00897B','#D81B60']
const FACTS = [
  'Building the Lego world…',
  'Placing bricks…',
  'Painting minifigures…',
  'Paving the roads…',
  'Planting trees…',
  'Turning on street lamps…',
  'Parking the cars…',
  'Ready to explore!',
]

function LegoStud({ x, y, color }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 44, height: 44,
      background: color,
      borderRadius: 6,
      boxShadow: `inset 0 -4px 0 rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.3)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%',
        background: 'rgba(255,255,255,0.18)',
        border: '2px solid rgba(255,255,255,0.25)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
      }}/>
    </div>
  )
}

export default function Loader({ onEnter }) {
  const [progress, setProgress] = useState(0)
  const [fact, setFact] = useState(0)
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const rafRef = useRef()

  useEffect(() => {
    const start = performance.now()
    const duration = 3800
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      // Ease-out cubic with natural pauses
      const eased = p < 0.7 ? p * 1.1 : 0.77 + (p - 0.7) * 0.77
      setProgress(Math.min(100, Math.round(eased * 100)))
      setFact(Math.floor(p * (FACTS.length - 1)))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
      else setReady(true)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const handleEnter = () => {
    setEntered(true)
    setTimeout(onEnter, 700)
  }

  // Generate brick grid
  const studs = []
  const cols = Math.ceil(window.innerWidth / 52) + 1
  const rows = Math.ceil(window.innerHeight / 52) + 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      studs.push({ x: c*52-4, y: r*52-4, color: LEGO_COLORS[(r*cols+c) % LEGO_COLORS.length] })
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      opacity: entered ? 0 : 1,
      transition: 'opacity 0.7s ease',
      pointerEvents: entered ? 'none' : 'all',
      background:'skyblue'
    }}>
      {/* Lego brick grid background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {studs.map((s, i) => <LegoStud key={i} x={s.x} y={s.y} color={s.color} />)}
      </div>

      {/* Dark overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.82) 100%)',
      }} />

      {/* Center card */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
      }}>
        <div style={{
          background: 'rgba(15,15,15,0.88)',
          backdropFilter: 'blur(24px)',
          borderRadius: 24,
          padding: '44px 52px 40px',
          border: '2px solid rgba(255,215,0,0.25)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          minWidth: 380, maxWidth: 440,
        }}>
          {/* Logo */}
          <div style={{ display:'flex', gap:10, marginBottom:8 }}>
            {['#E53935','#FFD700','#1565C0'].map((c,i)=>(
              <div key={i} style={{
                width:28, height:28, background:c, borderRadius:5,
                boxShadow:`inset 0 -3px 0 rgba(0,0,0,0.3)`,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{ width:16,height:16,borderRadius:'50%',background:'rgba(255,255,255,0.2)',border:'1.5px solid rgba(255,255,255,0.3)' }}/>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: 42, fontWeight: 900, color: '#FFD700',
            textShadow: '3px 3px 0 #E65100, 6px 6px 0 rgba(0,0,0,0.4)',
            letterSpacing: 4, marginBottom: 4,
            fontFamily: "'Segoe UI Black','Arial Black',sans-serif",
          }}>LEGO WORLD</div>

          <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)', letterSpacing:3, marginBottom:36 }}>
            3D INTERACTIVE DEMO
          </div>

          {/* Progress bar */}
          <div style={{ width:'100%', marginBottom:12 }}>
            <div style={{
              width:'100%', height:12, background:'rgba(255,255,255,0.1)',
              borderRadius:6, overflow:'hidden',
              border:'1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{
                height:'100%',
                width: `${progress}%`,
                borderRadius:6,
                background: 'linear-gradient(90deg, #E65100, #FFD700, #4CAF50)',
                transition: 'width 0.1s linear',
                boxShadow: '0 0 12px rgba(255,215,0,0.5)',
              }}/>
            </div>
          </div>

          {/* Brick-segmented progress indicator */}
          <div style={{ display:'flex', gap:5, width:'100%', marginBottom:24 }}>
            {LEGO_COLORS.map((c,i)=>(
              <div key={i} style={{
                flex:1, height:10, borderRadius:3,
                background: (i / LEGO_COLORS.length) * 100 <= progress ? c : 'rgba(255,255,255,0.08)',
                transition:'background 0.3s ease',
                boxShadow: (i/LEGO_COLORS.length)*100<=progress ? `0 0 6px ${c}88` : 'none',
              }}/>
            ))}
          </div>

          {/* Fact text */}
          <div style={{
            fontSize:14, color:'rgba(255,255,255,0.6)', marginBottom:32,
            letterSpacing:0.4, textAlign:'center', minHeight:22,
            transition:'opacity 0.3s',
          }}>{FACTS[fact]}</div>

          {/* Enter button */}
          <button
            onClick={ready ? handleEnter : undefined}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: 12,
              border: '2.5px solid',
              borderColor: ready ? '#FFD700' : 'rgba(255,255,255,0.15)',
              background: ready
                ? 'linear-gradient(135deg, #E65100 0%, #FFD700 50%, #E65100 100%)'
                : 'rgba(255,255,255,0.05)',
              backgroundSize: '200% 100%',
              color: ready ? '#1a1a1a' : 'rgba(255,255,255,0.3)',
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: 3,
              cursor: ready ? 'pointer' : 'not-allowed',
              fontFamily: "'Segoe UI Black','Arial Black',sans-serif",
              transition: 'all 0.35s ease',
              transform: ready ? 'scale(1)' : 'scale(0.98)',
              boxShadow: ready ? '0 0 30px rgba(255,215,0,0.4), 0 8px 24px rgba(0,0,0,0.3)' : 'none',
              animation: ready ? 'pulse-btn 1.8s ease-in-out infinite' : 'none',
            }}
          >
            {ready ? '🧱  ENTER LEGO WORLD' : `LOADING… ${progress}%`}
          </button>

          <style>{`
            @keyframes pulse-btn {
              0%,100% { box-shadow:0 0 30px rgba(255,215,0,0.4),0 8px 24px rgba(0,0,0,0.3); }
              50% { box-shadow:0 0 50px rgba(255,215,0,0.75),0 12px 32px rgba(0,0,0,0.4); }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}
