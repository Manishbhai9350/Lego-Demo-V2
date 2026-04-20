// import { useMemo } from 'react'
// import { InstancedStuds, InstancedBoxes, InstancedWindows, InstancedClouds } from './Instanced'

// const BRICK_PALETTE = [
//   '#E53935','#1565C0','#FFD700','#FF9800',
//   '#4CAF50','#AB47BC','#00897B','#F4511E',
//   '#D81B60','#0288D1',
// ]

// function darken(hex, f = 0.72) {
//   const n = parseInt(hex.replace('#',''), 16)
//   const r = Math.floor(((n >> 16) & 0xff) * f)
//   const g = Math.floor(((n >> 8) & 0xff) * f)
//   const b = Math.floor((n & 0xff) * f)
//   return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')
// }

// function LegoBuilding({ position, color, floors = 6, width = 2.8, depth = 2.8 }) {
//   const alt = darken(color, 0.82)
//   const floorInst = useMemo(() => Array.from({ length: floors }, (_, i) => ({
//     position: [position[0], position[1] + 0.32 + i * 0.62, position[2]],
//     color: i % 2 === 0 ? color : alt,
//     scale: [width, 0.58, depth],
//   })), [position, color, alt, floors, width, depth])

//   const studPos = useMemo(() => {
//     const arr = []
//     const cols = Math.max(2, Math.round(width / 0.85))
//     const rows = Math.max(2, Math.round(depth / 0.85))
//     for (let f = 0; f < floors; f++) {
//       const topY = position[1] + 0.32 + f * 0.62 + 0.29 + 0.055
//       for (let c = 0; c < cols; c++)
//         for (let r = 0; r < rows; r++)
//           arr.push([position[0] - width/2 + (c+0.5)*(width/cols), topY, position[2] - depth/2 + (r+0.5)*(depth/rows)])
//     }
//     return arr
//   }, [position, floors, width, depth])

//   const winPos = useMemo(() => {
//     const arr = []
//     const cols = Math.max(2, Math.round(width / 1.1))
//     for (let f = 0; f < floors - 1; f++) {
//       const y = position[1] + 0.52 + f * 0.62
//       for (let c = 0; c < cols; c++) {
//         const x = position[0] - width/2 + (c+0.5)*(width/cols)
//         arr.push([x, y, position[2] + depth/2 + 0.04])
//         arr.push([x, y, position[2] - depth/2 - 0.04, Math.PI])
//       }
//     }
//     return arr
//   }, [position, floors, width, depth])

//   const topY = position[1] + 0.32 + floors * 0.62

//   return (
//     <>
//       <InstancedBoxes instances={floorInst} args={[1,1,1]} />
//       <InstancedStuds positions={studPos} color={darken(color, 0.65)} radius={0.12} height={0.1} />
//       <InstancedWindows positions={winPos} />
//       {/* Roof slab */}
//       <mesh position={[position[0], topY, position[2]]} castShadow>
//         <boxGeometry args={[width+0.15, 0.32, depth+0.15]} />
//         <meshLambertMaterial color="#1a1a1a" />
//       </mesh>
//       {/* Roof penthouse */}
//       <mesh position={[position[0], topY+0.26, position[2]]} castShadow>
//         <boxGeometry args={[width*0.5, 0.42, depth*0.5]} />
//         <meshLambertMaterial color={darken(color,0.55)} />
//       </mesh>
//     </>
//   )
// }

// function LegoTrees({ positions }) {
//   const trunkInst = useMemo(() => positions.map(([x,y,z]) =>
//     ({ position:[x,y+0.9,z], color:'#6D4C41', scale:[0.42,1.8,0.42] })), [positions])
//   const l1 = useMemo(() => positions.map(([x,y,z]) =>
//     ({ position:[x,y+2.2,z], color:'#2E7D32', scale:[2.2,0.58,2.2] })), [positions])
//   const l1Studs = useMemo(() => positions.flatMap(([x,y,z]) => {
//     const a=[]
//     for(let c=0;c<2;c++) for(let r=0;r<2;r++)
//       a.push([x-0.55+c*1.1, y+2.2+0.34, z-0.55+r*1.1])
//     return a
//   }), [positions])
//   const l2 = useMemo(() => positions.map(([x,y,z]) =>
//     ({ position:[x,y+2.76,z], color:'#388E3C', scale:[1.6,0.58,1.6] })), [positions])
//   const l3 = useMemo(() => positions.map(([x,y,z]) =>
//     ({ position:[x,y+3.28,z], color:'#43A047', scale:[1.05,0.58,1.05] })), [positions])

//   return (
//     <>
//       <InstancedBoxes instances={trunkInst} args={[1,1,1]} />
//       <InstancedBoxes instances={l1} args={[1,1,1]} />
//       <InstancedStuds positions={l1Studs} color="#1B5E20" radius={0.14} />
//       <InstancedBoxes instances={l2} args={[1,1,1]} />
//       <InstancedBoxes instances={l3} args={[1,1,1]} />
//     </>
//   )
// }

// function StreetLamp({ position }) {
//   return (
//     <group position={position}>
//       <mesh castShadow>
//         <cylinderGeometry args={[0.07,0.11,3.2,8]} />
//         <meshLambertMaterial color="#546E7A" />
//       </mesh>
//       <mesh position={[0.38,1.45,0]} castShadow>
//         <boxGeometry args={[0.76,0.09,0.09]} />
//         <meshLambertMaterial color="#546E7A" />
//       </mesh>
//       <mesh position={[0.74,1.36,0]}>
//         <sphereGeometry args={[0.16,8,8]} />
//         <meshLambertMaterial color="#FFF9C4" emissive="#FFEE58" emissiveIntensity={1.4} />
//       </mesh>
//       <pointLight position={[0.74,1.36,0]} intensity={0.7} distance={6} color="#FFE082" />
//     </group>
//   )
// }

// function Bench({ position, ry=0 }) {
//   return (
//     <group position={position} rotation={[0,ry,0]}>
//       <mesh castShadow position={[0,0.48,0]}>
//         <boxGeometry args={[1.1,0.1,0.38]} />
//         <meshLambertMaterial color="#8D6E63" />
//       </mesh>
//       <mesh castShadow position={[0,0.68,-0.16]}>
//         <boxGeometry args={[1.1,0.36,0.08]} />
//         <meshLambertMaterial color="#8D6E63" />
//       </mesh>
//       {[-0.44,0.44].map((x,i)=>(
//         <mesh key={i} castShadow position={[x,0.24,0]}>
//           <boxGeometry args={[0.1,0.48,0.38]} />
//           <meshLambertMaterial color="#6D4C41" />
//         </mesh>
//       ))}
//     </group>
//   )
// }

// function Fountain({ position }) {
//   return (
//     <group position={position}>
//       <mesh castShadow receiveShadow>
//         <cylinderGeometry args={[2.2,2.4,0.48,20]} />
//         <meshLambertMaterial color="#90A4AE" />
//       </mesh>
//       <mesh castShadow position={[0,0.6,0]}>
//         <cylinderGeometry args={[0.25,0.32,1.2,10]} />
//         <meshLambertMaterial color="#78909C" />
//       </mesh>
//       <mesh position={[0,1.26,0]}>
//         <cylinderGeometry args={[0.65,0.6,0.2,16]} />
//         <meshLambertMaterial color="#90A4AE" />
//       </mesh>
//       <mesh position={[0,0.27,0]} rotation={[-Math.PI/2,0,0]}>
//         <circleGeometry args={[1.95,24]} />
//         <meshLambertMaterial color="#29B6F6" transparent opacity={0.78} />
//       </mesh>
//     </group>
//   )
// }

// function LegoCar({ position, color, ry=0 }) {
//   const dc = darken(color, 0.82)
//   return (
//     <group position={position} rotation={[0,ry,0]}>
//       <mesh castShadow>
//         <boxGeometry args={[2.0,0.48,1.0]} />
//         <meshLambertMaterial color={color} />
//       </mesh>
//       <mesh castShadow position={[0,0.38,0]}>
//         <boxGeometry args={[1.05,0.4,0.88]} />
//         <meshLambertMaterial color={dc} />
//       </mesh>
//       <mesh position={[0,0.4,0.45]}>
//         <boxGeometry args={[0.82,0.28,0.04]} />
//         <meshLambertMaterial color="#B3E5FC" />
//       </mesh>
//       {[[-0.68,-0.22,0.45],[0.68,-0.22,0.45],[-0.68,-0.22,-0.45],[0.68,-0.22,-0.45]].map((wp,i)=>(
//         <mesh key={i} position={wp} rotation={[Math.PI/2,0,0]} castShadow>
//           <cylinderGeometry args={[0.24,0.24,0.2,12]} />
//           <meshLambertMaterial color="#212121" />
//         </mesh>
//       ))}
//     </group>
//   )
// }

// export default function LegoWorld() {
//   const groundStudPos = useMemo(() => {
//     const arr = []
//     for (let i=-16;i<=16;i++) for(let j=-16;j<=16;j++) arr.push([i*1.4,0.055,j*1.4])
//     return arr
//   }, [])

//   const borderInst = useMemo(() => {
//     const arr = []
//     const range = Array.from({length:23},(_,i)=>i-11)
//     range.forEach(i=>{
//       arr.push({position:[i*1.3,0.28,-14], color:BRICK_PALETTE[Math.abs(i)%10], scale:[1.2,0.52,1.2]})
//       arr.push({position:[i*1.3,0.28, 14], color:BRICK_PALETTE[(Math.abs(i)+2)%10], scale:[1.2,0.52,1.2]})
//       arr.push({position:[-14,0.28,i*1.3], color:BRICK_PALETTE[(Math.abs(i)+4)%10], scale:[1.2,0.52,1.2]})
//       arr.push({position:[ 14,0.28,i*1.3], color:BRICK_PALETTE[(Math.abs(i)+6)%10], scale:[1.2,0.52,1.2]})
//     })
//     return arr
//   }, [])

//   const borderStuds = useMemo(()=>
//     borderInst.map(({position:p})=>[p[0],p[1]+0.3,p[2]]), [borderInst])

//   const dashInst = useMemo(()=>
//     Array.from({length:18},(_,i)=>({position:[0,0.018,-12+i*1.4],color:'#FFEE58',scale:[1,1,1]})), [])

//   const treePos = useMemo(()=>[
//     [-9,0,5],[9,0,5],[-9,0,-6],[9,0,-6],
//     [-5,0,12],[5,0,12],[-5,0,-15],[5,0,-15],
//     [-13,0,0],[13,0,0],[-3,0,9],[3,0,9],
//     [-7,0,-13],[7,0,-13],
//   ],[])

//   const buildings = useMemo(()=>[
//     {pos:[-18,0,-8],  color:'#E53935', floors:10, w:4.0, d:4.0},
//     {pos:[-18,0,-1],  color:'#1565C0', floors:8,  w:3.5, d:3.5},
//     {pos:[-18,0, 7],  color:'#7B1FA2', floors:13, w:4.2, d:4.2},
//     {pos:[-12,0,-11], color:'#FF9800', floors:7,  w:3.2, d:3.2},
//     {pos:[-12,0, 9],  color:'#00897B', floors:9,  w:3.4, d:3.4},
//     {pos:[ 18,0,-8],  color:'#F4511E', floors:11, w:4.0, d:4.0},
//     {pos:[ 18,0,-1],  color:'#D81B60', floors:9,  w:3.6, d:3.6},
//     {pos:[ 18,0, 7],  color:'#0288D1', floors:14, w:4.4, d:4.4},
//     {pos:[ 12,0,-11], color:'#558B2F', floors:8,  w:3.0, d:3.0},
//     {pos:[ 12,0, 9],  color:'#795548', floors:6,  w:2.8, d:2.8},
//     {pos:[-9, 0,-19], color:'#AB47BC', floors:9,  w:3.4, d:3.4},
//     {pos:[ 0, 0,-19], color:'#FFD700', floors:6,  w:3.0, d:3.0},
//     {pos:[ 9, 0,-19], color:'#E53935', floors:10, w:3.6, d:3.6},
//     {pos:[-6, 0, 11], color:'#4CAF50', floors:4,  w:2.6, d:2.6},
//     {pos:[ 6, 0, 11], color:'#FF9800', floors:4,  w:2.6, d:2.6},
//     {pos:[-6, 0,-13], color:'#1565C0', floors:5,  w:2.8, d:2.8},
//     {pos:[ 6, 0,-13], color:'#D81B60', floors:5,  w:2.8, d:2.8},
//   ],[])

//   return (
//     <group>
//       {/* Ground */}
//       <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
//         <planeGeometry args={[100,100]} />
//         <meshLambertMaterial color="#388E3C" />
//       </mesh>

//       {/* Sidewalks */}
//       {[[-4.8,0.005,0,2.0,30],[4.8,0.005,0,2.0,30],[0,0.005,12.5,14,2.0],[0,0.005,-16,14,2.0]].map(([x,y,z,w,d],i)=>(
//         <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,y,z]} receiveShadow>
//           <planeGeometry args={[w,d]} />
//           <meshLambertMaterial color="#B0BEC5" />
//         </mesh>
//       ))}

//       {/* Park grass */}
//       <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.008,-5]} receiveShadow>
//         <circleGeometry args={[4.2,24]} />
//         <meshLambertMaterial color="#A5D6A7" />
//       </mesh>

//       <InstancedStuds positions={groundStudPos} color="#2E7D32" radius={0.16} height={0.09} />
//       <InstancedBoxes instances={borderInst} args={[1,1,1]} />
//       <InstancedStuds positions={borderStuds} color={darken('#888',0.65)} radius={0.12} height={0.09} />

//       {/* Road */}
//       <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]} receiveShadow>
//         <planeGeometry args={[3.6,32]} />
//         <meshLambertMaterial color="#616161" />
//       </mesh>
//       {[-1.7,1.7].map((x,i)=>(
//         <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.012,0]}>
//           <planeGeometry args={[0.1,32]} />
//           <meshLambertMaterial color="#FFEE58" />
//         </mesh>
//       ))}
//       <InstancedBoxes instances={dashInst} args={[0.14,0.01,0.7]} />

//       {buildings.map((b,i)=>(
//         <LegoBuilding key={i} position={b.pos} color={b.color} floors={b.floors} width={b.w} depth={b.d} />
//       ))}

//       <LegoTrees positions={treePos} />

//       {[[-2,0,-10],[2,0,-10],[-2,0,-3],[2,0,-3],[-2,0,4],[2,0,4],[-2,0,11],[2,0,11]].map(([x,y,z],i)=>(
//         <StreetLamp key={i} position={[x,y,z]} />
//       ))}

//       <Fountain position={[0,0,-5]} />
//       <Bench position={[-3.2,0,-5]} ry={Math.PI/2} />
//       <Bench position={[3.2,0,-5]} ry={-Math.PI/2} />
//       <Bench position={[0,0,-8.6]} ry={0} />

//       <LegoCar position={[0.7,0.26,-13]} color="#F44336" ry={0} />
//       <LegoCar position={[-0.7,0.26,5]} color="#2196F3" ry={Math.PI} />
//       <LegoCar position={[0.7,0.26,10]} color="#FFEB3B" ry={0} />

//       <InstancedClouds />

//       {/* Far ground */}
//       <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.06,0]}>
//         <planeGeometry args={[300,300]} />
//         <meshLambertMaterial color="#2E7D32" />
//       </mesh>
//     </group>
//   )
// }


import { useMemo } from 'react'
import { InstancedStuds, InstancedBoxes, InstancedWindows, InstancedClouds } from './Instanced'

const BRICK_PALETTE = [
  '#E53935','#1565C0','#FFD700','#FF9800',
  '#4CAF50','#AB47BC','#00897B','#F4511E',
  '#D81B60','#0288D1',
]

function darken(hex, f = 0.72) {
  const n = parseInt(hex.replace('#',''), 16)
  const r = Math.floor(((n >> 16) & 0xff) * f)
  const g = Math.floor(((n >> 8) & 0xff) * f)
  const b = Math.floor((n & 0xff) * f)
  return '#' + [r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')
}

function LegoBuilding({ position, color, floors = 6, width = 2.8, depth = 2.8 }) {
  const alt = darken(color, 0.82)
  const floorInst = useMemo(() => Array.from({ length: floors }, (_, i) => ({
    position: [position[0], position[1] + 0.32 + i * 0.62, position[2]],
    color: i % 2 === 0 ? color : alt,
    scale: [width, 0.58, depth],
  })), [position, color, alt, floors, width, depth])

  const studPos = useMemo(() => {
    const arr = []
    const cols = Math.max(2, Math.round(width / 0.85))
    const rows = Math.max(2, Math.round(depth / 0.85))
    for (let f = 0; f < floors; f++) {
      const topY = position[1] + 0.32 + f * 0.62 + 0.29 + 0.055
      for (let c = 0; c < cols; c++)
        for (let r = 0; r < rows; r++)
          arr.push([position[0] - width/2 + (c+0.5)*(width/cols), topY, position[2] - depth/2 + (r+0.5)*(depth/rows)])
    }
    return arr
  }, [position, floors, width, depth])

  const winPos = useMemo(() => {
    const arr = []
    const cols = Math.max(2, Math.round(width / 1.1))
    for (let f = 0; f < floors - 1; f++) {
      const y = position[1] + 0.52 + f * 0.62
      for (let c = 0; c < cols; c++) {
        const x = position[0] - width/2 + (c+0.5)*(width/cols)
        arr.push([x, y, position[2] + depth/2 + 0.04])
        arr.push([x, y, position[2] - depth/2 - 0.04, Math.PI])
      }
    }
    return arr
  }, [position, floors, width, depth])

  const topY = position[1] + 0.32 + floors * 0.62

  return (
    <>
      <InstancedBoxes instances={floorInst} args={[1,1,1]} />
      <InstancedStuds positions={studPos} color={darken(color, 0.65)} radius={0.12} height={0.1} />
      <InstancedWindows positions={winPos} />
      {/* Roof slab */}
      <mesh position={[position[0], topY, position[2]]} castShadow>
        <boxGeometry args={[width+0.15, 0.32, depth+0.15]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Roof penthouse */}
      <mesh position={[position[0], topY+0.26, position[2]]} castShadow>
        <boxGeometry args={[width*0.5, 0.42, depth*0.5]} />
        <meshLambertMaterial color={darken(color,0.55)} />
      </mesh>
    </>
  )
}

function LegoTrees({ positions }) {
  const trunkInst = useMemo(() => positions.map(([x,y,z]) =>
    ({ position:[x,y+0.9,z], color:'#6D4C41', scale:[0.42,1.8,0.42] })), [positions])
  const l1 = useMemo(() => positions.map(([x,y,z]) =>
    ({ position:[x,y+2.2,z], color:'#2E7D32', scale:[2.2,0.58,2.2] })), [positions])
  const l1Studs = useMemo(() => positions.flatMap(([x,y,z]) => {
    const a=[]
    for(let c=0;c<2;c++) for(let r=0;r<2;r++)
      a.push([x-0.55+c*1.1, y+2.2+0.34, z-0.55+r*1.1])
    return a
  }), [positions])
  const l2 = useMemo(() => positions.map(([x,y,z]) =>
    ({ position:[x,y+2.76,z], color:'#388E3C', scale:[1.6,0.58,1.6] })), [positions])
  const l3 = useMemo(() => positions.map(([x,y,z]) =>
    ({ position:[x,y+3.28,z], color:'#43A047', scale:[1.05,0.58,1.05] })), [positions])

  return (
    <>
      <InstancedBoxes instances={trunkInst} args={[1,1,1]} />
      <InstancedBoxes instances={l1} args={[1,1,1]} />
      <InstancedStuds positions={l1Studs} color="#1B5E20" radius={0.14} />
      <InstancedBoxes instances={l2} args={[1,1,1]} />
      <InstancedBoxes instances={l3} args={[1,1,1]} />
    </>
  )
}

function StreetLamp({ position }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.07,0.11,3.2,8]} />
        <meshLambertMaterial color="#546E7A" />
      </mesh>
      <mesh position={[0.38,1.45,0]} castShadow>
        <boxGeometry args={[0.76,0.09,0.09]} />
        <meshLambertMaterial color="#546E7A" />
      </mesh>
      <mesh position={[0.74,1.36,0]}>
        <sphereGeometry args={[0.16,8,8]} />
        <meshLambertMaterial color="#FFF9C4" emissive="#FFEE58" emissiveIntensity={1.4} />
      </mesh>
      <pointLight position={[0.74,1.36,0]} intensity={0.7} distance={6} color="#FFE082" />
    </group>
  )
}

function Bench({ position, ry=0 }) {
  return (
    <group position={position} rotation={[0,ry,0]}>
      <mesh castShadow position={[0,0.48,0]}>
        <boxGeometry args={[1.1,0.1,0.38]} />
        <meshLambertMaterial color="#8D6E63" />
      </mesh>
      <mesh castShadow position={[0,0.68,-0.16]}>
        <boxGeometry args={[1.1,0.36,0.08]} />
        <meshLambertMaterial color="#8D6E63" />
      </mesh>
      {[-0.44,0.44].map((x,i)=>(
        <mesh key={i} castShadow position={[x,0.24,0]}>
          <boxGeometry args={[0.1,0.48,0.38]} />
          <meshLambertMaterial color="#6D4C41" />
        </mesh>
      ))}
    </group>
  )
}

function Fountain({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[2.2,2.4,0.48,20]} />
        <meshLambertMaterial color="#90A4AE" />
      </mesh>
      <mesh castShadow position={[0,0.6,0]}>
        <cylinderGeometry args={[0.25,0.32,1.2,10]} />
        <meshLambertMaterial color="#78909C" />
      </mesh>
      <mesh position={[0,1.26,0]}>
        <cylinderGeometry args={[0.65,0.6,0.2,16]} />
        <meshLambertMaterial color="#90A4AE" />
      </mesh>
      <mesh position={[0,0.27,0]} rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[1.95,24]} />
        <meshLambertMaterial color="#29B6F6" transparent opacity={0.78} />
      </mesh>
    </group>
  )
}

function LegoCar({ position, color, ry=0 }) {
  const dc = darken(color, 0.82)
  return (
    <group position={position} rotation={[0,ry,0]}>
      <mesh castShadow>
        <boxGeometry args={[2.0,0.48,1.0]} />
        <meshLambertMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0,0.38,0]}>
        <boxGeometry args={[1.05,0.4,0.88]} />
        <meshLambertMaterial color={dc} />
      </mesh>
      <mesh position={[0,0.4,0.45]}>
        <boxGeometry args={[0.82,0.28,0.04]} />
        <meshLambertMaterial color="#B3E5FC" />
      </mesh>
      {[[-0.68,-0.22,0.45],[0.68,-0.22,0.45],[-0.68,-0.22,-0.45],[0.68,-0.22,-0.45]].map((wp,i)=>(
        <mesh key={i} position={wp} rotation={[Math.PI/2,0,0]} castShadow>
          <cylinderGeometry args={[0.24,0.24,0.2,12]} />
          <meshLambertMaterial color="#212121" />
        </mesh>
      ))}
    </group>
  )
}

export default function LegoWorld() {
  const groundStudPos = useMemo(() => {
    const arr = []
    const step = 0.7 
    const range = 30 
    
    for (let i = -range; i <= range; i++) {
      for (let j = -range; j <= range; j++) {
        const x = i * step
        const z = j * step
        // Mask out the road area so studs don't clip through it
        if (Math.abs(x) > 1.9) { 
          arr.push([x, 0.055, z])
        }
      }
    }
    return arr
  }, [])

  const borderInst = useMemo(() => {
    const arr = []
    const range = Array.from({length:23},(_,i)=>i-11)
    range.forEach(i=>{
      arr.push({position:[i*1.3,0.28,-14], color:BRICK_PALETTE[Math.abs(i)%10], scale:[1.2,0.52,1.2]})
      arr.push({position:[i*1.3,0.28, 14], color:BRICK_PALETTE[(Math.abs(i)+2)%10], scale:[1.2,0.52,1.2]})
      arr.push({position:[-14,0.28,i*1.3], color:BRICK_PALETTE[(Math.abs(i)+4)%10], scale:[1.2,0.52,1.2]})
      arr.push({position:[ 14,0.28,i*1.3], color:BRICK_PALETTE[(Math.abs(i)+6)%10], scale:[1.2,0.52,1.2]})
    })
    return arr
  }, [])

  const borderStuds = useMemo(()=>
    borderInst.map(({position:p})=>[p[0],p[1]+0.3,p[2]]), [borderInst])

  const dashInst = useMemo(()=>
    Array.from({length:18},(_,i)=>({position:[0,0.018,-12+i*1.4],color:'#FFEE58',scale:[1,1,1]})), [])

  const treePos = useMemo(()=>[
    [-9,0,5],[9,0,5],[-9,0,-6],[9,0,-6],
    [-5,0,12],[5,0,12],[-5,0,-15],[5,0,-15],
    [-13,0,0],[13,0,0],[-3,0,9],[3,0,9],
    [-7,0,-13],[7,0,-13],
  ],[])

  const buildings = useMemo(()=>[
    {pos:[-18,0,-8],  color:'#E53935', floors:10, w:4.0, d:4.0},
    {pos:[-18,0,-1],  color:'#1565C0', floors:8,  w:3.5, d:3.5},
    {pos:[-18,0, 7],  color:'#7B1FA2', floors:13, w:4.2, d:4.2},
    {pos:[-12,0,-11], color:'#FF9800', floors:7,  w:3.2, d:3.2},
    {pos:[-12,0, 9],  color:'#00897B', floors:9,  w:3.4, d:3.4},
    {pos:[ 18,0,-8],  color:'#F4511E', floors:11, w:4.0, d:4.0},
    {pos:[ 18,0,-1],  color:'#D81B60', floors:9,  w:3.6, d:3.6},
    {pos:[ 18,0, 7],  color:'#0288D1', floors:14, w:4.4, d:4.4},
    {pos:[ 12,0,-11], color:'#558B2F', floors:8,  w:3.0, d:3.0},
    {pos:[ 12,0, 9],  color:'#795548', floors:6,  w:2.8, d:2.8},
    {pos:[-9, 0,-19], color:'#AB47BC', floors:9,  w:3.4, d:3.4},
    {pos:[ 0, 0,-19], color:'#FFD700', floors:6,  w:3.0, d:3.0},
    {pos:[ 9, 0,-19], color:'#E53935', floors:10, w:3.6, d:3.6},
    {pos:[-6, 0, 11], color:'#4CAF50', floors:4,  w:2.6, d:2.6},
    {pos:[ 6, 0, 11], color:'#FF9800', floors:4,  w:2.6, d:2.6},
    {pos:[-6, 0,-13], color:'#1565C0', floors:5,  w:2.8, d:2.8},
    {pos:[ 6, 0,-13], color:'#D81B60', floors:5,  w:2.8, d:2.8},
  ],[])

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[100,100]} />
        <meshLambertMaterial color="#388E3C" />
      </mesh>

      {/* Sidewalks */}
      {[[-4.8,0.005,0,2.0,30],[4.8,0.005,0,2.0,30],[0,0.005,12.5,14,2.0],[0,0.005,-16,14,2.0]].map(([x,y,z,w,d],i)=>(
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,y,z]} receiveShadow>
          <planeGeometry args={[w,d]} />
          <meshLambertMaterial color="#B0BEC5" />
        </mesh>
      ))}

      {/* Park grass */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.008,-5]} receiveShadow>
        <circleGeometry args={[4.2,24]} />
        <meshLambertMaterial color="#A5D6A7" />
      </mesh>

      <InstancedStuds positions={groundStudPos} color="#2E7D32" radius={0.2} height={0.12} />
      <InstancedBoxes instances={borderInst} args={[1,1,1]} />
      <InstancedStuds positions={borderStuds} color={darken('#888',0.65)} radius={0.12} height={0.09} />

      {/* Road */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.01,0]} receiveShadow>
        <planeGeometry args={[3.6,32]} />
        <meshLambertMaterial color="#616161" />
      </mesh>
      {[-1.7,1.7].map((x,i)=>(
        <mesh key={i} rotation={[-Math.PI/2,0,0]} position={[x,0.012,0]}>
          <planeGeometry args={[0.1,32]} />
          <meshLambertMaterial color="#FFEE58" />
        </mesh>
      ))}
      <InstancedBoxes instances={dashInst} args={[0.14,0.01,0.7]} />

      {buildings.map((b,i)=>(
        <LegoBuilding key={i} position={b.pos} color={b.color} floors={b.floors} width={b.w} depth={b.d} />
      ))}

      <LegoTrees positions={treePos} />

      {[[-2,0,-10],[2,0,-10],[-2,0,-3],[2,0,-3],[-2,0,4],[2,0,4],[-2,0,11],[2,0,11]].map(([x,y,z],i)=>(
        <StreetLamp key={i} position={[x,y,z]} />
      ))}

      <Fountain position={[0,0,-5]} />
      <Bench position={[-3.2,0,-5]} ry={Math.PI/2} />
      <Bench position={[3.2,0,-5]} ry={-Math.PI/2} />
      <Bench position={[0,0,-8.6]} ry={0} />

      <LegoCar position={[0.7,0.26,-13]} color="#F44336" ry={0} />
      <LegoCar position={[-0.7,0.26,5]} color="#2196F3" ry={Math.PI} />
      <LegoCar position={[0.7,0.26,10]} color="#FFEB3B" ry={0} />

      <InstancedClouds />

      {/* Far ground */}
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.06,0]}>
        <planeGeometry args={[300,300]} />
        <meshLambertMaterial color="#2E7D32" />
      </mesh>
    </group>
  )
}

