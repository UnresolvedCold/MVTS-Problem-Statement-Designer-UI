import React from "react";
import { Image } from "react-konva";
import useImage from "use-image";

// Component for object (bot/pps)
const ObjectImage = ({ 
  x, 
  y, 
  src, 
  onDragEnd, 
  gridWidth, 
  gridHeight, 
  cellSize, 
  isSelected, 
  onClick 
}) => {
  const [image] = useImage(src);
  const objectSize = 50; // Size of the object image
  
  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={objectSize}
      height={objectSize}
      draggable
      stroke={isSelected ? "#007bff" : "transparent"}
      strokeWidth={isSelected ? 3 : 0}
      onClick={onClick}
      dragBoundFunc={(pos) => {
        // Restrict dragging to within grid boundaries
        const newX = Math.max(0, Math.min(pos.x, gridWidth - objectSize));
        const newY = Math.max(0, Math.min(pos.y, gridHeight - objectSize));
        return { x: newX, y: newY };
      }}
      onDragEnd={(e) => {
        console.log('ObjectImage onDragEnd triggered');
        
        // Calculate the center of the object
        const centerX = e.target.x() + objectSize / 2;
        const centerY = e.target.y() + objectSize / 2;
        
        // Snap based on which grid cell the center is in
        let snappedX = Math.floor(centerX / cellSize) * cellSize;
        let snappedY = Math.floor(centerY / cellSize) * cellSize;
        
        // Restrict position to be within grid boundaries
        // Make sure the object doesn't go outside the canvas
        snappedX = Math.max(0, Math.min(snappedX, gridWidth - objectSize));
        snappedY = Math.max(0, Math.min(snappedY, gridHeight - objectSize));
        
        console.log('Calling onDragEnd with position:', snappedX, snappedY);
        onDragEnd(snappedX, snappedY);
      }}
    />
  );
};

export default ObjectImage;
