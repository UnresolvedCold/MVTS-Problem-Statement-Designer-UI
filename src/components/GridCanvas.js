import React from 'react';
import { Stage, Layer, Rect, Text } from "react-konva";
import ObjectImage from './ObjectImage';

const GridCanvas = ({ 
  rows, 
  cols, 
  cellSize, 
  objects, 
  selectedObject,
  onObjectClick,
  onObjectDragEnd 
}) => {
  return (
    <Stage
      width={cols * cellSize}
      height={rows * cellSize}
      style={{ border: "1px solid black" }}
    >
      <Layer>
        {/* Draw grid lines */}
        {[...Array(cols)].map((_, i) => (
          <Rect
            key={`v${i}`}
            x={i * cellSize}
            y={0}
            width={1}
            height={rows * cellSize}
            fill="grey"
          />
        ))}
        {[...Array(rows)].map((_, j) => (
          <Rect
            key={`h${j}`}
            x={0}
            y={j * cellSize}
            width={cols * cellSize}
            height={1}
            fill="grey"
          />
        ))}
        
        {/* Draw grid coordinates */}
        {[...Array(cols)].map((_, i) => 
          [...Array(rows)].map((_, j) => (
            <Text
              key={`coord-${i}-${j}`}
              x={i * cellSize + 5}
              y={j * cellSize + 5}
              text={`(${i},${j})`}
              fontSize={Math.min(cellSize / 4, 10)}
              fill="lightgray"
              fontFamily="Arial"
            />
          ))
        )}
      </Layer>

      {/* Objects Layer */}
      <Layer>
        {objects.map((obj) => {
          let imageSrc;
          if (obj.type === "bot") {
            imageSrc = "/tree.png";
          } else if (obj.type === "msu") {
            imageSrc = "/logo192.png"; // Using React logo for MSU objects
          } else {
            imageSrc = "/house.png"; // PPS
          }
          
          return (
            <ObjectImage
              key={obj.id}
              x={obj.x}
              y={obj.y}
              src={imageSrc}
              gridWidth={cols * cellSize}
              gridHeight={rows * cellSize}
              cellSize={cellSize}
              isSelected={selectedObject?.id === obj.id}
              onClick={() => onObjectClick(obj)}
              onDragEnd={(x, y) => onObjectDragEnd(obj.id, x, y)}
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default GridCanvas;
