"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, RotateCcw, Trophy } from "lucide-react"
import sdk from "@farcaster/frame-sdk"

type Position = { x: number; y: number }
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE: Position[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]
const INITIAL_DIRECTION: Direction = "RIGHT"
const GAME_SPEED = 150

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE)
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION)
  const [food, setFood] = useState<Position>({ x: 15, y: 15 })
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const directionRef = useRef<Direction>(INITIAL_DIRECTION)

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        await sdk.actions.ready()
        console.log("[v0] Farcaster SDK initialized successfully")
      } catch (error) {
        console.error("[v0] Failed to initialize Farcaster SDK:", error)
      }
    }

    initFarcaster()
  }, [])

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }, [])

  // Check collision
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true
    }
    // Self collision
    return body.some((segment) => segment.x === head.x && segment.y === head.y)
  }, [])

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const head = prevSnake[0]
        let newHead: Position

        switch (directionRef.current) {
          case "UP":
            newHead = { x: head.x, y: head.y - 1 }
            break
          case "DOWN":
            newHead = { x: head.x, y: head.y + 1 }
            break
          case "LEFT":
            newHead = { x: head.x - 1, y: head.y }
            break
          case "RIGHT":
            newHead = { x: head.x + 1, y: head.y }
            break
        }

        // Check collision
        if (checkCollision(newHead, prevSnake)) {
          setGameOver(true)
          if (score > highScore) {
            setHighScore(score)
          }
          return prevSnake
        }

        const newSnake = [newHead, ...prevSnake]

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10)
          setFood(generateFood(newSnake))
        } else {
          newSnake.pop()
        }

        return newSnake
      })
    }, GAME_SPEED)

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, food, score, highScore, checkCollision, generateFood])

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = "#f0fdf4"
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

    // Draw grid
    ctx.strokeStyle = "#dcfce7"
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }

    // Draw snake
    snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        (segment.x + 1) * CELL_SIZE,
        (segment.y + 1) * CELL_SIZE,
      )

      if (index === 0) {
        // Head - darker green
        gradient.addColorStop(0, "#16a34a")
        gradient.addColorStop(1, "#15803d")
      } else {
        // Body - lighter green
        gradient.addColorStop(0, "#22c55e")
        gradient.addColorStop(1, "#16a34a")
      }

      ctx.fillStyle = gradient
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)

      // Add shine effect on head
      if (index === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
        ctx.fillRect(segment.x * CELL_SIZE + 2, segment.y * CELL_SIZE + 2, CELL_SIZE / 2, CELL_SIZE / 2)
      }
    })

    // Draw food
    const foodGradient = ctx.createRadialGradient(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      2,
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2,
    )
    foodGradient.addColorStop(0, "#fbbf24")
    foodGradient.addColorStop(1, "#f59e0b")

    ctx.fillStyle = foodGradient
    ctx.beginPath()
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 2, food.y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Add sparkle to food
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)"
    ctx.beginPath()
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE / 3, food.y * CELL_SIZE + CELL_SIZE / 3, 3, 0, Math.PI * 2)
    ctx.fill()
  }, [snake, food])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return

      const key = e.key
      const currentDirection = directionRef.current

      if ((key === "ArrowUp" || key === "w" || key === "W") && currentDirection !== "DOWN") {
        directionRef.current = "UP"
        setDirection("UP")
      } else if ((key === "ArrowDown" || key === "s" || key === "S") && currentDirection !== "UP") {
        directionRef.current = "DOWN"
        setDirection("DOWN")
      } else if ((key === "ArrowLeft" || key === "a" || key === "A") && currentDirection !== "RIGHT") {
        directionRef.current = "LEFT"
        setDirection("LEFT")
      } else if ((key === "ArrowRight" || key === "d" || key === "D") && currentDirection !== "LEFT") {
        directionRef.current = "RIGHT"
        setDirection("RIGHT")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameStarted, gameOver])

  const startGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setFood(generateFood(INITIAL_SNAKE))
    setGameOver(false)
    setGameStarted(true)
    setScore(0)
  }

  const resetGame = () => {
    setSnake(INITIAL_SNAKE)
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setFood(generateFood(INITIAL_SNAKE))
    setGameOver(false)
    setGameStarted(false)
    setScore(0)
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-2">
      <CardHeader className="text-center space-y-2 bg-gradient-to-r from-primary/10 to-secondary/10">
        <CardTitle className="text-4xl font-bold text-balance bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          🐍 Yılan Oyunu
        </CardTitle>
        <div className="flex justify-center gap-8 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Skor:</span>
            <span className="text-2xl font-bold text-primary">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-secondary" />
            <span className="text-muted-foreground">En Yüksek:</span>
            <span className="text-2xl font-bold text-secondary">{highScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={GRID_SIZE * CELL_SIZE}
              height={GRID_SIZE * CELL_SIZE}
              className="border-4 border-primary rounded-lg shadow-lg"
            />
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold text-foreground">Başlamak için butona tıkla!</p>
                  <p className="text-sm text-muted-foreground">Ok tuşları veya WASD ile oyna</p>
                </div>
              </div>
            )}
            {gameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-destructive/90 backdrop-blur-sm rounded-lg">
                <div className="text-center space-y-4">
                  <p className="text-3xl font-bold text-destructive-foreground">Oyun Bitti!</p>
                  <p className="text-xl text-destructive-foreground">Skorun: {score}</p>
                  {score === highScore && score > 0 && (
                    <p className="text-lg text-secondary-foreground bg-secondary px-4 py-2 rounded-full inline-block">
                      🎉 Yeni Rekor!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {!gameStarted && !gameOver && (
            <Button onClick={startGame} size="lg" className="gap-2 font-semibold">
              <Play className="w-5 h-5" />
              Başla
            </Button>
          )}
          {gameOver && (
            <Button onClick={startGame} size="lg" className="gap-2 font-semibold">
              <Play className="w-5 h-5" />
              Tekrar Oyna
            </Button>
          )}
          {gameStarted && !gameOver && (
            <Button onClick={resetGame} variant="outline" size="lg" className="gap-2 font-semibold bg-transparent">
              <RotateCcw className="w-5 h-5" />
              Sıfırla
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>🎮 Kontroller: Ok tuşları veya WASD</p>
          <p>🍎 Yemeği ye ve büyü!</p>
          <p>⚠️ Duvarlara ve kendine çarpma!</p>
        </div>
      </CardContent>
    </Card>
  )
}
