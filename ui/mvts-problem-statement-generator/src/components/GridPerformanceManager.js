import { useMemo, useState, useEffect } from 'react';

/**
 * Performance manager for grid rendering optimizations
 * Provides level-of-detail calculations and rendering decisions
 */
export const useGridPerformanceManager = (rows, cols, cellSize, zoom, viewport) => {

  // Calculate performance level based on grid size and zoom
  const performanceLevel = useMemo(() => {
    const totalCells = rows * cols;
    const visibleCells = (viewport.width / cellSize) * (viewport.height / cellSize);

    if (totalCells > 500000 || visibleCells > 10000) return 'low'; // Very large grids
    if (totalCells > 100000 || visibleCells > 2500) return 'medium'; // Large grids
    return 'high'; // Normal grids
  }, [rows, cols, cellSize, viewport]);

  // Determine what should be rendered based on performance level and zoom
  const renderingConfig = useMemo(() => {
    const config = {
      showGrid: true,
      showCoordinates: true,
      showObjectLabels: true,
      gridLineOpacity: 0.5,
      coordinateStep: 1,
      maxVisibleObjects: Infinity
    };

    // More aggressive performance adjustments
    switch (performanceLevel) {
      case 'low':
        config.showGrid = zoom > 0.5; // Only show grid when zoomed in more
        config.showCoordinates = zoom > 1.0 && cellSize > 50; // Much stricter coordinate rendering
        config.showObjectLabels = zoom > 0.8;
        config.gridLineOpacity = Math.min(0.3, zoom * 0.6);
        config.coordinateStep = Math.max(10, Math.floor(100 / cellSize)); // Show fewer coordinates
        config.maxVisibleObjects = 500; // Reduce visible objects significantly
        break;

      case 'medium':
        config.showGrid = zoom > 0.3;
        config.showCoordinates = zoom > 0.7 && cellSize > 35;
        config.showObjectLabels = zoom > 0.5;
        config.gridLineOpacity = Math.min(0.4, zoom);
        config.coordinateStep = Math.max(5, Math.floor(50 / cellSize));
        config.maxVisibleObjects = 1000;
        break;

      default: // high performance
        config.showCoordinates = cellSize > 25 && zoom > 0.3;
        config.coordinateStep = cellSize < 40 ? 5 : 2;
        config.maxVisibleObjects = 2000;
        break;
    }

    return config;
  }, [performanceLevel, zoom, cellSize]);

  // Calculate buffer size for viewport culling
  const viewportBuffer = useMemo(() => {
    switch (performanceLevel) {
      case 'low': return 2; // Minimal buffer for large grids
      case 'medium': return 5; // Medium buffer
      default: return 10; // Generous buffer for smooth scrolling
    }
  }, [performanceLevel]);

  return {
    performanceLevel,
    renderingConfig,
    viewportBuffer
  };
};

/**
 * Memoized grid line generator with complete boundary rendering and cell boundaries
 */
export const useOptimizedGridLines = (visibleRange, cellSize, renderingConfig, rows, cols) => {
  return useMemo(() => {
    if (!renderingConfig.showGrid) return [];

    const { startX, endX, startY, endY } = visibleRange;
    const lines = [];
    const opacity = renderingConfig.gridLineOpacity;

    // Always render complete grid boundaries first (darker outer border)
    lines.push({
      type: 'boundary-left',
      key: 'boundary-left',
      x: 0,
      y: 0,
      width: 2,
      height: rows * cellSize,
      opacity: Math.min(1, opacity * 2),
      fill: '#333'
    });

    lines.push({
      type: 'boundary-right',
      key: 'boundary-right',
      x: cols * cellSize - 2,
      y: 0,
      width: 2,
      height: rows * cellSize,
      opacity: Math.min(1, opacity * 2),
      fill: '#333'
    });

    lines.push({
      type: 'boundary-top',
      key: 'boundary-top',
      x: 0,
      y: 0,
      width: cols * cellSize,
      height: 2,
      opacity: Math.min(1, opacity * 2),
      fill: '#333'
    });

    lines.push({
      type: 'boundary-bottom',
      key: 'boundary-bottom',
      x: 0,
      y: rows * cellSize - 2,
      width: cols * cellSize,
      height: 2,
      opacity: Math.min(1, opacity * 2),
      fill: '#333'
    });

    // Render cell boundaries (soft grey lines for each cell)
    // Only render if cell size is reasonable and performance allows
    if (cellSize >= 5 && opacity > 0.2) {
      // Calculate step size to reduce number of lines for performance
      const lineStep = cellSize < 10 ? Math.max(5, Math.floor(50 / cellSize)) : 1;

      // Vertical cell lines - render with step optimization
      for (let i = startX; i <= Math.min(cols, endX); i += lineStep) {
        lines.push({
          type: 'cell-vertical',
          key: `cv${i}`,
          x: i * cellSize,
          y: Math.max(0, startY * cellSize),
          width: 1,
          height: Math.min(rows * cellSize, (Math.min(rows, endY) - Math.max(0, startY)) * cellSize),
          opacity: opacity * 0.4,
          fill: '#d0d0d0'
        });
      }

      // Horizontal cell lines - render with step optimization
      for (let j = startY; j <= Math.min(rows, endY); j += lineStep) {
        lines.push({
          type: 'cell-horizontal',
          key: `ch${j}`,
          x: Math.max(0, startX * cellSize),
          y: j * cellSize,
          width: Math.min(cols * cellSize, (Math.min(cols, endX) - Math.max(0, startX)) * cellSize),
          height: 1,
          opacity: opacity * 0.4,
          fill: '#d0d0d0'
        });
      }
    }

    return lines;
  }, [visibleRange, cellSize, renderingConfig, rows, cols]);
};

/**
 * Spatial indexing for objects (for very large object counts)
 */
export class SpatialIndex {
  constructor(cellSize, gridWidth, gridHeight) {
    this.cellSize = cellSize;
    this.gridWidth = Math.ceil(gridWidth / cellSize);
    this.gridHeight = Math.ceil(gridHeight / cellSize);
    this.buckets = new Map();
  }

  // Add object to spatial index
  addObject(obj) {
    if (obj.x == null || obj.y == null) return;

    const gridX = Math.floor(obj.x / this.cellSize);
    const gridY = Math.floor(obj.y / this.cellSize);
    const key = `${gridX},${gridY}`;

    if (!this.buckets.has(key)) {
      this.buckets.set(key, []);
    }
    this.buckets.get(key).push(obj);
  }

  // Get objects in visible range
  getObjectsInRange(startX, endX, startY, endY) {
    const objects = [];

    for (let x = startX; x < endX; x++) {
      for (let y = startY; y < endY; y++) {
        const key = `${x},${y}`;
        const bucket = this.buckets.get(key);
        if (bucket) {
          objects.push(...bucket);
        }
      }
    }

    return objects;
  }

  // Rebuild index (call when objects change)
  rebuild(objects) {
    this.buckets.clear();
    objects.forEach(obj => this.addObject(obj));
  }
}

/**
 * Debounced viewport update to prevent excessive re-renders during panning
 */
export const useViewportDebounce = (viewport, delay = 16) => {
  const [debouncedViewport, setDebouncedViewport] = useState(viewport);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedViewport(viewport);
    }, delay);

    return () => clearTimeout(timer);
  }, [viewport, delay]);

  return debouncedViewport;
};
