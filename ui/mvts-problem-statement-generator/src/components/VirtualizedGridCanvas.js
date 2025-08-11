import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from "react-konva";
import ObjectImage from './ObjectImage';
import { useGridPerformanceManager, useOptimizedGridLines, SpatialIndex } from './GridPerformanceManager';

const VirtualizedGridCanvas = ({
  rows,
  cols,
  cellSize,
  objects,
  selectedObject,
  onObjectClick,
  onObjectDragStart,
  onObjectDragEnd
}) => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef();
  const containerRef = useRef();
  const spatialIndexRef = useRef();

  // Initialize spatial index for large object counts
  useEffect(() => {
    if (objects.length > 500) {
      spatialIndexRef.current = new SpatialIndex(cellSize, cols * cellSize, rows * cellSize);
      spatialIndexRef.current.rebuild(objects);
    }
  }, [objects, cellSize, cols, rows]);

  // Performance management
  const { performanceLevel, renderingConfig, viewportBuffer } = useGridPerformanceManager(
    rows, cols, cellSize, zoom, viewport
  );

  // Update viewport when container resizes
  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport(prev => ({
          ...prev,
          width: rect.width,
          height: rect.height
        }));
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Calculate visible grid range with performance-based buffer
  const visibleRange = useMemo(() => {
    const buffer = viewportBuffer;
    const startX = Math.max(0, Math.floor(viewport.x / cellSize) - buffer);
    const endX = Math.min(cols, Math.ceil((viewport.x + viewport.width) / cellSize) + buffer);
    const startY = Math.max(0, Math.floor(viewport.y / cellSize) - buffer);
    const endY = Math.min(rows, Math.ceil((viewport.y + viewport.height) / cellSize) + buffer);

    return { startX, endX, startY, endY };
  }, [viewport, cellSize, rows, cols, viewportBuffer]);

  // Optimized grid lines
  const optimizedGridLines = useOptimizedGridLines(visibleRange, cellSize, renderingConfig, rows, cols);

  // Generate visible coordinate labels with performance considerations
  const visibleCoordinates = useMemo(() => {
    if (!renderingConfig.showCoordinates) return [];

    const { startX, endX, startY, endY } = visibleRange;
    const coordinates = [];
    const step = renderingConfig.coordinateStep;

    for (let i = startX; i < endX; i += step) {
      for (let j = startY; j < endY; j += step) {
        coordinates.push(
          <Text
            key={`coord-${i}-${j}`}
            x={i * cellSize + 5}
            y={j * cellSize + 5}
            text={`(${i},${j})`}
            fontSize={Math.min(cellSize / 4, 10)}
            fill="lightgray"
            fontFamily="Arial"
            opacity={0.7}
          />
        );
      }
    }

    return coordinates;
  }, [visibleRange, cellSize, renderingConfig]);

  // Filter visible objects using spatial index when available
  const visibleObjects = useMemo(() => {
    const { startX, endX, startY, endY } = visibleRange;

    let filteredObjects;
    if (spatialIndexRef.current && objects.length > 500) {
      filteredObjects = spatialIndexRef.current.getObjectsInRange(startX, endX, startY, endY);
    } else {
      filteredObjects = objects.filter(obj => {
        if (obj.x === null || obj.y === null || obj.x === undefined || obj.y === undefined) {
          return false;
        }
        const objGridX = Math.floor(obj.x / cellSize);
        const objGridY = Math.floor(obj.y / cellSize);
        return objGridX >= startX && objGridX < endX && objGridY >= startY && objGridY < endY;
      });
    }

    // Limit visible objects for performance
    return filteredObjects.slice(0, renderingConfig.maxVisibleObjects);
  }, [objects, visibleRange, cellSize, renderingConfig.maxVisibleObjects]);

  // Handle stage events for panning and zooming
  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();

    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    // Fixed zoom range: 10% to 150% of original scale
    const minZoom = 0.5;  // 10% of original
    const maxZoom = 1.5;  // 150% of original

    const clampedScale = Math.max(minZoom, Math.min(maxZoom, newScale));

    if (clampedScale !== oldScale) {
      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      };

      stage.scale({ x: clampedScale, y: clampedScale });
      stage.position(newPos);

      setZoom(clampedScale);
      setViewport(prev => ({
        ...prev,
        x: -newPos.x / clampedScale,
        y: -newPos.y / clampedScale
      }));
    }
  }, [viewport, cols, rows, cellSize]);

  const handleDragMove = useCallback(() => {
    const stage = stageRef.current;
    const pos = stage.position();
    const scale = stage.scaleX();

    setViewport(prev => ({
      ...prev,
      x: -pos.x / scale,
      y: -pos.y / scale
    }));
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        width={viewport.width}
        height={viewport.height}
        draggable
        onWheel={handleWheel}
        onDragMove={handleDragMove}
        scaleX={zoom}
        scaleY={zoom}
      >
        {/* Background Layer */}
        <Layer>
          <Rect
            x={viewport.x}
            y={viewport.y}
            width={viewport.width / zoom}
            height={viewport.height / zoom}
            fill="white"
          />
        </Layer>

        {/* Grid Layer - Optimized rendering with boundaries */}
        <Layer>
          {optimizedGridLines.map(line => (
            <Rect
              key={line.key}
              x={line.x}
              y={line.y}
              width={line.width}
              height={line.height}
              fill={line.fill || "grey"}
              opacity={line.opacity}
            />
          ))}
          {visibleCoordinates}
        </Layer>

        {/* Objects Layer */}
        <Layer>
          {visibleObjects.map((obj) => {
            let imageSrc;
            if (obj.type === "bot") {
              imageSrc = "/bot.png";
            } else if (obj.type === "msu") {
              imageSrc = "/msu.png";
            } else {
              imageSrc = "/pps.png";
            }

            return (
              <Group key={obj.id}>
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
                {/* Object ID Label - conditional rendering based on performance */}
                {renderingConfig.showObjectLabels && (
                  <Text
                    x={obj.x + 25}
                    y={obj.y + 15}
                    text={obj.properties?.id?.toString() || obj.id.toString()}
                    fontSize={Math.max(8, Math.min(12, cellSize / 4))}
                    fontFamily="Arial"
                    fontStyle="bold"
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    offsetX={6}
                    offsetY={6}
                    shadowColor="black"
                    shadowBlur={2}
                    shadowOpacity={0.8}
                    listening={false}
                  />
                )}
              </Group>
            );
          })}
        </Layer>

        {/* Performance Info Layer */}
        <Layer>
          <Text
            x={viewport.x + 10}
            y={viewport.y + 10}
            text={`Performance: ${performanceLevel} | Visible: ${visibleRange.endX - visibleRange.startX}x${visibleRange.endY - visibleRange.startY} | Objects: ${visibleObjects.length}/${objects.length} | Zoom: ${zoom.toFixed(2)}`}
            fontSize={12}
            fill="blue"
            fontFamily="Arial"
            listening={false}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default VirtualizedGridCanvas;
