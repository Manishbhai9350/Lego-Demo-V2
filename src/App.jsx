import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Environment } from '@react-three/drei'
import { Suspense, useState } from 'react'
import LegoWorld from './components/LegoWorld'
import LegoWorld2 from './components/LegoWorld2'
import LegoCharacter from './components/LegoCharacter'
import Loader from './components/Loader'
import { CHARACTERS } from './data'
import { useStore } from './store'

function Lighting() {
  return (
    <>
      {/* Bright ambient — fills shadows nicely */}
      <ambientLight intensity={0.7} color="#fff8e8" />

      <directionalLight position={[10, 20, 10]} intensity={1.5} />

      {/* Main sun — sharp + warm */}
      <directionalLight
        position={[15, 28, 12]}
        intensity={1.6}
        color="#fff5c0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={100}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0005}
      />

      {/* Cool fill from opposite side */}
      <directionalLight position={[-10, 8, -8]} intensity={0.5} color="#c8e8ff" />

      {/* Ground bounce */}
      <hemisphereLight skyColor="#87CEEB" groundColor="#4CAF50" intensity={0.45} />

      {/* Warm rim from behind */}
      <directionalLight position={[0, 6, -20]} intensity={0.3} color="#FFE082" />
    </>
  )
}

function SceneReset() {
  const setSelectedChar = useStore(s => s.setSelectedChar)
  return (
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.2,0]}
      onClick={() => setSelectedChar(null)}>
      <planeGeometry args={[300,300]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

export default function App() {
  const [entered, setEntered] = useState(false)

  return (
    <div style={{ width:'100vw', height:'100vh', position:'relative' }}>
      {/* Loader */}
      {!entered && <Loader onEnter={() => setEntered(true)} />}

      {/* HUD */}
      <div style={{
        position:'absolute', top:20, left:'50%', transform:'translateX(-50%)',
        zIndex:10, textAlign:'center', pointerEvents:'none',
        opacity: entered ? 1 : 0, transition:'opacity 0.8s 0.3s',
      }}>
        <div style={{
          fontSize:26, fontWeight:900, color:'#FFD700',
          textShadow:'3px 3px 0 #E65100, 6px 6px 0 rgba(0,0,0,0.25)',
          letterSpacing:3, fontFamily:"'Segoe UI Black','Arial Black',sans-serif",
        }}>🧱 LEGO WORLD</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', letterSpacing:2.5, marginTop:5 }}>
          CLICK A CHARACTER TO INSPECT
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{
        position:'absolute', bottom:24, left:'50%', transform:'translateX(-50%)',
        zIndex:10, pointerEvents:'none',
        background:'rgba(0,0,0,0.52)', backdropFilter:'blur(10px)',
        color:'#FFD700', fontSize:13, fontWeight:600,
        padding:'9px 22px', borderRadius:30, letterSpacing:0.4,
        whiteSpace:'nowrap',
        opacity: entered ? 1 : 0, transition:'opacity 0.8s 0.5s',
        display:'flex',
        flexWrap:'wrap',
        justifyContent:'center'
      }}>
        🖱 Drag to rotate &nbsp;·&nbsp; Scroll to zoom &nbsp;·&nbsp; Click character to inspect
      </div>

      <Canvas
        shadows
        camera={{ position: [0,0, 10], fov: innerWidth >= 900 ? 50 : 75 }}
        style={{ background:'#87CEEB' }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        performance={{ min: 0.5 }}
        frameloop="demand"
      >
        <Sky
          distance={450000}
          sunPosition={[15, 28, 12]}
          inclination={0.49}
          azimuth={0.26}
          rayleigh={0.8}
          turbidity={6}
        />

        <Lighting />

        <Suspense fallback={null}>
          <LegoWorld2 />
          {CHARACTERS.map(char => (
            <LegoCharacter key={char.id} char={char} />
          ))}
        </Suspense>

        <SceneReset />


        <OrbitControls
          enablePan={false}
          minDistance={innerWidth >= 900 ? 15 : 8 }
          maxDistance={35}
          maxPolarAngle={Math.PI / 2.1}
          enableDamping
          dampingFactor={0.08}
          target={[0,2.5,0]}
          makeDefault
        />
      </Canvas>
    </div>
  )
}
