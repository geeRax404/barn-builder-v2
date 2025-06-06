import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingStore } from '../../store/buildingStore';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';

const Building: React.FC = () => {
  const { dimensions, features, color, roofColor, skylights } = useBuildingStore((state) => state.currentProject.building);
  
  const halfWidth = dimensions.width / 2;
  const halfLength = dimensions.length / 2;
  
  // Calculate total height including roof peak
  const roofHeight = (dimensions.width / 2) * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;
  
  return (
    <group>
      {/* Floor/Foundation */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[dimensions.width, 0.2, dimensions.length]} />
        <meshStandardMaterial 
          color="#9ca3af" 
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {/* Front wall */}
      <Wall 
        position={[0, dimensions.height/2, halfLength]} 
        width={dimensions.width}
        height={dimensions.height}
        color={color}
        wallPosition="front"
        roofPitch={dimensions.roofPitch}
      />
      
      {/* Back wall */}
      <Wall 
        position={[0, dimensions.height/2, -halfLength]} 
        width={dimensions.width}
        height={dimensions.height}
        color={color}
        wallPosition="back"
        roofPitch={dimensions.roofPitch}
        rotation={[0, Math.PI, 0]}
      />
      
      {/* Left wall */}
      <Wall 
        position={[-halfWidth, dimensions.height/2, 0]} 
        width={dimensions.length}
        height={dimensions.height}
        color={color}
        wallPosition="left"
        rotation={[0, Math.PI / 2, 0]}
      />
      
      {/* Right wall */}
      <Wall 
        position={[halfWidth, dimensions.height/2, 0]} 
        width={dimensions.length}
        height={dimensions.height}
        color={color}
        wallPosition="right"
        rotation={[0, -Math.PI / 2, 0]}
      />
      
      {/* Roof */}
      <Roof
        width={dimensions.width}
        length={dimensions.length}
        height={dimensions.height}
        pitch={dimensions.roofPitch}
        color={roofColor}
        skylights={skylights}
      />
      
      {/* Wall Features (doors, windows, etc.) */}
      {features.map((feature) => (
        <WallFeature
          key={feature.id}
          feature={feature}
          buildingDimensions={dimensions}
        />
      ))}
    </group>
  );
};

export default Building;