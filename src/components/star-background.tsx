"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftX: number;
  driftY: number;
}

export function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      const area = canvas.width * canvas.height;
      // ~1 star per 3000px² — enough for atmosphere, not too heavy
      const count = Math.min(Math.floor(area / 3000), 600);
      stars = [];

      for (let i = 0; i < count; i++) {
        // Create layers: most stars are tiny and dim, a few are brighter
        const layer = Math.random();
        let radius: number;
        let baseOpacity: number;
        let drift: number;

        if (layer < 0.7) {
          // Distant small stars
          radius = Math.random() * 0.8 + 0.3;
          baseOpacity = Math.random() * 0.4 + 0.15;
          drift = Math.random() * 0.08 + 0.01;
        } else if (layer < 0.92) {
          // Medium stars
          radius = Math.random() * 1.2 + 0.6;
          baseOpacity = Math.random() * 0.5 + 0.3;
          drift = Math.random() * 0.12 + 0.03;
        } else {
          // Bright accent stars (rare)
          radius = Math.random() * 1.6 + 1.0;
          baseOpacity = Math.random() * 0.4 + 0.5;
          drift = Math.random() * 0.06 + 0.01;
        }

        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          opacity: baseOpacity,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
          driftX: (Math.random() - 0.5) * drift,
          driftY: -Math.random() * drift * 0.5 - 0.005, // gentle upward drift
        });
      }
    };

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 1;

      for (const star of stars) {
        // Twinkle using sine wave
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const currentOpacity = star.opacity + twinkle * star.opacity * 0.4;

        // Drift
        star.x += star.driftX;
        star.y += star.driftY;

        // Wrap around edges
        if (star.x < -5) star.x = canvas.width + 5;
        if (star.x > canvas.width + 5) star.x = -5;
        if (star.y < -5) star.y = canvas.height + 5;
        if (star.y > canvas.height + 5) star.y = -5;

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, currentOpacity))})`;
        ctx.fill();

        // Add a subtle glow for brighter stars
        if (star.radius > 1.0 && currentOpacity > 0.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 3
          );
          gradient.addColorStop(0, `rgba(167, 139, 250, ${currentOpacity * 0.15})`);
          gradient.addColorStop(1, "rgba(167, 139, 250, 0)");
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
