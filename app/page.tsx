"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const GRID = 20;
const CELL = 16;
const BASE_TICK_MS = 140;

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
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 },
  ]);
  const [food, setFood] = useState<Point>({ x: 12, y: 10 });
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

  // --- Touch swipe controls
  useEffect(() => {
    const area = canvasRef.current?.parentElement as HTMLElement | null;
    if (!area) return;
    let startX = 0, startY = 0, active = false;

    const start = (e: TouchEvent) => {
      if (!e.touches?.[0]) return;
      active = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const end = (e: TouchEvent) => {
      if (!active) return;
      const t = e.changedTouches?.[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      const absx = Math.abs(dx), absy = Math.abs(dy);
      const TH = 24; // swipe threshold (px)
      setDir((prev) => {
        if (absx < TH && absy < TH) return prev; // tiny move, ignore
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
      active = false;
    };

    area.addEventListener("touchstart", start, { passive: true });
    area.addEventListener("touchend", end, { passive: true });
    return () => {
      area.removeEventListener("touchstart", start);
      area.removeEventListener("touchend", end);
    };
  }, []);

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    ctx.fillStyle = "#e53935";
    ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

    // snake
    ctx.fillStyle = "#4caf50";
    for (const p of snake) {
      ctx.fillRect(p.x * CELL, p.y * CELL, CELL, CELL);
    }
  }

  function reset() {
    setSnake([
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 },
    ]);
    setDir("right");
    setScore(0);
    setFood({ x: 12, y: 10 });
    setAlive(true);
  }

  // On-screen buttons
  const Btn = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      {...p}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #333",
        background: "#111",
        color: "#fff",
        fontSize: 16,
        cursor: "pointer",
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

      <canvas ref={canvasRef} style={{ border: "1px solid #222", borderRadius: 12 }} />

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

      {/* On-screen D-Pad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,64px)",
          gap: 6,
          marginTop: 6,
          userSelect: "none",
        }}
      >
        <span />
        <Btn onClick={() => setDir((d) => (d !== "down" ? "up" : d))}>↑</Btn>
        <span />
        <Btn onClick={() => setDir((d) => (d !== "right" ? "left" : d))}>←</Btn>
        <Btn disabled>•</Btn>
        <Btn onClick={() => setDir((d) => (d !== "left" ? "right" : d))}>→</Btn>
        <span />
        <Btn onClick={() => setDir((d) => (d !== "up" ? "down" : d))}>↓</Btn>
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
