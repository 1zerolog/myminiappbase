// Base Mini App manifesti — farcaster.json bu dosyadan üretilir (quickstart şablonlarında).
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjI4MjY1MSwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDEzOGNGQ0QxZTVFMEFkZkM4ZUZmQzMxNzg3MmY4YWU5MjkxMjdGMjgifQ",
    payload: "eyJkb21haW4iOiJzbmFrZWdhbWV6ZXJvbG9nLnZlcmNlbC5hcHAifQ",
    signature: "xXZnF6VRNwGmCMDIkjMyfC2XZgenZy+51W7izBbPNxAkd0+4NGVFT9Xwx1qaAUv2c5KqRf640dddQr7WkfA+mxw=",
  },
  baseBuilder: {
    allowedAddresses: ["0xe1bf2Dd72A8A026bEb20d8bF75276DF260507eFc"],
  },
  miniapp: {
    version: "1",
    name: "Yılan",
    subtitle: "Hızlı & minimal snake",
    description: "Farcaster içinde yılan — skorunu paylaş, rekabeti başlat.",
    primaryCategory: "games",
    tags: ["game", "snake", "miniapp"],

    // siten canlı:
    homeUrl: "https://snakegamezerolog.vercel.app",
    webhookUrl: "https://snakegamezerolog.vercel.app/api/webhook",

    // görseller (2. adımda public/ içine yükleyeceğiz)
    iconUrl: "https://snakegamezerolog.vercel.app/snake-icon.png",
    screenshotUrls: ["https://snakegamezerolog.vercel.app/screenshot-portrait.png"],
    splashImageUrl: "https://snakegamezerolog.vercel.app/snake-hero.png",
    splashBackgroundColor: "#0b0b0b",

    // sosyal/OG
    heroImageUrl: "https://snakegamezerolog.vercel.app/snake-hero.png",
    tagline: "Skorum kaç biliyor musun?",
    ogTitle: "Yılan – Skor Yarışı",
    ogDescription: "Skorunu paylaş, arkadaşlarını gaza getir.",
    ogImageUrl: "https://snakegamezerolog.vercel.app/snake-hero.png",
  },
} as const;

export default minikitConfig;
