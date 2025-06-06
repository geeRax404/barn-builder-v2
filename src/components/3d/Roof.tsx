import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Skylight } from '../../types';

interface RoofProps {
  width: number;
  length: number;
  height: number;
  pitch: number;
  color: string;
  skylights?: Skylight[];
}

const Roof: React.FC<RoofProps> = ({ width, length, height, pitch, color, skylights = [] }) => {
  const roofHeight = useMemo(() => {
    return (width / 2) * (pitch / 12);
  }, [width, pitch]);
  
  const pitchAngle = Math.atan2(roofHeight, width / 2);
  const panelLength = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2));

  // Create ribbed texture for both roof panels
  const roofMaterial = useMemo(() => {
    const textureWidth = 512;
    const textureHeight = 512;
    const canvas = document.createElement('canvas');
    canvas.width = textureWidth;
    canvas.height = textureHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, textureWidth, textureHeight);
      
      // Create ribbed pattern
      const ribWidth = textureWidth / 24; // More ribs for roof
      const gradient = ctx.createLinearGradient(0, 0, ribWidth, 0);
      
      // Adjust gradient stops based on color brightness
      const isLight = color === '#FFFFFF';
      const shadowOpacity = isLight ? 0.2 : 0.15;
      const highlightOpacity = isLight ? 0.1 : 0.15;
      
      gradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
      gradient.addColorStop(0.3, `rgba(0,0,0,${shadowOpacity})`);
      gradient.addColorStop(0.7, `rgba(0,0,0,${shadowOpacity})`);
      gradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
      
      ctx.fillStyle = gradient;
      
      for (let x = 0; x < textureWidth; x += ribWidth) {
        ctx.fillRect(x, 0, ribWidth, textureHeight);
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, length/2);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
  }, [color, length]);

  const skylightMaterial = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  });

  const createSkylight = (skylight: Skylight, isLeftPanel: boolean) => {
    const skylightWidth = skylight.width;
    const skylightLength = skylight.length;
    
    const xPos = skylight.xOffset;
    const yPos = skylight.yOffset;
    
    return (
      <mesh
        key={`${isLeftPanel ? 'left' : 'right'}-${xPos}-${yPos}`}
        position={[xPos, yPos, 0]}
        rotation={[0, 0, 0]}
      >
        <boxGeometry args={[skylightWidth, skylightLength, 0.2]} />
        <primitive object={skylightMaterial} attach="material" />
      </mesh>
    );
  };
  
  return (
    <group position={[0, height, 0]}>
      {/* Left roof panel */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[panelLength, 0.2, length]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        
        {skylights.filter(s => s.xOffset < 0).map(s => createSkylight(s, true))}
      </group>
      
      {/* Right roof panel */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[panelLength, 0.2, length]} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
        
        {skylights.filter(s => s.xOffset >= 0).map(s => createSkylight(s, false))}
      </group>
    </group>
  );
};

export default Roof;