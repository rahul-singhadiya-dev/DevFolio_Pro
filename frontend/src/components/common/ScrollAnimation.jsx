// src/components/common/ScrollAnimation.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';

const TOTAL_FRAMES = 260;
const FRAME_PATH = '/scroll-frames/ezgif-frame-';

// Build all frame URLs
const frameUrls = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const num = String(i + 1).padStart(3, '0');
  return `${FRAME_PATH}${num}.jpg`;
});

const ScrollAnimation = ({ children }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload all images
  useEffect(() => {
    let loadedCount = 0;
    const images = new Array(TOTAL_FRAMES);

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === TOTAL_FRAMES) {
        imagesRef.current = images;
        setIsLoaded(true);
      }
    };

    frameUrls.forEach((src, i) => {
      const img = new Image();
      img.src = src;
      img.onload = onLoad;
      img.onerror = onLoad; // count errors to avoid infinite wait
      images[i] = img;
    });

    return () => {
      // Cleanup
      images.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    };
  }, []);

  // Draw frame on canvas — cover the canvas (no zoom, edge-to-edge)
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const img = imagesRef.current[frameIndex];
    if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) return;

    // Set canvas to its display size
    const dpr = window.devicePixelRatio || 1;
    const displayW = canvas.clientWidth;
    const displayH = canvas.clientHeight;

    if (canvas.width !== displayW * dpr || canvas.height !== displayH * dpr) {
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, displayW, displayH);

    // object-fit: cover — fill canvas without zoom, maintain aspect ratio
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = displayW / displayH;

    let drawW, drawH, offsetX, offsetY;

    if (canvasAspect > imgAspect) {
      // Canvas is wider than image — match width
      drawW = displayW;
      drawH = displayW / imgAspect;
      offsetX = 0;
      offsetY = (displayH - drawH) / 2;
    } else {
      // Canvas is taller than image — match height
      drawH = displayH;
      drawW = displayH * imgAspect;
      offsetX = (displayW - drawW) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
  }, []);

  // Scroll handler — map scroll progress to frame index
  useEffect(() => {
    if (!isLoaded) return;

    // Draw initial frame
    drawFrame(0);

    const handleScroll = () => {
      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) {
          rafRef.current = null;
          return;
        }

        const rect = container.getBoundingClientRect();
        const windowH = window.innerHeight;

        // Calculate scroll progress:
        // 0 when the top of container hits the top of viewport
        // 1 when the bottom of container leaves the viewport
        const scrollableDistance = container.scrollHeight - windowH;
        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.floor(progress * TOTAL_FRAMES)
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }

        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isLoaded, drawFrame]);

  // Handle resize to re-draw current frame
  useEffect(() => {
    if (!isLoaded) return;

    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded, drawFrame]);

  return (
    <div
      ref={containerRef}
      className="scroll-animation-container"
    >
      <div className="scroll-animation-sticky">
        <canvas
          ref={canvasRef}
          className="scroll-animation-canvas"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="scroll-animation-overlay" />
        {/* Content overlay — children rendered on top of canvas */}
        {children && (
          <div className="scroll-animation-content">
            {children}
          </div>
        )}
        {/* Loading overlay */}
        {!isLoaded && (
          <div className="scroll-animation-loader">
            <div className="scroll-animation-spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrollAnimation;
