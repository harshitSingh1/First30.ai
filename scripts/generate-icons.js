import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Medical emergency calm branding SVG
// Calm teal / medical blue theme with a stylized emergency shield, medical cross, and heartbeat pulse line
const standardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#0e2a3b" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#2dd4bf" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Subtle outer border -->
  <rect x="8" y="8" width="496" height="496" rx="100" fill="none" stroke="rgba(45, 212, 191, 0.25)" stroke-width="4" />

  <!-- Medical Shield Silhouette -->
  <path d="M256 70 C340 70 410 95 410 160 C410 290 320 380 256 440 C192 380 102 290 102 160 C102 95 172 70 256 70 Z"
        fill="rgba(13, 148, 136, 0.15)" stroke="url(#tealGrad)" stroke-width="8" stroke-linejoin="round" />

  <!-- Medical Cross Accent -->
  <rect x="236" y="145" width="40" height="150" rx="10" fill="url(#tealGrad)" opacity="0.4" />
  <rect x="181" y="200" width="150" height="40" rx="10" fill="url(#tealGrad)" opacity="0.4" />

  <!-- Precision Lifeline / ECG Waveform -->
  <path d="M120 256 L185 256 L205 205 L230 315 L260 165 L285 300 L305 235 L325 256 L392 256"
        fill="none" stroke="url(#pulseGrad)" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)" />

  <!-- Center Heart dot -->
  <circle cx="256" cy="165" r="9" fill="#ffffff" />

  <!-- Badge Text: 30 -->
  <text x="256" y="375" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#2dd4bf" letter-spacing="4">FIRST 30</text>
</svg>`;

// Maskable icon requires 15% safe zone margin
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#0e2a3b" />
      <stop offset="100%" stop-color="#042f2e" />
    </linearGradient>
    <linearGradient id="tealGradM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2dd4bf" />
      <stop offset="100%" stop-color="#0d9488" />
    </linearGradient>
    <linearGradient id="pulseGradM" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#2dd4bf" />
    </linearGradient>
    <filter id="glowM" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Full-bleed background for maskable (Android clips to circle/squircle) -->
  <rect width="512" height="512" fill="url(#bgGradM)" />

  <!-- Safe zone: scale 0.72 centered at 256, 256 (gives >14% margin around all sides) -->
  <g transform="translate(71.68, 71.68) scale(0.72)">
    <!-- Medical Shield Silhouette -->
    <path d="M256 70 C340 70 410 95 410 160 C410 290 320 380 256 440 C192 380 102 290 102 160 C102 95 172 70 256 70 Z"
          fill="rgba(13, 148, 136, 0.2)" stroke="url(#tealGradM)" stroke-width="10" stroke-linejoin="round" />

    <!-- Medical Cross Accent -->
    <rect x="236" y="145" width="40" height="150" rx="10" fill="url(#tealGradM)" opacity="0.45" />
    <rect x="181" y="200" width="150" height="40" rx="10" fill="url(#tealGradM)" opacity="0.45" />

    <!-- Precision Lifeline / ECG Waveform -->
    <path d="M120 256 L185 256 L205 205 L230 315 L260 165 L285 300 L305 235 L325 256 L392 256"
          fill="none" stroke="url(#pulseGradM)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowM)" />

    <circle cx="256" cy="165" r="10" fill="#ffffff" />
    <text x="256" y="375" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="46" font-weight="900" fill="#2dd4bf" letter-spacing="4">FIRST 30</text>
  </g>
</svg>`;

async function generate() {
  console.log('Generating PWA icons...');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), standardSvg);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvg);

  const standardBuf = Buffer.from(standardSvg);
  const maskableBuf = Buffer.from(maskableSvg);

  // 192x192 PNG
  await sharp(standardBuf)
    .resize(192, 192)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 512x512 PNG
  await sharp(standardBuf)
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // Maskable 512x512 PNG
  await sharp(maskableBuf)
    .resize(512, 512)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // Apple touch icon 180x180 PNG
  await sharp(standardBuf)
    .resize(180, 180)
    .png({ quality: 95 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // Favicon PNG (32x32)
  await sharp(standardBuf)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  console.log('Created favicon-32x32.png');

  console.log('All icons generated successfully!');
}

generate().catch(console.error);
