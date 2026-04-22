import { Canvas } from '@react-three/fiber'
import { ContactShadows, Float, OrbitControls } from '@react-three/drei'

import type { FaceShape, WigProduct } from '../data'

interface WigCanvasProps {
  product: WigProduct
  skinToneHex: string
  faceShape: FaceShape
  volumeLevel: number
  lengthFactor: number
  showBangs: boolean
}

type BustProps = WigCanvasProps

const faceProfiles: Record<FaceShape, [number, number, number]> = {
  鹅蛋脸: [0.92, 1.06, 0.9],
  圆脸: [0.98, 0.98, 0.94],
  方脸: [1.02, 0.97, 0.92],
  心形脸: [0.94, 1.08, 0.9],
  长脸: [0.88, 1.14, 0.88],
}

function WigBust({
  product,
  skinToneHex,
  faceShape,
  volumeLevel,
  lengthFactor,
  showBangs,
}: BustProps) {
  const [faceScaleX, faceScaleY, faceScaleZ] = faceProfiles[faceShape]
  const volumeScale = 0.88 + volumeLevel / 165
  const lengthScale = Math.max(0.72, Math.min(1.55, (product.length / 46) * lengthFactor))
  const sideDrop = Math.max(0.8, lengthScale * 1.1)
  const color = product.colorHex
  const accent = product.accentHex
  const isCurly = product.texture === '大波浪' || product.texture === '蛋卷'
  const isBraided = product.texture === '编发'
  const isShort = product.length <= 34
  const fringeDepth = showBangs ? 0.64 : 0.18

  return (
    <group position={[0, -0.15, 0]}>
      <mesh position={[0, -1.58, 0]} receiveShadow>
        <cylinderGeometry args={[1.45, 1.58, 0.2, 48]} />
        <meshStandardMaterial color="#120c16" metalness={0.35} roughness={0.48} />
      </mesh>

      <mesh position={[0, -1.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.52, 0.5, 24]} />
        <meshStandardMaterial color="#7c665c" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.12, 0]} castShadow receiveShadow scale={[faceScaleX, faceScaleY, faceScaleZ]}>
        <sphereGeometry args={[0.82, 48, 48]} />
        <meshStandardMaterial color={skinToneHex} roughness={0.95} />
      </mesh>

      <mesh position={[0, -0.52, 0.66]} castShadow scale={[0.4, 0.24, 0.2]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={skinToneHex} roughness={0.98} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh
          key={`ear-${side}`}
          position={[0.88 * side, 0.12, 0.05]}
          rotation={[0, 0, side * 0.08]}
          castShadow
          scale={[0.13, 0.2, 0.1]}
        >
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial color={skinToneHex} roughness={0.95} />
        </mesh>
      ))}

      <mesh position={[0, 0.58, 0]} castShadow scale={[volumeScale, 0.9 + volumeLevel / 260, volumeScale * 0.94]}>
        <sphereGeometry args={[0.9, 64, 64]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>

      <mesh
        position={[0, 0.36 - sideDrop * 0.18, -0.1]}
        castShadow
        scale={[0.78 * volumeScale, isShort ? 0.9 : 1.08, 0.86 * volumeScale]}
      >
        <cylinderGeometry args={[0.72, 0.94 + volumeLevel / 260, 0.92 + sideDrop, 32]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.04} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={`side-layer-${side}`}>
          <mesh
            position={[0.78 * side, 0.18 - sideDrop * 0.32, 0.22]}
            rotation={[0, 0, side * 0.18]}
            castShadow
          >
            <cylinderGeometry args={[0.18 + volumeLevel / 240, 0.3 + volumeLevel / 220, sideDrop, 28]} />
            <meshStandardMaterial color={color} roughness={0.42} />
          </mesh>
          <mesh
            position={[0.8 * side, -0.26 - sideDrop * 0.44, 0.12]}
            castShadow
            scale={[0.26, 0.34, 0.22]}
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={accent} roughness={0.3} metalness={0.06} />
          </mesh>
        </group>
      ))}

      <mesh
        position={[0, 0.78, fringeDepth]}
        rotation={[1.52, 0, 0]}
        castShadow
        scale={[0.84, showBangs ? 0.62 : 0.2, 0.34]}
      >
        <torusGeometry args={[0.64, 0.16, 24, 64, Math.PI]} />
        <meshStandardMaterial color={accent} roughness={0.38} metalness={0.04} />
      </mesh>

      {!showBangs && (
        <mesh position={[0, 1.08, 0.46]} castShadow scale={[0.66, 0.18, 0.18]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={accent} roughness={0.34} />
        </mesh>
      )}

      {isCurly &&
        Array.from({ length: 5 }, (_, index) => {
          const x = -0.58 + index * 0.29
          const y = -0.12 - Math.abs(2 - index) * 0.12
          const z = -0.42 + (index % 2 === 0 ? 0.05 : -0.02)

          return (
            <mesh key={`curl-${index}`} position={[x, y, z]} castShadow scale={[0.22, 0.26, 0.22]}>
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial color={accent} roughness={0.28} metalness={0.06} />
            </mesh>
          )
        })}

      {isBraided &&
        Array.from({ length: 7 }, (_, index) => (
          <mesh
            key={`braid-${index}`}
            position={[0, 0.08 - index * 0.25, -0.72]}
            rotation={[0, 0, index % 2 === 0 ? 0.18 : -0.18]}
            castShadow
            scale={[0.16 + index * 0.01, 0.16, 0.16]}
          >
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial color={index % 2 === 0 ? color : accent} roughness={0.36} />
          </mesh>
        ))}

      <mesh position={[0, -0.98, -0.75]} castShadow scale={[0.42, 0.22, 0.22]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={accent} roughness={0.44} />
      </mesh>
    </group>
  )
}

export default function WigCanvas(props: WigCanvasProps) {
  return (
    <div className="wig-canvas">
      <Canvas camera={{ position: [0, 0.6, 5.3], fov: 34 }} shadows dpr={[1, 2]}>
        <ambientLight intensity={1.2} />
        <directionalLight
          castShadow
          position={[3.5, 5, 2.5]}
          intensity={2.1}
          color={props.product.accentHex}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 2.5, 2]} intensity={1.1} color="#f8e4d0" />
        <pointLight position={[0, 1.8, 3]} intensity={0.65} color="#ffffff" />
        <Float floatIntensity={0.5} rotationIntensity={0.18} speed={1.4}>
          <WigBust {...props} />
        </Float>
        <ContactShadows position={[0, -1.65, 0]} opacity={0.42} scale={5} blur={2.4} far={2.2} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.9}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate
          autoRotateSpeed={0.7}
        />
      </Canvas>
    </div>
  )
}
