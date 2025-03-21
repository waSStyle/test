"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei"
import * as THREE from "three"

// Minecraft character model
function MinecraftCharacter({ skinTexture = "/images/default-skin.png", capeTexture = null, slim = false }) {
  const groupRef = useRef<THREE.Group>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [cape, setCape] = useState<THREE.Texture | null>(null)

  // Load the skin texture
  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.crossOrigin = "anonymous"

    loader.load(skinTexture, (tex) => {
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.NearestFilter
      setTexture(tex)
    })

    if (capeTexture) {
      loader.load(capeTexture, (tex) => {
        tex.magFilter = THREE.NearestFilter
        tex.minFilter = THREE.NearestFilter
        setCape(tex)
      })
    }
  }, [skinTexture, capeTexture])

  // Subtle animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1
    }
  })

  // Create materials for different parts of the skin
  const createMaterial = (x: number, y: number, w: number, h: number) => {
    if (!texture) return new THREE.MeshStandardMaterial({ color: "#e0d8c0" })

    const clone = texture.clone()
    clone.needsUpdate = true

    // Minecraft skins are 64x64 (or 64x32 for legacy)
    const skinWidth = texture.image.width
    const skinHeight = texture.image.height

    // Calculate UV coordinates
    clone.offset.x = x / skinWidth
    clone.offset.y = 1 - (y + h) / skinHeight
    clone.repeat.x = w / skinWidth
    clone.repeat.y = h / skinHeight

    return new THREE.MeshStandardMaterial({
      map: clone,
      side: THREE.FrontSide,
      transparent: true,
      alphaTest: 0.5,
    })
  }

  // If texture isn't loaded yet, show a placeholder
  if (!texture) {
    return (
      <group ref={groupRef} position={[0, -1, 0]}>
        <mesh>
          <boxGeometry args={[2, 2, 1]} />
          <meshStandardMaterial color="#e0d8c0" wireframe />
        </mesh>
      </group>
    )
  }

  // Arm width based on skin type (slim or classic)
  const armWidth = slim ? 0.375 : 0.5

  return (
    <group ref={groupRef} position={[0, -1, 0]} scale={0.25}>
      {/* Head */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
      </mesh>

      {/* Head Overlay (Hat Layer) */}
      <mesh position={[0, 6, 0]} scale={[1.05, 1.05, 1.05]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial attachArray="material" map={texture} transparent alphaTest={0.5} />
        <meshStandardMaterial attachArray="material" map={texture} transparent alphaTest={0.5} />
        <meshStandardMaterial attachArray="material" map={texture} transparent alphaTest={0.5} />
        <meshStandardMaterial attachArray="material" map={texture} transparent alphaTest={0.5} />
        <meshStandardMaterial attachArray="material" map={texture} transparent alphaTest={0.5} />
        <meshStandardMaterial attachArray="material" map={texture} transparent alphaTest={0.5} />
      </mesh>

      {/* Body */}
      <mesh position={[0, 4, 0]}>
        <boxGeometry args={[2, 3, 1]} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
      </mesh>

      {/* Right Arm */}
      <mesh position={[1.25, 4, 0]}>
        <boxGeometry args={[armWidth, 3, 1]} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
      </mesh>

      {/* Left Arm */}
      <mesh position={[-1.25, 4, 0]}>
        <boxGeometry args={[armWidth, 3, 1]} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
      </mesh>

      {/* Right Leg */}
      <mesh position={[0.5, 1, 0]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
      </mesh>

      {/* Left Leg */}
      <mesh position={[-0.5, 1, 0]}>
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
        <meshStandardMaterial attachArray="material" map={texture} />
      </mesh>

      {/* Cape (if provided) */}
      {cape && (
        <mesh position={[0, 4, -0.6]}>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshStandardMaterial map={cape} />
        </mesh>
      )}
    </group>
  )
}

export default function SkinPreview() {
  // Sample skins for testing
  const skins = ["/images/default-skin.png", "/images/naruto-skin.png", "/images/sasuke-skin.png"]

  const [currentSkin, setCurrentSkin] = useState(0)

  // For a real implementation, this would be connected to the skin builder controls
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSkin((prev) => (prev + 1) % skins.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full rounded-md overflow-hidden border border-[#473f14]/50">
      <Canvas shadows>
        <color attach="background" args={["#141414"]} />
        <PerspectiveCamera makeDefault position={[0, 0, 2]} />
        <ambientLight intensity={0.5} color="#e0d8c0" />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow color="#e0d8c0" />
        <pointLight position={[-3, 2, -2]} intensity={0.5} color="#473f14" />
        <fog attach="fog" args={["#141414", 8, 30]} />

        <Suspense fallback={null}>
          <MinecraftCharacter skinTexture={skins[currentSkin]} />
          <Environment preset="night" />

          {/* Ground plane with Naruto-themed styling */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
            <circleGeometry args={[5, 36]} />
            <meshStandardMaterial color="#241c14" roughness={0.8} metalness={0.2} />
          </mesh>
        </Suspense>

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2}
          minDistance={1}
          maxDistance={4}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  )
}

