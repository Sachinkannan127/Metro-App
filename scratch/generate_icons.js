const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// 1. High-Resolution Scalable SVG Icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="35%" stop-color="#059669" />
      <stop offset="70%" stop-color="#EAB308" />
      <stop offset="100%" stop-color="#DC2626" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background with smooth rounded squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#334155" stroke-width="4" opacity="0.6" />

  <!-- Cauvery river gentle waves background -->
  <path d="M 40 400 Q 140 370 256 400 T 472 400" fill="none" stroke="#0891B2" stroke-width="12" stroke-linecap="round" opacity="0.4" />
  <path d="M 60 426 Q 160 396 256 426 T 452 426" fill="none" stroke="#2563EB" stroke-width="8" stroke-linecap="round" opacity="0.3" />

  <!-- Metro Multi-Line Golden Viaduct Track Arc -->
  <path d="M 64 360 C 140 330 372 330 448 360" fill="none" stroke="url(#trackGrad)" stroke-width="16" stroke-linecap="round" filter="url(#glow)" />

  <!-- Metro Train Front Body (Aerodynamic Bullet Design) -->
  <g transform="translate(136, 110)">
    <!-- Main Body Shell -->
    <path d="M 30 70 C 30 20 210 20 210 70 L 222 210 C 222 240 18 240 18 210 Z" fill="url(#trainGrad)" />
    
    <!-- Windshield glass -->
    <path d="M 46 64 C 46 42 194 42 194 64 L 188 126 C 188 136 52 136 52 126 Z" fill="#0B132B" stroke="#38BDF8" stroke-width="3" />
    <!-- Windshield reflection highlight -->
    <path d="M 60 70 L 110 70 L 95 120 L 68 120 Z" fill="#38BDF8" opacity="0.35" />

    <!-- Delta Network Emblem on train nose -->
    <circle cx="120" cy="154" r="14" fill="#2563EB" />
    <path d="M 113 154 L 127 154 M 120 147 L 120 161" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />

    <!-- Aerodynamic Side Liners (Blue & Red stripes) -->
    <path d="M 22 178 L 218 178" stroke="#DC2626" stroke-width="7" stroke-linecap="round" />
    <path d="M 20 190 L 220 190" stroke="#2563EB" stroke-width="5" stroke-linecap="round" />

    <!-- Projector Headlamps (Twin Glowing Yellow/White Beams) -->
    <ellipse cx="48" cy="192" rx="12" ry="7" fill="#FEF08A" filter="url(#glow)" />
    <ellipse cx="192" cy="192" rx="12" ry="7" fill="#FEF08A" filter="url(#glow)" />
    <circle cx="48" cy="192" r="5" fill="#FFFFFF" />
    <circle cx="192" cy="192" r="5" fill="#FFFFFF" />

    <!-- Cowcatcher / Track plow lower base -->
    <path d="M 36 226 L 204 226 L 194 246 L 46 246 Z" fill="#334155" />
    <line x1="120" y1="226" x2="120" y2="246" stroke="#64748B" stroke-width="3" />
  </g>

  <!-- High-Tech Delta Transit Badge -->
  <text x="256" y="475" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="28" fill="#94A3B8" letter-spacing="6">DELTA METRO</text>
</svg>`;

fs.writeFileSync(path.join(dir, 'icon.svg'), svg, 'utf8');

// Function to generate raw PNG with uncompressed/zlib scanlines
function createPNG(size) {
  // Simple solid rounded gradient rendering to RGBA
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const rCorner = width * 0.22;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Check rounded rect boundary
      const dx = Math.max(0, Math.abs(x - cx) - (cx - rCorner));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - rCorner));
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > rCorner) {
        buffer[idx] = 0;
        buffer[idx + 1] = 0;
        buffer[idx + 2] = 0;
        buffer[idx + 3] = 0;
        continue;
      }

      // Background gradient from #0F172A to #020617
      const t = (x + y) / (width + height);
      let red = Math.round(15 * (1 - t) + 2 * t);
      let green = Math.round(23 * (1 - t) + 6 * t);
      let blue = Math.round(42 * (1 - t) + 23 * t);
      let alpha = 255;

      // Train silhouette in center
      const nx = (x - cx) / (width * 0.5);
      const ny = (y - cy) / (height * 0.5);

      // Viaduct arc
      if (ny > 0.35 && ny < 0.44 && Math.abs(nx) < 0.75) {
        red = 37; green = 99; blue = 235; // Blue Line
        if (nx > 0.1) { red = 220; green = 38; blue = 38; } // Red Line
      }

      // Train cab
      if (ny > -0.55 && ny < 0.25 && Math.abs(nx) < 0.36) {
        // Body
        red = 240; green = 244; blue = 248;
        // Windshield
        if (ny > -0.42 && ny < -0.12 && Math.abs(nx) < 0.28) {
          red = 11; green = 19; blue = 43;
        }
        // Headlamps
        if (ny > 0.08 && ny < 0.17 && (Math.abs(nx - 0.22) < 0.06 || Math.abs(nx + 0.22) < 0.06)) {
          red = 254; green = 240; blue = 138;
        }
        // Red stripe
        if (ny > 0.02 && ny < 0.07) {
          red = 220; green = 38; blue = 38;
        }
      }

      buffer[idx] = red;
      buffer[idx + 1] = green;
      buffer[idx + 2] = blue;
      buffer[idx + 3] = alpha;
    }
  }

  // Construct standard valid PNG file
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    
    // CRC32
    let c = 0xffffffff;
    for (let i = 4; i < 8 + len; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
    }
    c = (c ^ 0xffffffff) >>> 0;
    buf.writeUInt32BE(c, 8 + len);
    return buf;
  }

  // Raw image scanlines with filter 0 (None)
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const sOffset = y * (width * 4 + 1);
    scanlines[sOffset] = 0; // filter None
    buffer.copy(scanlines, sOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Precompute CRC table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

fs.writeFileSync(path.join(dir, 'icon-192.png'), createPNG(192));
fs.writeFileSync(path.join(dir, 'icon-512.png'), createPNG(512));

console.log('PWA icons created successfully!');
