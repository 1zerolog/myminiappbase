"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const GRID = 25;
const CELL = 20;
const BASE_TICK_MS = 120;

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      // For demo purposes, we'll simulate a connection
      // In a real mini app, this would be handled by the Farcaster client
      console.log("Connect wallet clicked - this would open Farcaster wallet connection");
      alert("In a real Farcaster mini app, this would connect your wallet. For demo purposes, you can play without connecting!");
      setIsConnected(true);
      setUserAddress("demo-user");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const shareScore = async (score: number) => {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      const shareText = `🐍 Just scored ${score} points in Snake! Can you beat my score? ${url}`;
      
      // Try to open Farcaster compose first, fallback to Twitter
      const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      
      // Try Farcaster first, if it fails, try Twitter
      try {
        window.open(farcasterUrl, '_blank');
      } catch {
        window.open(twitterUrl, '_blank');
      }
    } catch (error) {
      console.error("Failed to share score:", error);
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "#000",
        color: "#fff",
        padding: 16,
      }}
    >
      {!isConnected ? (
        <Gate onConnect={connectWallet} />
      ) : (
        <Game
          onShare={shareScore}
          playerAddress={userAddress ?? undefined}
        />
      )}
    </main>
  );
}

function Gate({ onConnect }: { onConnect: () => void }) {
  return (
    <section style={{ display: "grid", gap: 12, placeItems: "center", textAlign: "center" }}>
      <h1 style={{ margin: 0 }}>🐍 Snake</h1>
      <p style={{ opacity: 0.8, maxWidth: 420 }}>
        Connect your wallet to start. You can play with keyboard arrows, on-screen controls, or touch swipes.
      </p>
      <button
        onClick={onConnect}
        style={{
          padding: "16px 32px",
          borderRadius: 12,
          border: "2px solid #4caf50",
          background: "linear-gradient(135deg, #4caf50, #45a049)",
          color: "#fff",
          fontSize: 18,
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(76, 175, 80, 0.4)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
        }}
      >
        🔗 Connect Wallet
      </button>
    </section>
  );
}

function Game({ onShare, playerAddress }: { onShare: (score: number) => void; playerAddress?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loopRef = useRef<number | null>(null);

  const [snake, setSnake] = useState<Point[]>([
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 },
  ]);
  const [food, setFood] = useState<Point>({ x: 15, y: 12 });
  const [dir, setDir] = useState<Dir>("right");
  const [alive, setAlive] = useState(false);
  const [score, setScore] = useState(0);

  // dynamic speed (a little harder over time)
  const tickMs = Math.max(70, BASE_TICK_MS - Math.floor(score / 30) * 10);

  // --- Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      setDir((prev) => {
        if (k === "ArrowUp" && prev !== "down") return "up";
        if (k === "ArrowDown" && prev !== "up") return "down";
        if (k === "ArrowLeft" && prev !== "right") return "left";
        if (k === "ArrowRight" && prev !== "left") return "right";
        return prev;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // --- Touch swipe controls (improved)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let startX = 0, startY = 0, active = false;
    let lastMoveTime = 0;

    const start = (e: TouchEvent) => {
      if (!e.touches?.[0] || !alive) return;
      e.preventDefault();
      active = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      lastMoveTime = Date.now();
    };

    const move = (e: TouchEvent) => {
      if (!active || !e.touches?.[0] || !alive) return;
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastMoveTime < 50) return; // Throttle moves
      lastMoveTime = now;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;
      const absx = Math.abs(dx), absy = Math.abs(dy);
      const TH = 30; // Increased threshold for better control
      
      if (absx > TH || absy > TH) {
        setDir((prev) => {
          if (absx > absy) {
            // horizontal
            if (dx > 0 && prev !== "left") return "right";
            if (dx < 0 && prev !== "right") return "left";
          } else {
            // vertical
            if (dy > 0 && prev !== "up") return "down";
            if (dy < 0 && prev !== "down") return "up";
          }
          return prev;
        });
        active = false; // Reset after successful move
      }
    };

    const end = (e: TouchEvent) => {
      if (!active) return;
      e.preventDefault();
      active = false;
    };

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end, { passive: false });
    
    return () => {
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
    };
  }, [alive]);

  // --- Game step
  function step() {
    setSnake((prev) => {
      const head = { ...prev[0] };
      if (dir === "up") head.y -= 1;
      if (dir === "down") head.y += 1;
      if (dir === "left") head.x -= 1;
      if (dir === "right") head.x += 1;

      const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID;
      const hitSelf = prev.some((p) => p.x === head.x && p.y === head.y);
      if (hitWall || hitSelf) {
        setAlive(false);
        return prev;
      }

      const ate = head.x === food.x && head.y === food.y;
      const next = [head, ...prev];
      if (!ate) next.pop();
      else {
        setScore((s) => s + 10);
        setFood({
          x: Math.floor(Math.random() * GRID),
          y: Math.floor(Math.random() * GRID),
        });
      }
      return next;
    });
  }

  // --- First paint
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GRID * CELL;
      canvas.height = GRID * CELL;
      render();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Loop
  useEffect(() => {
    if (!alive) return;
    let last = performance.now();
    function loop(now: number) {
      if (now - last > tickMs) {
        step();
        last = now;
      }
      render();
      loopRef.current = requestAnimationFrame(loop);
    }
    loopRef.current = requestAnimationFrame(loop);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alive, dir, food, tickMs]);

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#0f0f23");
    gradient.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, canvas.height);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(canvas.width, i * CELL);
      ctx.stroke();
    }

    // Draw food with glow effect
    const foodX = food.x * CELL + CELL / 2;
    const foodY = food.y * CELL + CELL / 2;
    const foodRadius = CELL / 2 - 2;
    
    // Glow effect
    const foodGlow = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, foodRadius + 5);
    foodGlow.addColorStop(0, "rgba(255, 100, 100, 0.8)");
    foodGlow.addColorStop(0.7, "rgba(255, 100, 100, 0.3)");
    foodGlow.addColorStop(1, "rgba(255, 100, 100, 0)");
    ctx.fillStyle = foodGlow;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius + 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Food body
    const foodGradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, foodRadius);
    foodGradient.addColorStop(0, "#ff6b6b");
    foodGradient.addColorStop(0.7, "#ee5a52");
    foodGradient.addColorStop(1, "#e74c3c");
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Food highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.beginPath();
    ctx.arc(foodX - 3, foodY - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake with gradient and effects
    snake.forEach((p, index) => {
      const x = p.x * CELL;
      const y = p.y * CELL;
      const isHead = index === 0;
      
      if (isHead) {
        // Snake head with gradient
        const headGradient = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
        headGradient.addColorStop(0, "#4ecdc4");
        headGradient.addColorStop(0.5, "#44a08d");
        headGradient.addColorStop(1, "#093637");
        ctx.fillStyle = headGradient;
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        
        // Head shine effect
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.fillRect(x + 2, y + 2, CELL / 2, CELL / 2);
        
        // Eyes
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x + CELL * 0.3, y + CELL * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + CELL * 0.7, y + CELL * 0.3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + CELL * 0.3, y + CELL * 0.3, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + CELL * 0.7, y + CELL * 0.3, 1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Snake body with gradient
        const bodyGradient = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
        bodyGradient.addColorStop(0, "#6c5ce7");
        bodyGradient.addColorStop(0.5, "#5f3dc4");
        bodyGradient.addColorStop(1, "#4c63d2");
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
        
        // Body pattern
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(x + 2, y + 2, CELL - 4, 2);
        ctx.fillRect(x + 2, y + CELL - 4, CELL - 4, 2);
      }
    });
  }

  function reset() {
    setSnake([
      { x: 8, y: 12 },
      { x: 7, y: 12 },
      { x: 6, y: 12 },
    ]);
    setDir("right");
    setScore(0);
    setFood({ x: 15, y: 12 });
    setAlive(true);
  }

  // On-screen buttons (improved)
  const Btn = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...p}
      style={{
        padding: "12px 16px",
        borderRadius: 16,
        border: "2px solid #4caf50",
        background: "linear-gradient(135deg, #4caf50, #45a049)",
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
        minWidth: "60px",
        minHeight: "50px",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.95)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(76, 175, 80, 0.5)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(76, 175, 80, 0.3)";
      }}
    />
  );

  const DPadBtn = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...p}
      style={{
        padding: "8px",
        borderRadius: 12,
        border: "2px solid #6c5ce7",
        background: "linear-gradient(135deg, #6c5ce7, #5f3dc4)",
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "0 4px 15px rgba(108, 92, 231, 0.3)",
        width: "60px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "scale(0.9)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(108, 92, 231, 0.5)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(108, 92, 231, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(108, 92, 231, 0.3)";
      }}
    />
  );

  return (
    <section style={{ display: "grid", gap: 10, placeItems: "center" }}>
      <header style={{ textAlign: "center" }}>
        <h1 style={{ margin: 0 }}>🐍 Snake</h1>
        <p style={{ opacity: 0.8, margin: 0 }}>
          Player: {playerAddress ? shorten(playerAddress) : "Unknown"} • Score: {score}
        </p>
      </header>

      <canvas 
        ref={canvasRef} 
        style={{ 
          border: "3px solid #4caf50", 
          borderRadius: 16,
          boxShadow: "0 8px 32px rgba(76, 175, 80, 0.3)",
          background: "linear-gradient(135deg, #0f0f23, #1a1a2e)"
        }} 
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {!alive ? <Btn onClick={reset}>Start</Btn> : <Btn onClick={() => setAlive(false)}>Pause</Btn>}
        <Btn 
          onClick={() => onShare(score)}
          style={{
            background: "linear-gradient(135deg, #2196f3, #1976d2)",
            border: "2px solid #2196f3",
            boxShadow: "0 4px 15px rgba(33, 150, 243, 0.3)",
          }}
        >
          📤 Share Score
        </Btn>
      </div>

      {/* On-screen D-Pad (improved) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 80px)",
          gap: 8,
          marginTop: 12,
          userSelect: "none",
          padding: "16px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "20px",
          backdropFilter: "blur(10px)",
        }}
      >
        <span />
        <DPadBtn onClick={() => setDir((d) => (d !== "down" ? "up" : d))}>↑</DPadBtn>
        <span />
        <DPadBtn onClick={() => setDir((d) => (d !== "right" ? "left" : d))}>←</DPadBtn>
        <div style={{
          width: "60px",
          height: "60px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #2c2c54, #40407a)",
          border: "2px solid #6c5ce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "20px",
          fontWeight: "bold",
        }}>
          🎮
        </div>
        <DPadBtn onClick={() => setDir((d) => (d !== "left" ? "right" : d))}>→</DPadBtn>
        <span />
        <DPadBtn onClick={() => setDir((d) => (d !== "up" ? "down" : d))}>↓</DPadBtn>
        <span />
      </div>

      {!alive && score > 0 && (
        <p style={{ opacity: 0.7, marginTop: 4 }}>Game Over. Final score: {score}</p>
      )}
    </section>
  );
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
