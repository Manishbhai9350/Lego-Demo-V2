import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useStore } from "../store";

function darken(hex, f = 0.72) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.floor(((n >> 16) & 0xff) * f);
  const g = Math.floor(((n >> 8) & 0xff) * f);
  const b = Math.floor((n & 0xff) * f);
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function InfoCard({ char }) {
  const { selectedChar, setSelectedChar } = useStore();
  const isOpen = selectedChar === char.id;

  return (
    <Html
      position={[0, 5, 0]}
      center
      distanceFactor={10}
      style={{ pointerEvents: isOpen ? "all" : "none" }}
      zIndexRange={[100, 0]}
    >
      <div
        style={{
          width: 215,
          background: "#fff",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          opacity: isOpen ? 1 : 0,
          transform: isOpen
            ? "scale(1) translateY(0)"
            : "scale(0.7) translateY(20px)",
          transition:
            "opacity 0.22s cubic-bezier(.34,1.56,.64,1), transform 0.22s cubic-bezier(.34,1.56,.64,1)",
          fontFamily: "'Segoe UI',sans-serif",
        }}
      >
        <div
          style={{
            background: char.accentColor,
            padding: "14px 16px 12px",
            color: "#fff",
            position: "relative",
          }}
        >
          <div style={{ fontSize: 30, marginBottom: 4 }}>{char.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: 1 }}>
            {char.name}
          </div>
          <div style={{ fontSize: 12, opacity: 0.85 }}>{char.attrs.Role}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedChar(char.id);
            }}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.25)",
              border: "none",
              color: "#fff",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "10px 16px 14px" }}>
          {Object.entries(char.attrs)
            .filter(([k]) => k !== "Role")
            .map(([label, value]) => {
              if (label !== "Outfit") {
                return (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#999",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{ fontSize: 13, color: "#222", fontWeight: 600 }}
                    >
                      {value}
                    </span>
                  </div>
                );
              } else {
                return (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 7,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "#999",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Outfit
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: char.accentColor + "22",
                        color: char.accentColor,
                      }}
                    >
                      {char.attrs.Outfit}
                    </span>
                  </div>
                );
              }
            })}
        </div>
      </div>
    </Html>
  );
}

function NameTag({ char }) {
  return (
    <Html position={[0, 3.2, 0]} center distanceFactor={9} zIndexRange={[50, 0]}>
      <div
        style={{
          background: "#FFD700",
          color: "#1a1a1a",
          fontFamily: "'Segoe UI',sans-serif",
          fontWeight: 900,
          fontSize: 13,
          letterSpacing: 2,
          padding: "5px 14px",
          borderRadius: 20,
          border: "2.5px solid #E65100",
          boxShadow: "0 3px 12px rgba(0,0,0,0.35)",
          whiteSpace: "nowrap",
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {char.name}
      </div>
    </Html>
  );
}

function Box({ args, color, position, castShadow = true }) {
  return (
    <mesh position={position} castShadow={castShadow}>
      <boxGeometry args={args} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}
function Cyl({ args, color, position }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={args} />
      <meshLambertMaterial color={color} />
    </mesh>
  );
}

export default function LegoCharacter({ char }) {
  const groupRef = useRef();
  const { selectedChar, setSelectedChar } = useStore();
  const isSelected = selectedChar === char.id;
  const [hovered, setHovered] = useState(false);
  const idxRef = useRef({ alex: 0, sara: 1, kai: 2 }[char.id] ?? 0);

  // Idle bob — NO rotation
  useFrame(() => {
    if (!groupRef.current) return;
    const t = performance.now() / 1000;
    groupRef.current.position.y =
      Math.sin(t * 1.1 + idxRef.current * 1.4) * 0.07;
  });

  const {
    bodyColor,
    pantsColor,
    skinColor,
    hairColor,
    isFemale,
    hasHat,
    hatColor = "#212121",
  } = char;

  return (
    <group
      ref={groupRef}
      position={char.position}
      rotation={char.rotation}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedChar(char.id);
      }}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <group scale={isSelected ? 1.07 : hovered ? 1.04 : 1}>
        {/* Feet */}
        <Box
          args={[0.38, 0.12, 0.42]}
          color="#212121"
          position={[-0.2, 0.06, 0.04]}
        />
        <Box
          args={[0.38, 0.12, 0.42]}
          color="#212121"
          position={[0.2, 0.06, 0.04]}
        />
        {/* Legs */}
        <Box
          args={[0.36, 0.65, 0.35]}
          color={pantsColor}
          position={[-0.2, 0.44, 0]}
        />
        <Box
          args={[0.36, 0.65, 0.35]}
          color={pantsColor}
          position={[0.2, 0.44, 0]}
        />
        {/* Torso */}
        <Box
          args={[0.82, 0.7, 0.44]}
          color={bodyColor}
          position={[0, 1.12, 0]}
        />
        {/* Skirt (female) or tie (male) */}
        {isFemale ? (
          <>
            <mesh position={[0, 0.79, 0]} castShadow>
              <cylinderGeometry args={[0.55, 0.66, 0.28, 16]} />
              <meshLambertMaterial color={bodyColor} />
            </mesh>
            <Box
              args={[0.84, 0.08, 0.46]}
              color={darken(bodyColor, 0.7)}
              position={[0, 0.9, 0]}
            />
          </>
        ) : (
          <Box
            args={[0.18, 0.42, 0.46]}
            color={darken(bodyColor, 0.65)}
            position={[0, 1.0, 0]}
          />
        )}
        {/* Arms */}
        <Box
          args={[0.28, 0.58, 0.3]}
          color={skinColor}
          position={[-0.55, 1.06, 0]}
        />
        <Box
          args={[0.28, 0.58, 0.3]}
          color={skinColor}
          position={[0.55, 1.06, 0]}
        />
        <Box
          args={[0.28, 0.22, 0.3]}
          color={skinColor}
          position={[-0.55, 0.7, 0]}
        />
        <Box
          args={[0.28, 0.22, 0.3]}
          color={skinColor}
          position={[0.55, 0.7, 0]}
        />
        {/* Neck */}
        <Cyl
          args={[0.16, 0.16, 0.16, 12]}
          color={skinColor}
          position={[0, 1.55, 0]}
        />
        {/* Head */}
        <Box args={[0.78, 0.72, 0.7]} color={skinColor} position={[0, 2, 0]} />
        {/* Eyes */}
        {[
          [-0.2, 2.18, 0.36],
          [0.2, 2.18, 0.36],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.2, 0.2, 0.02]} />
            <meshLambertMaterial color="#ffffff" />
          </mesh>
        ))}
        {[
          [-0.2, 2.17, 0.37],
          [0.2, 2.17, 0.37],
        ].map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.14, 0.14, 0.02]} />
            <meshLambertMaterial color="#212121" />
          </mesh>
        ))}
        {/* Eyelashes (female) */}
        {isFemale &&
          [
            [-0.2, 2.29, 0.37],
            [0.2, 2.29, 0.37],
          ].map((p, i) => (
            <mesh key={i} position={p}>
              <boxGeometry args={[0.22, 0.05, 0.02]} />
              <meshLambertMaterial color="#212121" />
            </mesh>
          ))}
        {/* Smile */}
        <mesh position={[0, 2.0, 0.37]}>
          <boxGeometry args={[0.3, 0.06, 0.02]} />
          <meshLambertMaterial color="#212121" />
        </mesh>
        {/* Hair / Hat */}
        {!hasHat ? (
          <>
            <Box
              args={[0.82, 0.18, 0.72]}
              color={hairColor}
              position={[0, 2.44, 0]}
            />
            <Box
              args={[0.14, 0.38, 0.72]}
              color={hairColor}
              position={[-0.41, 2.34, 0]}
            />
            <Box
              args={[0.14, 0.38, 0.72]}
              color={hairColor}
              position={[0.41, 2.34, 0]}
            />
            {isFemale && (
              <Box
                args={[0.7, 0.75, 0.16]}
                color={hairColor}
                position={[0, 2.15, -0.38]}
              />
            )}
          </>
        ) : (
          <>
            <Box
              args={[0.84, 0.15, 0.75]}
              color={hatColor}
              position={[0, 2.55, 0]}
            />
            <Box
              args={[0.7, 0.26, 0.62]}
              color={hatColor}
              position={[0, 2.69, 0]}
            />
            <Box
              args={[1.1, 0.08, 0.42]}
              color={hatColor}
              position={[0, 2.46, 0.22]}
            />
          </>
        )}
        {/* Head stud */}
        <Cyl
          args={[0.14, 0.14, 0.12, 12]}
          color={skinColor}
          position={char.studPosition}
        />
      </group>

      <NameTag char={char} />
      <InfoCard key={char.name} char={char} />
    </group>
  );
}
