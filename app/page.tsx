import SnakeGame from "@/components/snake-game"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <SnakeGame />
    </main>
  )
}
