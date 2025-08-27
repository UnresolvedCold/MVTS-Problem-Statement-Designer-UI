import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Stage, Layer, Rect, Text, Group } from "react-konva";
import ObjectImage from './ObjectImage';
import { useGridPerformanceManager, useOptimizedGridLines, SpatialIndex } from './GridPerformanceManager';
import { useTheme } from '../contexts/ThemeContext';

const VirtualizedGridCanvas = ({
  rows,
  cols,
  cellSize,
  objects,
  selectedObject,
  onObjectClick,
  onObjectDragStart,
  onObjectDragEnd,
  centerTrigger
}) => {
  const { isDark } = useTheme();

  // Define theme-aware colors
  const themeColors = useMemo(() => ({
    background: isDark ? '#111827' : '#ffffff',  // gray-900 : white
    gridLines: isDark ? '#374151' : '#e5e7eb',   // gray-700 : gray-200
    coordinates: isDark ? '#9ca3af' : '#6b7280', // gray-400 : gray-500
    performanceText: isDark ? '#60a5fa' : '#2563eb' // blue-400 : blue-600
  }), [isDark]);

  // Initialize viewport with container dimensions
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const stageRef = useRef();
  const containerRef = useRef();
  const spatialIndexRef = useRef();

  // Initialize viewport dimensions on mount and resize
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

    // Initial viewport setup
    updateViewport();
    window.addEventListener('resize', updateViewport);

    // Use ResizeObserver for more accurate container size changes
    const resizeObserver = new ResizeObserver(updateViewport);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize view to show entire grid (only after viewport dimensions are set)
  useEffect(() => {
    if (containerRef.current && viewport.width > 0 && viewport.height > 0) {
      // Start with zoom level 1 instead of calculating fit-to-screen
      const initialZoom = 1;
      setZoom(initialZoom);

      if (stageRef.current) {
        stageRef.current.scale({ x: initialZoom, y: initialZoom });
        // Center the grid at zoom level 1
        const gridWidth = cols * cellSize;
        const gridHeight = rows * cellSize;
        const centerX = (viewport.width - gridWidth) / 2;
        const centerY = (viewport.height - gridHeight) / 2;

        stageRef.current.position({ x: Math.max(0, centerX), y: Math.max(0, centerY) });

        setViewport(prev => ({
          ...prev,
          x: -Math.max(0, centerX) / initialZoom,
          y: -Math.max(0, centerY) / initialZoom
        }));
      }
    }
  }, [cols, rows, cellSize, viewport.width, viewport.height]);

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
            fill={themeColors.coordinates}
            fontFamily="Arial"
            opacity={0.7}
          />
        );
      }
    }

    return coordinates;
  }, [visibleRange, cellSize, renderingConfig, themeColors.coordinates]);

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

  // Recenter on selection for grid entities (bots, PPS, MSU) only
  useEffect(() => {
    if (!stageRef.current || selectedObject?.x == null) return;
    const objX = selectedObject.x;
    const objY = selectedObject.y;
    const offsetX = viewport.width / 2 - objX * zoom - (cellSize / 2) * zoom;
    const offsetY = viewport.height / 2 - objY * zoom - (cellSize / 2) * zoom;
    stageRef.current.position({ x: offsetX, y: offsetY });
    setViewport(prev => ({
      ...prev,
      x: -offsetX / zoom,
      y: -offsetY / zoom
    }));
  }, [selectedObject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recenter only when centerTrigger changes (e.g., double-click from list)
  useEffect(() => {
    if (!stageRef.current || !selectedObject) return;
    // compute offset to center selectedObject on double-click
    const objX = selectedObject.x;
    const objY = selectedObject.y;
    const offsetX = viewport.width / 2 - objX * zoom - (cellSize / 2) * zoom;
    const offsetY = viewport.height / 2 - objY * zoom - (cellSize / 2) * zoom;
    stageRef.current.position({ x: offsetX, y: offsetY });
    setViewport(prev => ({
      ...prev,
      x: -offsetX / zoom,
      y: -offsetY / zoom
    }));
  }, [centerTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, []);

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
      {viewport.width > 0 && viewport.height > 0 && (
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
          {/* Background Layer - Now theme-aware */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={cols * cellSize}
              height={rows * cellSize}
              fill={themeColors.background}
            />
          </Layer>

          {/* Grid Layer - Optimized rendering with theme-aware colors */}
          <Layer>
            {optimizedGridLines.map(line => (
              <Rect
                key={line.key}
                x={line.x}
                y={line.y}
                width={line.width}
                height={line.height}
                fill={line.fill || themeColors.gridLines}
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
                // Use dark mode image for PPS when in dark theme
                imageSrc = isDark ? "/pps_dark.png" : "/pps.png";
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
                      fontSize={Math.max(12, Math.min(16, cellSize / 4))}
                      fontFamily="Arial"
                      fontStyle="bold"
                      fill={isDark ? '#d664fd' : '#656464'}
                      strokeWidth={0}
                      offsetX={6}
                      offsetY={6}
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
              x={10}
              y={10}
              text={`Performance: ${performanceLevel} | Visible: ${visibleRange.endX - visibleRange.startX}x${visibleRange.endY - visibleRange.startY} | Objects: ${visibleObjects.length}/${objects.length} | Zoom: ${zoom.toFixed(2)}`}
              fontSize={12}
              fill={themeColors.performanceText}
              fontFamily="Arial"
              listening={false}
            />
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default VirtualizedGridCanvas;
