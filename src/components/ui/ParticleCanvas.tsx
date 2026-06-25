"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
}

interface Ray {
  ox: number;
  oy: number;
  tx: number;
  ty: number;
  progress: number;
  speed: number;
  alpha: number;
}

// Indigo-500 in r,g,b — matches --color-accent: #6366f1
const R = 99, G = 102, B = 241;
const col = (a: number) => `rgba(${R},${G},${B},${a})`;

export function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = canvas.parentElement?.clientHeight ?? window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const NUM = 140;
    const CONNECT = 150;
    const REPEL_R = 120;
    const rays: Ray[] = [];

    const particles: Particle[] = Array.from({ length: NUM }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.06,
      vy: (Math.random() - 0.5) * 0.06,
      r: Math.random() * 2.4 + 0.9,
      alpha: Math.random() * 0.45 + 0.25,
    }));

    const resize = () => {
      W = window.innerWidth;
      H = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      const count = 14;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const length = 55 + Math.random() * 70;
        rays.push({
          ox: e.clientX,
          oy: e.clientY,
          tx: e.clientX + Math.cos(angle) * length,
          ty: e.clientY + Math.sin(angle) * length,
          progress: 0,
          speed: 0.022 + Math.random() * 0.018,
          alpha: 0.65 + Math.random() * 0.35,
        });
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const px = mouseRef.current.x;
      const py = mouseRef.current.y;

      // Particles with mouse repel
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const dx = p.x - px;
        const dy = p.y - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_R && dist > 0) {
          const force = (REPEL_R - dist) / REPEL_R;
          p.vx += (dx / dist) * force * 0.35;
          p.vy += (dy / dist) * force * 0.35;
          p.vx *= 0.93;
          p.vy *= 0.93;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = col(p.alpha);
        ctx.fill();
      }

      // Connection edges
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT) {
            const a = (1 - d / CONNECT) * 0.28;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = col(a);
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Isovist rays (on click)
      for (let i = rays.length - 1; i >= 0; i--) {
        const c = rays[i];
        c.progress += c.speed;
        const ease = 1 - Math.pow(1 - Math.min(c.progress, 1), 3);
        const cx2 = c.ox + (c.tx - c.ox) * ease;
        const cy2 = c.oy + (c.ty - c.oy) * ease;
        const fadeAlpha = c.alpha * (1 - c.progress);

        ctx.beginPath();
        ctx.moveTo(c.ox, c.oy);
        ctx.lineTo(cx2, cy2);
        ctx.strokeStyle = col(fadeAlpha * 0.65);
        ctx.lineWidth = 0.7;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx2, cy2, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = col(fadeAlpha);
        ctx.fill();

        if (c.progress < 0.4) {
          const ringR = c.progress * 42;
          const ringA = (1 - c.progress / 0.4) * 0.45;
          ctx.beginPath();
          ctx.arc(c.ox, c.oy, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = col(ringA);
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        if (c.progress >= 1) rays.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
