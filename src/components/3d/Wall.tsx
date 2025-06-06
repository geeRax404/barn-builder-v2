import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { WallPosition } from '../../types';

interface WallProps {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  wallPosition: WallPosition;
  rotation?: [number, number, number];
  roofPitch?: number;
}

const Wall: React.FC<WallProps> = ({ 
  position, 
  width, 
  height, 
  color, 
  wallPosition, 
  rotation = [0, 0, 0],
  roofPitch = 0
}) => {
  // Create ribbed texture with enhanced lighting response
  const wallMaterial = useMemo(() => {
    const textureWidth = 512;
    const textureHeight = 512;
    const canvas = document.createElement('canvas');
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, textureWidth, textureHeight);
      
      // Create ribbed pattern with enhanced depth for better lighting
      const ribWidth = textureWidth / 16;
      const gradient = ctx.createLinearGradient(0, 0, ribWidth, 0);
      
      // Enhanced gradient for better light interaction
      const isLight = color === '#FFFFFF' || color === '#E5E7EB';
      const shadowOpacity = isLight ? 0.15 : 0.12;
      const highlightOpacity = isLight ? 0.12 : 0.15;
      
      gradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
      gradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.5})`);
      gradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity})`);
      gradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.5})`);
      gradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
      
      ctx.fillStyle = gradient;
      
      for (let x = 0; x < textureWidth; x += ribWidth) {
        ctx.fillRect(x, 0, ribWidth, textureHeight);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width/2, height/2);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide,
      // Enhanced material properties for better lighting response
      envMapIntensity: 0.3,
    });
  }, [color, width, height]);

  // Create wall geometry including roof pitch for front and back walls
  const { geometry, totalHeight } = useMemo(() => {
    if ((wallPosition === 'front' || wallPosition === 'back') && roofPitch > 0) {
      const roofHeight = (width / 2) * (roofPitch / 12);
      const totalHeight = height + roofHeight;
      
      const shape = new THREE.Shape();
      shape.moveTo(-width/2, -height/2);
      shape.lineTo(width/2, -height/2);
      shape.lineTo(width/2, height/2);
      shape.lineTo(0, height/2 + roofHeight);
      shape.lineTo(-width/2, height/2);
      shape.lineTo(-width/2, -height/2);

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      return {
        geometry: new THREE.ExtrudeGeometry(shape, extrudeSettings),
        totalHeight
      };
    }
    return { geometry: null, totalHeight: height };
  }, [width, height, wallPosition, roofPitch]);

  // Calculate UV coordinates for the extruded geometry
  const wallGeometry = useMemo(() => {
    if (geometry) {
      const uvs = geometry.attributes.uv.array;
      const positions = geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Calculate UV coordinates based on position
        const u = (x + width/2) / width;
        const v = (y + height/2) / totalHeight;
        
        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = u;
        uvs[uvIndex + 1] = v;
      }
      
      geometry.attributes.uv.needsUpdate = true;
      return geometry;
    }
    return null;
  }, [geometry, width, height, totalHeight]);

  // Calculate beam positions with proper spacing
  const beams = useMemo(() => {
    const maxSpacing = 8;
    const minSpacing = 4;
    const margin = 2;
    
    const availableWidth = width - (2 * margin);
    const numSpaces = Math.max(2, Math.floor(availableWidth / maxSpacing));
    const spacing = Math.max(minSpacing, availableWidth / numSpaces);
    
    const positions = [];
    let currentPos = -width/2 + margin;
    
    while (currentPos <= width/2 - margin) {
      positions.push(currentPos);
      currentPos += spacing;
    }
    
    return positions.map(x => {
      let beamHeight = height;
      
      if ((wallPosition === 'front' || wallPosition === 'back') && roofPitch > 0) {
        const roofHeight = (width / 2) * (roofPitch / 12);
        const relativeX = Math.abs(x);
        const ratio = 1 - (relativeX / (width/2));
        beamHeight = height + (roofHeight * ratio);
      }
      
      return { x, height: beamHeight };
    });
  }, [width, height, wallPosition, roofPitch]);

  // Create steel beam with improved materials for better lighting
  const createSteelBeam = (x: number, beamHeight: number) => {
    const beamWidth = 0.3;
    const beamDepth = 0.2;
    const flangeWidth = 0.4;
    const flangeHeight = 0.15;
    const flangeSpacing = Math.min(6, beamHeight / 4);
    
    const zOffset = wallPosition === 'front' || wallPosition === 'back' ? -0.1 : 0.1;
    
    // Enhanced steel material for better lighting response
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: "#808080",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });
    
    return (
      <group position={[x, 0, zOffset]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[beamWidth, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        {Array.from({ length: Math.ceil(beamHeight / flangeSpacing) }).map((_, i) => {
          const y = -beamHeight/2 + i * flangeSpacing;
          return (
            <mesh key={i} castShadow receiveShadow position={[0, y, 0]}>
              <boxGeometry args={[flangeWidth, flangeHeight, beamDepth * 1.2]} />
              <primitive object={steelMaterial} attach="material" />
            </mesh>
          );
        })}
      </group>
    );
  };

  // Create horizontal support beams with enhanced materials
  const createHorizontalBeams = () => {
    const heights = [0.25, 0.5, 0.75];
    const beamWidth = width - 1;
    const beamHeight = 0.3;
    const beamDepth = 0.2;
    const zOffset = wallPosition === 'front' || wallPosition === 'back' ? -0.1 : 0.1;
    
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: "#808080",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });
    
    return heights.map((heightRatio, index) => (
      <group key={index} position={[0, -height/2 + height * heightRatio, zOffset]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[beamWidth, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        {[-beamWidth/2, beamWidth/2].map((x, i) => (
          <mesh key={i} castShadow receiveShadow position={[x, 0, 0]}>
            <boxGeometry args={[beamHeight, beamHeight, beamDepth]} />
            <primitive object={steelMaterial} attach="material" />
          </mesh>
        ))}
      </group>
    ));
  };

  return (
    <group position={position} rotation={rotation}>
      {wallGeometry ? (
        <mesh castShadow receiveShadow>
          <primitive object={wallGeometry} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
      ) : (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.2]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
      )}
      
      {beams.map((beam, index) => (
        <React.Fragment key={index}>
          {createSteelBeam(beam.x, beam.height)}
        </React.Fragment>
      ))}
      
      {createHorizontalBeams()}
    </group>
  );
};

export default Wall;