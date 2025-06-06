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
  
  // Gutter material
  const gutterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#A0A0A0',
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.0,
    });
  }, []);

  // Downspout material
  const downspoutMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#909090',
      metalness: 0.7,
      roughness: 0.3,
      envMapIntensity: 0.8,
    });
  }, []);

  // Create gutter profile shape
  const gutterShape = useMemo(() => {
    const shape = new THREE.Shape();
    const gutterWidth = 0.4;
    const gutterDepth = 0.3;
    
    // Create U-shaped gutter profile
    shape.moveTo(-gutterWidth/2, 0);
    shape.lineTo(-gutterWidth/2, -gutterDepth * 0.8);
    shape.quadraticCurveTo(0, -gutterDepth, gutterWidth/2, -gutterDepth * 0.8);
    shape.lineTo(gutterWidth/2, 0);
    shape.lineTo(gutterWidth/2 - 0.05, 0);
    shape.lineTo(gutterWidth/2 - 0.05, -gutterDepth * 0.7);
    shape.quadraticCurveTo(0, -gutterDepth * 0.85, -gutterWidth/2 + 0.05, -gutterDepth * 0.7);
    shape.lineTo(-gutterWidth/2 + 0.05, 0);
    shape.closePath();
    
    return shape;
  }, []);

  // Create gutter geometry
  const gutterGeometry = useMemo(() => {
    const extrudeSettings = {
      steps: 1,
      depth: length,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(gutterShape, extrudeSettings);
  }, [gutterShape, length]);

  // Create downspout geometry
  const downspoutGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.08, 0.08, height - 1, 8);
  }, [height]);

  // Create gutter bracket geometry
  const bracketGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.1, 0.3, 0.15);
  }, []);

  // Calculate gutter positions
  const gutterOffset = 0.25; // Distance from wall edge
  const gutterHeight = height + 0.1; // Slightly below roof edge

  // Create brackets along the gutter
  const createBrackets = (side: 'left' | 'right') => {
    const brackets = [];
    const bracketSpacing = 8; // Every 8 feet
    const numBrackets = Math.ceil(length / bracketSpacing);
    const actualSpacing = length / (numBrackets - 1);
    
    for (let i = 0; i < numBrackets; i++) {
      const z = -length/2 + i * actualSpacing;
      const x = side === 'left' ? -width/2 - gutterOffset : width/2 + gutterOffset;
      
      brackets.push(
        <mesh 
          key={`bracket-${side}-${i}`}
          position={[x, gutterHeight + 0.1, z]}
          castShadow
        >
          <primitive object={bracketGeometry} />
          <primitive object={gutterMaterial} attach="material" />
        </mesh>
      );
    }
    
    return brackets;
  };

  // Create end caps for gutters
  const createEndCap = (side: 'front' | 'back', gutterSide: 'left' | 'right') => {
    const x = gutterSide === 'left' ? -width/2 - gutterOffset : width/2 + gutterOffset;
    const z = side === 'front' ? length/2 : -length/2;
    
    return (
      <mesh
        key={`endcap-${side}-${gutterSide}`}
        position={[x, gutterHeight - 0.15, z]}
        rotation={[0, 0, 0]}
        castShadow
      >
        <boxGeometry args={[0.4, 0.3, 0.1]} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>
    );
  };

  // Create corner pieces where gutters meet
  const createCornerPiece = (corner: 'front-left' | 'front-right' | 'back-left' | 'back-right') => {
    const x = corner.includes('left') ? -width/2 - gutterOffset : width/2 + gutterOffset;
    const z = corner.includes('front') ? length/2 : -length/2;
    
    return (
      <mesh
        key={`corner-${corner}`}
        position={[x, gutterHeight - 0.15, z]}
        castShadow
      >
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>
    );
  };

  return (
    <group>
      {/* Left side gutter */}
      <mesh
        position={[-width/2 - gutterOffset, gutterHeight - 0.15, 0]}
        rotation={[Math.PI/2, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={gutterGeometry} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* Right side gutter */}
      <mesh
        position={[width/2 + gutterOffset, gutterHeight - 0.15, 0]}
        rotation={[Math.PI/2, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={gutterGeometry} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* Gutter brackets */}
      {createBrackets('left')}
      {createBrackets('right')}

      {/* Corner pieces */}
      {createCornerPiece('front-left')}
      {createCornerPiece('front-right')}
      {createCornerPiece('back-left')}
      {createCornerPiece('back-right')}

      {/* Downspouts - positioned at corners */}
      {/* Front left downspout */}
      <mesh
        position={[-width/2 - gutterOffset, (height - 1)/2 + 0.5, length/2]}
        castShadow
      >
        <primitive object={downspoutGeometry} />
        <primitive object={downspoutMaterial} attach="material" />
      </mesh>

      {/* Front right downspout */}
      <mesh
        position={[width/2 + gutterOffset, (height - 1)/2 + 0.5, length/2]}
        castShadow
      >
        <primitive object={downspoutGeometry} />
        <primitive object={downspoutMaterial} attach="material" />
      </mesh>

      {/* Back left downspout */}
      <mesh
        position={[-width/2 - gutterOffset, (height - 1)/2 + 0.5, -length/2]}
        castShadow
      >
        <primitive object={downspoutGeometry} />
        <primitive object={downspoutMaterial} attach="material" />
      </mesh>

      {/* Back right downspout */}
      <mesh
        position={[width/2 + gutterOffset, (height - 1)/2 + 0.5, -length/2]}
        castShadow
      >
        <primitive object={downspoutGeometry} />
        <primitive object={downspoutMaterial} attach="material" />
      </mesh>

      {/* Downspout elbows connecting gutter to downspout */}
      {[
        [-width/2 - gutterOffset, gutterHeight - 0.4, length/2],
        [width/2 + gutterOffset, gutterHeight - 0.4, length/2],
        [-width/2 - gutterOffset, gutterHeight - 0.4, -length/2],
        [width/2 + gutterOffset, gutterHeight - 0.4, -length/2],
      ].map((position, index) => (
        <mesh
          key={`elbow-${index}`}
          position={position as [number, number, number]}
          rotation={[Math.PI/2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.1, 0.08, 8, 16, Math.PI/2]} />
          <primitive object={downspoutMaterial} attach="material" />
        </mesh>
      ))}

      {/* Downspout straps - mounting hardware */}
      {[
        [-width/2 - gutterOffset, height * 0.75, length/2],
        [width/2 + gutterOffset, height * 0.75, length/2],
        [-width/2 - gutterOffset, height * 0.75, -length/2],
        [width/2 + gutterOffset, height * 0.75, -length/2],
        [-width/2 - gutterOffset, height * 0.25, length/2],
        [width/2 + gutterOffset, height * 0.25, length/2],
        [-width/2 - gutterOffset, height * 0.25, -length/2],
        [width/2 + gutterOffset, height * 0.25, -length/2],
      ].map((position, index) => (
        <mesh
          key={`strap-${index}`}
          position={position as [number, number, number]}
          castShadow
        >
          <torusGeometry args={[0.12, 0.02, 8, 16]} />
          <primitive object={gutterMaterial} attach="material" />
        </mesh>
      ))}

      {/* Splash blocks at base of downspouts */}
      {[
        [-width/2 - gutterOffset, 0.1, length/2 + 1],
        [width/2 + gutterOffset, 0.1, length/2 + 1],
        [-width/2 - gutterOffset, 0.1, -length/2 - 1],
        [width/2 + gutterOffset, 0.1, -length/2 - 1],
      ].map((position, index) => (
        <mesh
          key={`splash-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.5, 0.2, 0.8]} />
          <meshStandardMaterial 
            color="#6B7280" 
            metalness={0.1} 
            roughness={0.8} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default RainGutter;