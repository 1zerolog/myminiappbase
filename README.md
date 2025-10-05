
# 🐍 Snake Game - Farcaster Mini App

A modern, responsive Snake game built as a Farcaster mini app with seamless wallet integration and social sharing capabilities. Experience the classic arcade game with contemporary web technologies and social features.

## ✨ Features

### 🎮 Game Features
- **Classic Snake Gameplay** - Smooth, responsive controls with increasing difficulty
- **Dynamic Speed** - Game speed increases as your score grows for added challenge
- **Visual Polish** - Clean, modern UI with smooth animations and gradients
- **Score Tracking** - Real-time score display with persistent high score

### 📱 Multi-Platform Controls
- **Keyboard Support** - Arrow keys or WASD for desktop users
- **Touch Gestures** - Intuitive swipe controls for mobile devices
- **On-Screen D-Pad** - Virtual directional buttons for touch screens
- **Responsive Design** - Optimized for both desktop and mobile experiences

### 🔗 Social Integration
- **Farcaster Wallet Connection** - Seamless integration with Farcaster ecosystem
- **Social Sharing** - Share your high scores directly via Farcaster cast composer
- **Frame SDK Integration** - Built with Farcaster Frame SDK for native app experience

## 🎯 How to Play

1. **Connect Your Wallet** - Click "Connect Wallet" to link your Farcaster account
2. **Start Playing** - Click "Start" to begin your Snake adventure
3. **Control the Snake** - Use any of the available control methods to move
4. **Eat Food** - Collect the red food to grow your snake and increase your score
5. **Avoid Collisions** - Don't hit the walls or your own tail
6. **Share Your Score** - Use "Share Score" to brag about your achievement on Farcaster!

## 🕹️ Controls

| Method | Controls | Description |
|--------|----------|-------------|
| **Keyboard** | Arrow Keys / WASD | Traditional desktop controls |
| **Touch Swipe** | Swipe gestures | Natural mobile interaction |
| **On-Screen** | D-Pad buttons | Virtual directional pad |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd myminiappbase

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Environment Variables**
   - No additional environment variables required for basic functionality

3. **Custom Domain** (Optional)
   - Configure your custom domain in Vercel dashboard

### Farcaster Integration

1. **Frame Configuration**
   - Update `app/layout.tsx` with your frame metadata
   - Configure Open Graph images for social sharing

2. **Mini App Registration**
   - Register your app URL with Farcaster
   - Test wallet connection and sharing functionality

## 🏗️ Technical Architecture

### Core Technologies
- **Next.js 14** - React framework with App Router
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### Key Libraries
- **@farcaster/frame-sdk** - Farcaster integration and wallet connection
- **Canvas API** - High-performance game rendering
- **Touch Events** - Mobile gesture recognition

### Project Structure
```
├── app/
│   ├── api/connect/          # Wallet connection API
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with metadata
│   └── page.tsx              # Main game component
├── components/
│   └── ui/                   # Reusable UI components
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## 🎨 Customization

### Styling
- Modify `app/globals.css` for global styles
- Update Tailwind configuration in `tailwind.config.js`
- Customize game colors in the canvas rendering functions

### Game Mechanics
- Adjust game speed in `BASE_TICK_MS` constant
- Modify grid size with `GRID` and `CELL` constants
- Customize scoring system in the game logic

### Social Features
- Update sharing messages in the `shareScore` function
- Modify wallet connection flow in the `connectWallet` function
- Customize frame metadata in `app/layout.tsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Farcaster](https://farcaster.xyz/) ecosystem
- Inspired by the classic Snake game
- Powered by [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)

---

**Ready to play?** 🎮 Connect your wallet and start your Snake adventure!
