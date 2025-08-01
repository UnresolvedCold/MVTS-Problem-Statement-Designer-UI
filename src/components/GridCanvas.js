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
  onObjectDragStart,
  onObjectDragEnd 
}) => {
  return (
    <Stage
      width={cols * cellSize}
      height={rows * cellSize}
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
            imageSrc = "/bot.png";
          } else if (obj.type === "msu") {
            imageSrc = "/msu.png"; // Using React logo for MSU objects
          } else {
            imageSrc = "/pps.png"; // PPS
          }
          
          return (
            <React.Fragment key={obj.id}>
              <ObjectImage
                x={obj.x}
                y={obj.y}
                src={imageSrc}
                gridWidth={cols * cellSize}
                gridHeight={rows * cellSize}
                cellSize={cellSize}
                isSelected={selectedObject?.id === obj.id}
                onClick={() => onObjectClick(obj)}
                onDragStart={() => onObjectDragStart && onObjectDragStart(obj)}
                onDragEnd={(x, y) => onObjectDragEnd(obj.id, x, y)}
              />
              {/* ID Label overlay on the object */}
              <Text
                x={obj.x + 25} // Center horizontally (objectSize/2 = 50/2 = 25)
                y={obj.y + 15} // Center vertically, slightly above center
                text={obj.properties?.id?.toString() || obj.id.toString()}
                fontSize={12}
                fontFamily="Arial"
                fontStyle="bold"
                fill="white"
                stroke="black"
                strokeWidth={1}
                offsetX={6} // Offset to center the text (approximate half of text width)
                offsetY={6} // Offset to center the text vertically
                shadowColor="black"
                shadowBlur={2}
                shadowOpacity={0.8}
                listening={false} // Make text non-interactive
              />
            </React.Fragment>
          );
        })}
      </Layer>
    </Stage>
  );
};

export default GridCanvas;
