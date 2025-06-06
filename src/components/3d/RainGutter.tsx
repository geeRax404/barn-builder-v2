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

  // Position gutters at the exact roof edge - accounting for wall thickness
  const gutterHeight = height - 0.2; // Slightly below roof edge
  const wallThickness = 0.1; // Account for wall thickness

  return (
    <group>
      {/* FRONT GUTTER - positioned at the EXACT front edge of the roof */}
      <mesh
        position={[0, gutterHeight, (length/2) + wallThickness]}
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

      {/* BACK GUTTER - positioned at the EXACT back edge of the roof */}
      <mesh
        position={[0, gutterHeight, -(length/2) - wallThickness]}
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
        [-width/2, (height - 1)/2 + 0.5, (length/2) + wallThickness],
        // Front right corner  
        [width/2, (height - 1)/2 + 0.5, (length/2) + wallThickness],
        // Back left corner
        [-width/2, (height - 1)/2 + 0.5, -(length/2) - wallThickness],
        // Back right corner
        [width/2, (height - 1)/2 + 0.5, -(length/2) - wallThickness],
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
        [-width/2, gutterHeight - 0.3, (length/2) + wallThickness],
        [width/2, gutterHeight - 0.3, (length/2) + wallThickness],
        [-width/2, gutterHeight - 0.3, -(length/2) - wallThickness],
        [width/2, gutterHeight - 0.3, -(length/2) - wallThickness],
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

      {/* Gutter mounting brackets - ONLY on front and back walls */}
      {(() => {
        const brackets = [];
        const bracketSpacing = 8;
        
        // Front gutter brackets - positioned on the wall face
        for (let i = 0; i <= Math.floor(width / bracketSpacing); i++) {
          const x = -width/2 + i * bracketSpacing;
          if (Math.abs(x) <= width/2) {
            brackets.push(
              <mesh 
                key={`bracket-front-${i}`}
                position={[x, gutterHeight + 0.2, length/2]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.2, 0.5, 0.3]} />
                <primitive object={gutterMaterial} attach="material" />
              </mesh>
            );
          }
        }
        
        // Back gutter brackets - positioned on the wall face
        for (let i = 0; i <= Math.floor(width / bracketSpacing); i++) {
          const x = -width/2 + i * bracketSpacing;
          if (Math.abs(x) <= width/2) {
            brackets.push(
              <mesh 
                key={`bracket-back-${i}`}
                position={[x, gutterHeight + 0.2, -length/2]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.2, 0.5, 0.3]} />
                <primitive object={gutterMaterial} attach="material" />
              </mesh>
            );
          }
        }
        
        return brackets;
      })()}

      {/* Downspout mounting straps - only at corners */}
      {[
        [-width/2, height * 0.75, (length/2) + wallThickness],
        [width/2, height * 0.75, (length/2) + wallThickness],
        [-width/2, height * 0.75, -(length/2) - wallThickness],
        [width/2, height * 0.75, -(length/2) - wallThickness],
        [-width/2, height * 0.25, (length/2) + wallThickness],
        [width/2, height * 0.25, (length/2) + wallThickness],
        [-width/2, height * 0.25, -(length/2) - wallThickness],
        [width/2, height * 0.25, -(length/2) - wallThickness],
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

      {/* Splash blocks at ground level - only at corners */}
      {[
        [-width/2, 0.15, (length/2) + wallThickness + 1.5],
        [width/2, 0.15, (length/2) + wallThickness + 1.5],
        [-width/2, 0.15, -(length/2) - wallThickness - 1.5],
        [width/2, 0.15, -(length/2) - wallThickness - 1.5],
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