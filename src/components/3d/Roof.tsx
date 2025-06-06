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

  // Create separate materials for left and right roof panels
  const { leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    const createRoofTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 512;
      const textureHeight = 512;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // Create ribbed pattern with special handling for white
        const ribWidth = textureWidth / 24;
        const gradient = ctx.createLinearGradient(0, 0, ribWidth, 0);
        
        // Special handling for pure white to maintain brightness
        const isWhite = color === '#FFFFFF';
        const shadowOpacity = isWhite ? 0.08 : 0.25;
        const highlightOpacity = isWhite ? 0.05 : 0.15;
        
        gradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
        gradient.addColorStop(0.2, `rgba(255,255,255,${highlightOpacity * 0.5})`);
        gradient.addColorStop(0.4, `rgba(0,0,0,${shadowOpacity})`);
        gradient.addColorStop(0.6, `rgba(0,0,0,${shadowOpacity})`);
        gradient.addColorStop(0.8, `rgba(255,255,255,${highlightOpacity * 0.5})`);
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
      
      return texture;
    };

    // Create separate textures for each panel
    const leftTexture = createRoofTexture('left');
    const rightTexture = createRoofTexture('right');
    
    // Special material properties for white vs other colors
    const isWhite = color === '#FFFFFF';
    const materialProps = isWhite ? {
      metalness: 0.3,
      roughness: 0.6,
      envMapIntensity: 0.8,
    } : {
      metalness: 0.7,
      roughness: 0.3,
      envMapIntensity: 0.5,
    };
    
    // Create separate materials with optimized properties for white
    const leftMaterial = new THREE.MeshStandardMaterial({
      map: leftTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });

    const rightMaterial = new THREE.MeshStandardMaterial({
      map: rightTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });
    
    return { leftRoofMaterial: leftMaterial, rightRoofMaterial: rightMaterial };
  }, [color, length]);

  const skylightMaterial = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
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
        castShadow
        receiveShadow
      >
        <boxGeometry args={[skylightWidth, skylightLength, 0.2]} />
        <primitive object={skylightMaterial} attach="material" />
      </mesh>
    );
  };
  
  return (
    <group position={[0, height, 0]}>
      {/* Left roof panel with its own material */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[panelLength, 0.2, length]} />
          <primitive object={leftRoofMaterial} attach="material" />
        </mesh>
        
        {skylights.filter(s => s.xOffset < 0).map(s => createSkylight(s, true))}
      </group>
      
      {/* Right roof panel with its own material */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[panelLength, 0.2, length]} />
          <primitive object={rightRoofMaterial} attach="material" />
        </mesh>
        
        {skylights.filter(s => s.xOffset >= 0).map(s => createSkylight(s, false))}
      </group>
      
      {/* Ridge cap with special white handling */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.2 : 0.8} 
          roughness={color === '#FFFFFF' ? 0.7 : 0.2}
          envMapIntensity={color === '#FFFFFF' ? 0.6 : 1.0}
        />
      </mesh>
    </group>
  );
};

export default Roof;