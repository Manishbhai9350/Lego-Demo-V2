import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── INSTANCED STUDS ─────────────────────────────────────────────────────────
// Renders hundreds of cylinder studs in ONE draw call
export function InstancedStuds({ positions, color, radius = 0.18, height = 0.11 }) {
  const mesh = useRef()
  const count = positions.length
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useMemo(() => {
    if (!mesh.current) return
    positions.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [positions, dummy])

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} castShadow>
      <cylinderGeometry args={[radius, radius, height, 10]} />
      <meshLambertMaterial color={color} />
    </instancedMesh>
  )
}

// ─── INSTANCED BOXES ─────────────────────────────────────────────────────────
// For border bricks, repeated road dashes, etc.
export function InstancedBoxes({ instances, args }) {
  const mesh = useRef()
  const count = instances.length
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colors = useMemo(() => {
    const arr = new Float32Array(count * 3)
    const c = new THREE.Color()
    instances.forEach(({ color }, i) => {
      c.set(color)
      arr[i * 3] = c.r; arr[i * 3 + 1] = c.g; arr[i * 3 + 2] = c.b
    })
    return arr
  }, [instances, count])

  useMemo(() => {
    if (!mesh.current) return
    instances.forEach(({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }, i) => {
      dummy.position.set(...position)
      dummy.rotation.set(...rotation)
      dummy.scale.set(...scale)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [instances, dummy])

  return (
    <instancedMesh ref={mesh} args={[null, null, count]} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshLambertMaterial vertexColors />
      {/* inject per-instance colors */}
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colors, 3]}
      />
    </instancedMesh>
  )
}

// ─── INSTANCED WINDOWS ───────────────────────────────────────────────────────
export function InstancedWindows({ positions }) {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useMemo(() => {
    if (!mesh.current) return
    positions.forEach(([x, y, z, ry = 0], i) => {
      dummy.position.set(x, y, z)
      dummy.rotation.set(0, ry, 0)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  }, [positions, dummy])

  return (
    <instancedMesh ref={mesh} args={[null, null, positions.length]}>
      <boxGeometry args={[0.55, 0.45, 0.06]} />
      <meshLambertMaterial color="#B3E5FC" emissive="#4FC3F7" emissiveIntensity={0.15} />
    </instancedMesh>
  )
}

// ─── INSTANCED CLOUDS ────────────────────────────────────────────────────────
const CLOUD_OFFSETS = [
  [0, 0, 0, 2.6, 1.1, 2.0],
  [1.7, 0.35, 0, 2.0, 0.9, 1.6],
  [-1.6, 0.3, 0, 1.8, 0.85, 1.5],
  [0, 0.7, 0, 1.4, 0.72, 1.3],
  [0.5, 0.2, 0.8, 1.2, 0.6, 1.0],
]
const NUM_CLOUDS = 8
const CLOUD_SEEDS = Array.from({ length: NUM_CLOUDS }, (_, i) => ({
  baseX: -30 + i * 9 + (i % 3) * 4,
  y: 13 + (i % 3) * 1.5,
  z: -12 + (i % 4) * 8,
  speed: 0.004 + (i % 4) * 0.002,
}))

export function InstancedClouds() {
  const mesh = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const positions = useRef(CLOUD_SEEDS.map(s => s.baseX))
  const totalCount = NUM_CLOUDS * CLOUD_OFFSETS.length

  useFrame(() => {
    if (!mesh.current) return
    let idx = 0
    CLOUD_SEEDS.forEach((seed, ci) => {
      positions.current[ci] += seed.speed
      if (positions.current[ci] > 38) positions.current[ci] = -38
      CLOUD_OFFSETS.forEach(([ox, oy, oz, w, h, d]) => {
        dummy.position.set(positions.current[ci] + ox, seed.y + oy, seed.z + oz)
        dummy.scale.set(w, h, d)
        dummy.updateMatrix()
        mesh.current.setMatrixAt(idx, dummy.matrix)
        idx++
      })
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  // init
  useMemo(() => {
    // positions will be updated each frame
  }, [])

  return (
    <instancedMesh ref={mesh} args={[null, null, totalCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshLambertMaterial color="#ffffff" />
    </instancedMesh>
  )
}
