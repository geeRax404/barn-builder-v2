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
  
  // Enhanced gutter material for better visibility
  const gutterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#C0C0C0',
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.2,
    });
  }, []);

  // Downspout material
  const downspoutMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#A0A0A0',
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.0,
    });
  }, []);

  // Create more prominent gutter profile
  const gutterShape = useMemo(() => {
    const shape = new THREE.Shape();
    const gutterWidth = 0.6; // Increased width for better visibility
    const gutterDepth = 0.4; // Increased depth
    
    // Create U-shaped gutter profile with thicker walls
    shape.moveTo(-gutterWidth/2, 0);
    shape.lineTo(-gutterWidth/2, -gutterDepth * 0.8);
    shape.quadraticCurveTo(0, -gutterDepth, gutterWidth/2, -gutterDepth * 0.8);
    shape.lineTo(gutterWidth/2, 0);
    shape.lineTo(gutterWidth/2 - 0.08, 0); // Thicker walls
    shape.lineTo(gutterWidth/2 - 0.08, -gutterDepth * 0.7);
    shape.quadraticCurveTo(0, -gutterDepth * 0.85, -gutterWidth/2 + 0.08, -gutterDepth * 0.7);
    shape.lineTo(-gutterWidth/2 + 0.08, 0);
    shape.closePath();
    
    return shape;
  }, []);

  // Create gutter geometry
  const gutterGeometry = useMemo(() => {
    const extrudeSettings = {
      steps: 2,
      depth: length,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    };
    return new THREE.ExtrudeGeometry(gutterShape, extrudeSettings);
  }, [gutterShape, length]);

  // Enhanced downspout geometry
  const downspoutGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.12, 0.12, height - 1, 12); // Larger and more detailed
  }, [height]);

  // Enhanced bracket geometry
  const bracketGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.15, 0.4, 0.2);
  }, []);

  // Calculate gutter positions - positioned right at roof edge
  const gutterOffset = 0.1; // Closer to the building
  const gutterHeight = height + 0.05; // Just below roof edge

  // Create more visible brackets
  const createBrackets = (side: 'left' | 'right') => {
    const brackets = [];
    const bracketSpacing = 6; // More frequent brackets
    const numBrackets = Math.ceil(length / bracketSpacing);
    const actualSpacing = length / Math.max(numBrackets - 1, 1);
    
    for (let i = 0; i < numBrackets; i++) {
      const z = -length/2 + i * actualSpacing;
      const x = side === 'left' ? -width/2 - gutterOffset : width/2 + gutterOffset;
      
      brackets.push(
        <mesh 
          key={`bracket-${side}-${i}`}
          position={[x, gutterHeight + 0.15, z]}
          castShadow
          receiveShadow
        >
          <primitive object={bracketGeometry} />
          <primitive object={gutterMaterial} attach="material" />
        </mesh>
      );
    }
    
    return brackets;
  };

  // Create front and back gutters as well
  const frontBackGutterGeometry = useMemo(() => {
    const extrudeSettings = {
      steps: 2,
      depth: width,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    };
    return new THREE.ExtrudeGeometry(gutterShape, extrudeSettings);
  }, [gutterShape, width]);

  return (
    <group>
      {/* Left side gutter - running along length */}
      <mesh
        position={[-width/2 - gutterOffset, gutterHeight - 0.2, 0]}
        rotation={[Math.PI/2, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={gutterGeometry} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* Right side gutter - running along length */}
      <mesh
        position={[width/2 + gutterOffset, gutterHeight - 0.2, 0]}
        rotation={[Math.PI/2, 0, 0]}
        castShadow
        receiveShadow
      >
        <primitive object={gutterGeometry} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* Front gutter - running along width */}
      <mesh
        position={[0, gutterHeight - 0.2, length/2 + gutterOffset]}
        rotation={[Math.PI/2, 0, Math.PI/2]}
        castShadow
        receiveShadow
      >
        <primitive object={frontBackGutterGeometry} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* Back gutter - running along width */}
      <mesh
        position={[0, gutterHeight - 0.2, -length/2 - gutterOffset]}
        rotation={[Math.PI/2, 0, Math.PI/2]}
        castShadow
        receiveShadow
      >
        <primitive object={frontBackGutterGeometry} />
        <primitive object={gutterMaterial} attach="material" />
      </mesh>

      {/* Gutter brackets for side gutters */}
      {createBrackets('left')}
      {createBrackets('right')}

      {/* Corner downspouts - larger and more visible */}
      {[
        [-width/2 - gutterOffset, (height - 1)/2 + 0.5, length/2 + gutterOffset],
        [width/2 + gutterOffset, (height - 1)/2 + 0.5, length/2 + gutterOffset],
        [-width/2 - gutterOffset, (height - 1)/2 + 0.5, -length/2 - gutterOffset],
        [width/2 + gutterOffset, (height - 1)/2 + 0.5, -length/2 - gutterOffset],
      ].map((position, index) => (
        <mesh
          key={`downspout-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <primitive object={downspoutGeometry} />
          <primitive object={downspoutMaterial} attach="material" />
        </mesh>
      ))}

      {/* Downspout elbows - more prominent */}
      {[
        [-width/2 - gutterOffset, gutterHeight - 0.5, length/2 + gutterOffset],
        [width/2 + gutterOffset, gutterHeight - 0.5, length/2 + gutterOffset],
        [-width/2 - gutterOffset, gutterHeight - 0.5, -length/2 - gutterOffset],
        [width/2 + gutterOffset, gutterHeight - 0.5, -length/2 - gutterOffset],
      ].map((position, index) => (
        <mesh
          key={`elbow-${index}`}
          position={position as [number, number, number]}
          rotation={[Math.PI/2, 0, 0]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.15, 0.12, 8, 16, Math.PI/2]} />
          <primitive object={downspoutMaterial} attach="material" />
        </mesh>
      ))}

      {/* Downspout straps - more visible mounting hardware */}
      {[
        [-width/2 - gutterOffset, height * 0.75, length/2 + gutterOffset],
        [width/2 + gutterOffset, height * 0.75, length/2 + gutterOffset],
        [-width/2 - gutterOffset, height * 0.75, -length/2 - gutterOffset],
        [width/2 + gutterOffset, height * 0.75, -length/2 - gutterOffset],
        [-width/2 - gutterOffset, height * 0.25, length/2 + gutterOffset],
        [width/2 + gutterOffset, height * 0.25, length/2 + gutterOffset],
        [-width/2 - gutterOffset, height * 0.25, -length/2 - gutterOffset],
        [width/2 + gutterOffset, height * 0.25, -length/2 - gutterOffset],
      ].map((position, index) => (
        <mesh
          key={`strap-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <torusGeometry args={[0.15, 0.03, 8, 16]} />
          <primitive object={gutterMaterial} attach="material" />
        </mesh>
      ))}

      {/* Enhanced splash blocks */}
      {[
        [-width/2 - gutterOffset, 0.15, length/2 + gutterOffset + 1.2],
        [width/2 + gutterOffset, 0.15, length/2 + gutterOffset + 1.2],
        [-width/2 - gutterOffset, 0.15, -length/2 - gutterOffset - 1.2],
        [width/2 + gutterOffset, 0.15, -length/2 - gutterOffset - 1.2],
      ].map((position, index) => (
        <mesh
          key={`splash-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[2, 0.3, 1]} />
          <meshStandardMaterial 
            color="#8B7355" 
            metalness={0.1} 
            roughness={0.9} 
          />
        </mesh>
      ))}

      {/* Gutter end caps for better detail */}
      {[
        [-width/2 - gutterOffset, gutterHeight - 0.2, -length/2],
        [-width/2 - gutterOffset, gutterHeight - 0.2, length/2],
        [width/2 + gutterOffset, gutterHeight - 0.2, -length/2],
        [width/2 + gutterOffset, gutterHeight - 0.2, length/2],
      ].map((position, index) => (
        <mesh
          key={`endcap-${index}`}
          position={position as [number, number, number]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[0.6, 0.4, 0.15]} />
          <primitive object={gutterMaterial} attach="material" />
        </mesh>
      ))}
    </group>
  );
};

export default RainGutter;