"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const GRID = 18;
const CELL = 22;
const INITIAL_SPEED = 150;

export default function Page() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      console.log("Connect wallet clicked");
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
      const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
      window.open(farcasterUrl, '_blank');
    } catch (error) {
      console.error("Failed to share score:", error);
    }
  };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        padding: "16px",
        overflow: "auto",
      }}
    >
      {!isConnected ? (
        <Gate onConnect={connectWallet} />
      ) : (
        <Game onShare={shareScore} playerAddress={userAddress ?? undefined} />
      )}
    </main>
  );
}

function Gate({ onConnect }: { onConnect: () => void }) {
  return (
    <section style={{ display: "grid", gap: 20, placeItems: "center", textAlign: "center", maxWidth: 500 }}>
      <div style={{
        fontSize: 80,
        animation: "bounce 2s infinite",
      }}>
        🐍
      </div>
      <h1 style={{ 
        margin: 0, 
        fontSize: 48, 
        fontWeight: 900,
        background: "linear-gradient(135deg, #fff, #f0f0f0)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        textShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        Snake Game
      </h1>
      <p style={{ opacity: 0.9, fontSize: 18, lineHeight: 1.6 }}>
        Classic snake game with modern graphics. Use keyboard arrows, swipe gestures, or on-screen controls to play!
      </p>
      <button
        onClick={onConnect}
        style={{
          padding: "20px 40px",
          borderRadius: 50,
          border: "none",
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          color: "#fff",
          fontSize: 20,
          fontWeight: "bold",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 10px 30px rgba(245, 87, 108, 0.4)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-3px) scale(1.05)";
          e.currentTarget.style.boxShadow = "0 15px 40px rgba(245, 87, 108, 0.6)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
          e.currentTarget.style.boxShadow = "0 10px 30px rgba(245, 87, 108, 0.4)";
        }}
      >
        🎮 Start Playing
      </button>
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}

function Game({ onShare, playerAddress }: { onShare: (score: number) => void; playerAddress?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Point[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Dir>("right");
  const dirRef = useRef<Dir>("right");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Sync dir with dirRef
  useEffect(() => {
    dirRef.current = dir;
  }, [dir]);

  // Generate random food
  const generateFood = () => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
    } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  };

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      const key = e.key;
      setDir((prev) => {
        if ((key === "ArrowUp" || key === "w") && prev !== "down") return "up";
        if ((key === "ArrowDown" || key === "s") && prev !== "up") return "down";
        if ((key === "ArrowLeft" || key === "a") && prev !== "right") return "left";
        if ((key === "ArrowRight" || key === "d") && prev !== "left") return "right";
        return prev;
      });
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameStarted, gameOver]);

  // Touch controls
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (!gameStarted || gameOver) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!gameStarted || gameOver) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        setDir((prev) => {
          if (dx > 30 && prev !== "left") return "right";
          if (dx < -30 && prev !== "right") return "left";
          return prev;
        });
      } else {
        setDir((prev) => {
          if (dy > 30 && prev !== "up") return "down";
          if (dy < -30 && prev !== "down") return "up";
          return prev;
        });
      }
    };

    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);
    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [gameStarted, gameOver]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const interval = setInterval(() => {
      setSnake((prevSnake) => {
        const head = { ...prevSnake[0] };
        const currentDir = dirRef.current;

        // Move head
        if (currentDir === "up") head.y -= 1;
        if (currentDir === "down") head.y += 1;
        if (currentDir === "left") head.x -= 1;
        if (currentDir === "right") head.x += 1;

        // Check wall collision
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((s) => s + 10);
          setFood(generateFood());
          setSpeed((s) => Math.max(50, s - 5));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [gameStarted, gameOver, food, speed, score, highScore]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, "#1a1a2e");
    bgGradient.addColorStop(1, "#16213e");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    // Draw food with pulsing effect
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 3 + 3;
    const foodX = food.x * CELL + CELL / 2;
    const foodY = food.y * CELL + CELL / 2;
    
    // Food glow
    const foodGlow = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, CELL / 2 + pulse);
    foodGlow.addColorStop(0, "rgba(255, 107, 107, 1)");
    foodGlow.addColorStop(0.5, "rgba(255, 107, 107, 0.5)");
    foodGlow.addColorStop(1, "rgba(255, 107, 107, 0)");
    ctx.fillStyle = foodGlow;
    ctx.beginPath();
    ctx.arc(foodX, foodY, CELL / 2 + pulse, 0, Math.PI * 2);
    ctx.fill();

    // Food body
    const foodGradient = ctx.createRadialGradient(foodX - 3, foodY - 3, 0, foodX, foodY, CELL / 2);
    foodGradient.addColorStop(0, "#ff6b6b");
    foodGradient.addColorStop(1, "#ee5a6f");
    ctx.fillStyle = foodGradient;
    ctx.beginPath();
    ctx.arc(foodX, foodY, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
      const x = segment.x * CELL;
      const y = segment.y * CELL;
      const isHead = index === 0;

      if (isHead) {
        // Head gradient
        const headGrad = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
        headGrad.addColorStop(0, "#4facfe");
        headGrad.addColorStop(1, "#00f2fe");
        ctx.fillStyle = headGrad;
        ctx.shadowColor = "rgba(79, 172, 254, 0.5)";
        ctx.shadowBlur = 15;
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
        ctx.shadowBlur = 0;

        // Eyes
        const eyeSize = 3;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x + CELL * 0.35, y + CELL * 0.35, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + CELL * 0.65, y + CELL * 0.35, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x + CELL * 0.35, y + CELL * 0.35, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + CELL * 0.65, y + CELL * 0.35, 1.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body gradient
        const bodyGrad = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
        const alpha = 1 - (index / snake.length) * 0.3;
        bodyGrad.addColorStop(0, `rgba(99, 110, 250, ${alpha})`);
        bodyGrad.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = "rgba(99, 110, 250, 0.3)";
        ctx.shadowBlur = 10;
        ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
        ctx.shadowBlur = 0;
      }
    });
  }, [snake, food]);

  const startGame = () => {
    setSnake([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ]);
    setFood(generateFood());
    setDir("right");
    dirRef.current = "right";
    setScore(0);
    setSpeed(INITIAL_SPEED);
    setGameOver(false);
    setGameStarted(true);
  };

  const handleDirChange = (newDir: Dir) => {
    setDir((prev) => {
      if (newDir === "up" && prev !== "down") return newDir;
      if (newDir === "down" && prev !== "up") return newDir;
      if (newDir === "left" && prev !== "right") return newDir;
      if (newDir === "right" && prev !== "left") return newDir;
      return prev;
    });
  };

  return (
    <section style={{ 
      display: "flex",
      flexDirection: "column",
      gap: 12, 
      alignItems: "center",
      padding: "16px",
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: 20,
      backdropFilter: "blur(10px)",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
      maxWidth: "100%",
      width: "fit-content"
    }}>
      <header style={{ textAlign: "center", width: "100%" }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 900 }}>🐍 Snake</h1>
        <div style={{ display: "flex", gap: 30, justifyContent: "center", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Score</div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#4facfe" }}>{score}</div>
          </div>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Best</div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: "#f093fb" }}>{highScore}</div>
          </div>
        </div>
      </header>

      <canvas 
        ref={canvasRef} 
        width={GRID * CELL} 
        height={GRID * CELL}
        style={{ 
          border: "3px solid rgba(255, 255, 255, 0.2)", 
          borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          maxWidth: "100%",
          height: "auto",
          aspectRatio: "1/1"
        }} 
      />

      {!gameStarted && !gameOver && (
        <div style={{
          textAlign: "center",
          padding: "20px",
          background: "rgba(0, 0, 0, 0.6)",
          borderRadius: 16,
          backdropFilter: "blur(10px)",
          marginTop: -10
        }}>
          <p style={{ fontSize: 18, marginBottom: 10, margin: 0 }}>Ready to play?</p>
          <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>Use arrow keys, WASD, or swipe to move</p>
        </div>
      )}

      {gameOver && (
        <div style={{
          textAlign: "center",
          padding: "30px 40px",
          background: "rgba(0, 0, 0, 0.8)",
          borderRadius: 20,
          backdropFilter: "blur(10px)",
          marginTop: -10
        }}>
          <h2 style={{ fontSize: 28, margin: 0, marginBottom: 10 }}>Game Over!</h2>
          <p style={{ fontSize: 22, color: "#4facfe", marginBottom: 10, margin: 0 }}>Score: {score}</p>
          {score === highScore && score > 0 && (
            <p style={{ fontSize: 16, color: "#f093fb", margin: 0 }}>🎉 New High Score!</p>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {!gameStarted || gameOver ? (
          <button
            onClick={startGame}
            style={{
              padding: "16px 32px",
              borderRadius: 50,
              border: "none",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "#fff",
              fontSize: 18,
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(79, 172, 254, 0.4)",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {gameOver ? "🔄 Play Again" : "▶️ Start Game"}
          </button>
        ) : null}
        <button
          onClick={() => onShare(score)}
          style={{
            padding: "16px 32px",
            borderRadius: 50,
            border: "none",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#fff",
            fontSize: 18,
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(245, 87, 108, 0.4)",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          📤 Share Score
        </button>
      </div>

      {/* D-Pad Controls */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 60px)",
        gap: 8,
        padding: 16,
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: 16,
      }}>
        <div />
        <button
          onClick={() => handleDirChange("up")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 15,
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => handleDirChange("left")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 15,
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          ←
        </button>
        <div style={{
          width: 60,
          height: 60,
          borderRadius: 15,
          background: "rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28
        }}>
          🎮
        </div>
        <button
          onClick={() => handleDirChange("right")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 15,
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          →
        </button>
        <div />
        <button
          onClick={() => handleDirChange("down")}
          style={{
            width: 60,
            height: 60,
            borderRadius: 15,
            border: "none",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontSize: 28,
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(102, 126, 234, 0.4)",
            transition: "all 0.2s ease"
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          ↓
        </button>
        <div />
      </div>
    </section>
  );
}

function shorten(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}