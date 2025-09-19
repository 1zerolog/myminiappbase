
# Base Mini App — Static Host (Vercel)

Bu repo, `/.well-known/farcaster.json` dosyasını barındırmak için minimal statik bir projedir.

## Hızlı Kullanım

### 1) farcaster.json'u düzenle
`public/.well-known/farcaster.json` içindeki:

```json
"accountAssociation": {
  "header": "",
  "payload": "",
  "signature": ""
}
```

alanlarını, Base Build > Account Association akışından aldığınız değerlerle doldurun. `baseBuilder.allowedAddresses` içindeki adresi kendi Base hesabınızın adresiyle eşleştirin.

### 2) Vercel Dashboard ile dağıtım
- https://vercel.com/new -> "Import Project" -> "Upload" seçin, **bu klasörü zip olarak** yükleyin.
- Domain: `https://<proje-adı>.vercel.app`
- Dağıtım sonrası: `https://<proje-adı>.vercel.app/.well-known/farcaster.json` çalışıyor mu kontrol edin.

### 3) Vercel CLI ile dağıtım (alternatif)
```bash
npm i -g vercel
vercel --prod
```

### 4) Base Build'de doğrulama
- base.dev -> Import your mini app -> App URL: `https://<proje-adı>.vercel.app`
- İmza üret (domain ownership) -> `accountAssociation` alanlarını doldur -> tekrar deploy.

## Notlar
- `vercel.json` dosyası, JSON için uygun `Content-Type` ve kısa `Cache-Control` başlıklarını ayarlar.
- `index.html` sadece bilgi amaçlıdır; mini app çalışması için şart değildir.
