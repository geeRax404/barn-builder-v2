import React, { useMemo } from 'react';
import * as THREE from 'three';

interface RainGutterProps {
  width: number;
  length: number;
  height: number;
  roofPitch: number;
}

const RainGutter: React.FC<RainGutterProps> = ({ width, length, height, roofPitch }) => {
  const roofHeight = (width / 2) * (roofPitch / 12);
  
  // Enhanced gutter material for maximum visibility
  const gutterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#E8E8E8', // Brighter silver
      metalness: 0.95,
      roughness: 0.05,
      envMapIntensity: 1.5,
    });
  }, []);

  // Downspout material
  const downspoutMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#D0D0D0',
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.2,
    });
  }, []);

  // Create highly visible gutter profile - much larger
  const gutterShape = useMemo(() => {
    const shape = new THREE.Shape();
    const gutterWidth = 1.0; // Much larger for visibility
    const gutterDepth = 0.6; // Much deeper
    
    // Create prominent U-shaped gutter profile
    shape.moveTo(-gutterWidth/2, 0);
    shape.lineTo(-gutterWidth/2, -gutterDepth * 0.8);
    shape.quadraticCurveTo(0, -gutterDepth, gutterWidth/2, -gutterDepth * 0.8);
    shape.lineTo(gutterWidth/2, 0);
    shape.lineTo(gutterWidth/2 - 0.12, 0); // Thick walls
    shape.lineTo(gutterWidth/2 - 0.12, -gutterDepth * 0.7);
    shape.quadraticCurveTo(0, -gutterDepth * 0.85, -gutterWidth/2 + 0.12, -gutterDepth * 0.7);
    shape.lineTo(-gutterWidth/2 + 0.12, 0);
    shape.closePath();
    
    return shape;
  }, []);

  // Position gutters at the actual roof edge - accounting for wall thickness
  const gutterHeight = height - 0.2; // Slightly below roof edge
  const wallThickness = 0.2; // Wall thickness from Wall.tsx
  
  // Position gutters OUTSIDE the building at the roof overhang
  const frontGutterZ = length/2 + wallThickness + 0.3; // Beyond front wall
  const backGutterZ = -length/2 - wallThickness - 0.3; // Beyond back wall

  return (
    <group>
      {/* FRONT GUTTER - positioned BEYOND the front wall at roof overhang */}
      <mesh
        position={[0, gutterHeight, frontGutterZ]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry 
          args={[
            gutterShape, 
            {
              steps: 2,
              depth: width,
              bevelEnabled: true,
              bevelThickness: 0.03,
              bevelSize: 0.03,
              bevelSegments: 4,
            }
          ]} 
        />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* BACK GUTTER - positioned BEYOND the back wall at roof overhang */}
      <mesh
        position={[0, gutterHeight, backGutterZ]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <extrudeGeometry 
          args={[
            gutterShape, 
            {
              steps: 2,
              depth: width,
              bevelEnabled: true,
              bevelThickness: 0.03,
              bevelSize: 0.03,
              bevelSegments: 4,
            }
          ]} 
        />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* ONLY 4 CORNER DOWNSPOUTS - positioned at building corners */}
      {[
        // Front left corner
        [-width/2, (height - 1)/2 + 0.5, frontGutterZ],
        // Front right corner  
        [width/2, (height - 1)/2 + 0.5, frontGutterZ],
        // Back left corner
        [-width/2, (height - 1)/2 + 0.5, backGutterZ],
        // Back right corner
        [width/2, (height - 1)/2 + 0.5, backGutterZ],
      ].map((position, index) => (
        <mesh
          key={`downspout-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.15, 0.15, height - 1, 16]} />
          <primitive object={downspoutMaterial} attach="material" />
        </mesh>
      ))}

      {/* Corner downspout elbows connecting gutters to downspouts */}
      {[
        [-width/2, gutterHeight - 0.3, frontGutterZ],
        [width/2, gutterHeight - 0.3, frontGutterZ],
        [-width/2, gutterHeight - 0.3, backGutterZ],
        [width/2, gutterHeight - 0.3, backGutterZ],
      ].map((position, index) => (
        <mesh
          key={`elbow-${index}`}
          position={position as [number, number, number]}
          rotation={[Math.PI/2, 0, 0]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.2, 0.15, 8, 16, Math.PI/2]} />
          <primitive object={downspoutMaterial} attach="material" />
        </mesh>
      ))}

      {/* Gutter mounting brackets - positioned on the wall faces */}
      {(() => {
        const brackets = [];
        const bracketSpacing = 8;
        
        // Front gutter brackets - positioned on the front wall face
        for (let i = 0; i <= Math.floor(width / bracketSpacing); i++) {
          const x = -width/2 + i * bracketSpacing;
          if (Math.abs(x) <= width/2) {
            brackets.push(
              <mesh 
                key={`bracket-front-${i}`}
                position={[x, gutterHeight + 0.2, length/2 + wallThickness/2]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.2, 0.5, 0.8]} />
                <primitive object={gutterMaterial} attach="material" />
              </mesh>
            );
          }
        }
        
        // Back gutter brackets - positioned on the back wall face
        for (let i = 0; i <= Math.floor(width / bracketSpacing); i++) {
          const x = -width/2 + i * bracketSpacing;
          if (Math.abs(x) <= width/2) {
            brackets.push(
              <mesh 
                key={`bracket-back-${i}`}
                position={[x, gutterHeight + 0.2, -length/2 - wallThickness/2]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.2, 0.5, 0.8]} />
                <primitive object={gutterMaterial} attach="material" />
              </mesh>
            );
          }
        }
        
        return brackets;
      })()}

      {/* Downspout mounting straps - only at corners */}
      {[
        [-width/2, height * 0.75, frontGutterZ],
        [width/2, height * 0.75, frontGutterZ],
        [-width/2, height * 0.75, backGutterZ],
        [width/2, height * 0.75, backGutterZ],
        [-width/2, height * 0.25, frontGutterZ],
        [width/2, height * 0.25, frontGutterZ],
        [-width/2, height * 0.25, backGutterZ],
        [width/2, height * 0.25, backGutterZ],
      ].map((position, index) => (
        <mesh
          key={`strap-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.18, 0.04, 8, 16]} />
          <primitive object={gutterMaterial} attach="material" />
        </mesh>
      ))}

      {/* Splash blocks at ground level - positioned away from building */}
      {[
        [-width/2, 0.15, frontGutterZ + 1.0],
        [width/2, 0.15, frontGutterZ + 1.0],
        [-width/2, 0.15, backGutterZ - 1.0],
        [width/2, 0.15, backGutterZ - 1.0],
      ].map((position, index) => (
        <mesh
          key={`splash-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2.5, 0.3, 1.2]} />
          <meshStandardMaterial 
            color="#8B7355" 
            metalness={0.1} 
            roughness={0.9} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default RainGutter;