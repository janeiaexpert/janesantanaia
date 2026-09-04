const sharp = require('sharp');
const path = require('path');

async function createOG() {
  const photo = await sharp(path.join(__dirname, '..', 'public', 'avatar-jane.png'))
    .resize(280, 280, { fit: 'cover' })
    .toBuffer();

  const photoBase64 = 'data:image/png;base64,' + photo.toString('base64');

  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e"/>
        <stop offset="50%" style="stop-color:#16213e"/>
        <stop offset="100%" style="stop-color:#0f3460"/>
      </linearGradient>
      <clipPath id="circle"><circle cx="250" cy="315" r="140"/></clipPath>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="950" cy="80" r="200" fill="rgba(212,175,55,0.06)"/>
    <circle cx="80" cy="550" r="150" fill="rgba(15,52,96,0.2)"/>
    <circle cx="250" cy="315" r="144" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="3"/>
    <image href="${photoBase64}" x="110" y="175" width="280" height="280" clip-path="url(#circle)" preserveAspectRatio="xMidYMid slice"/>
    <text x="460" y="190" font-family="Arial,sans-serif" font-size="56" font-weight="bold" fill="#d4af37">JANE SANTANA</text>
    <text x="460" y="250" font-family="Arial,sans-serif" font-size="26" fill="#e0e0e0">Consultora Master em IA</text>
    <text x="460" y="310" font-family="Arial,sans-serif" font-size="30" font-weight="bold" fill="#ffffff">Mentoria e Consultoria</text>
    <text x="460" y="350" font-family="Arial,sans-serif" font-size="30" font-weight="bold" fill="#ffffff">em Inteligencia Artificial</text>
    <rect x="460" y="390" width="130" height="36" rx="18" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>
    <text x="525" y="414" font-family="Arial,sans-serif" font-size="14" fill="#d4af37" text-anchor="middle">Estrategia</text>
    <rect x="610" y="390" width="140" height="36" rx="18" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>
    <text x="680" y="414" font-family="Arial,sans-serif" font-size="14" fill="#d4af37" text-anchor="middle">Inteligencia</text>
    <rect x="770" y="390" width="120" height="36" rx="18" fill="rgba(212,175,55,0.15)" stroke="rgba(212,175,55,0.4)" stroke-width="1"/>
    <text x="830" y="414" font-family="Arial,sans-serif" font-size="14" fill="#d4af37" text-anchor="middle">Resultados</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'og-image.png'));

  console.log('OG image created: 1200x630');
}

createOG().catch(console.error);
