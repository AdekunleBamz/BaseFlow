const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/images');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Color constants
const COLORS = {
  dark: '#0A0B0D',
  blue: '#0052FF',
  cyan: '#00D4FF',
  purple: '#7B61FF',
  pink: '#FF61DC',
  green: '#00FF94',
};

// Create SVG for the logo/icon
function createLogoSVG(size) {
  const logoSize = size * 0.5;
  const centerX = size / 2;
  const centerY = size / 2;

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.blue}"/>
          <stop offset="50%" stop-color="${COLORS.cyan}"/>
          <stop offset="100%" stop-color="${COLORS.purple}"/>
        </linearGradient>
        <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.blue}"/>
          <stop offset="100%" stop-color="${COLORS.cyan}"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="bgGlow1" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stop-color="${COLORS.blue}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="bgGlow2" cx="70%" cy="70%" r="40%">
          <stop offset="0%" stop-color="${COLORS.purple}" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="${size}" height="${size}" fill="${COLORS.dark}"/>
      <rect width="${size}" height="${size}" fill="url(#bgGlow1)"/>
      <rect width="${size}" height="${size}" fill="url(#bgGlow2)"/>
      
      <!-- Logo container with gradient border -->
      <rect x="${centerX - logoSize/2 - 4}" y="${centerY - logoSize/2 - 4}" 
            width="${logoSize + 8}" height="${logoSize + 8}" 
            rx="${logoSize * 0.2}" ry="${logoSize * 0.2}"
            fill="url(#logoGradient)" opacity="0.8"/>
      <rect x="${centerX - logoSize/2}" y="${centerY - logoSize/2}" 
            width="${logoSize}" height="${logoSize}" 
            rx="${logoSize * 0.18}" ry="${logoSize * 0.18}"
            fill="${COLORS.dark}"/>
      
      <!-- Shield shape -->
      <path d="M${centerX} ${centerY - logoSize*0.35}
               L${centerX - logoSize*0.3} ${centerY - logoSize*0.2}
               V${centerY + logoSize*0.1}
               C${centerX - logoSize*0.3} ${centerY + logoSize*0.3} ${centerX} ${centerY + logoSize*0.38} ${centerX} ${centerY + logoSize*0.38}
               C${centerX} ${centerY + logoSize*0.38} ${centerX + logoSize*0.3} ${centerY + logoSize*0.3} ${centerX + logoSize*0.3} ${centerY + logoSize*0.1}
               V${centerY - logoSize*0.2}
               Z" 
            stroke="white" stroke-width="${logoSize * 0.04}" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
      
      <!-- Flow arrow -->
      <path d="M${centerX - logoSize*0.15} ${centerY - logoSize*0.05}
               L${centerX} ${centerY + logoSize*0.1}
               L${centerX + logoSize*0.15} ${centerY - logoSize*0.05}" 
            stroke="url(#arrowGradient)" stroke-width="${logoSize * 0.05}" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>
    </svg>
  `;
}

// Create OG Image SVG (1200x630)
function createOGImageSVG() {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ogGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.blue}"/>
          <stop offset="50%" stop-color="${COLORS.cyan}"/>
          <stop offset="100%" stop-color="${COLORS.purple}"/>
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${COLORS.blue}"/>
          <stop offset="50%" stop-color="${COLORS.cyan}"/>
          <stop offset="100%" stop-color="${COLORS.purple}"/>
        </linearGradient>
        <radialGradient id="ogGlow1" cx="20%" cy="30%" r="50%">
          <stop offset="0%" stop-color="${COLORS.blue}" stop-opacity="0.4"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="ogGlow2" cx="80%" cy="70%" r="45%">
          <stop offset="0%" stop-color="${COLORS.purple}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <filter id="ogLogoGlow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <rect width="1200" height="630" fill="${COLORS.dark}"/>
      <rect width="1200" height="630" fill="url(#ogGlow1)"/>
      <rect width="1200" height="630" fill="url(#ogGlow2)"/>
      
      <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
      <rect width="1200" height="630" fill="url(#grid)"/>
      
      <g transform="translate(600, 180)">
        <rect x="-60" y="-60" width="120" height="120" rx="24" fill="url(#ogGradient)" opacity="0.9"/>
        <rect x="-54" y="-54" width="108" height="108" rx="20" fill="${COLORS.dark}"/>
        <path d="M0 -35 L-28 -18 V12 C-28 30 0 42 0 42 C0 42 28 30 28 12 V-18 Z" 
              stroke="white" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#ogLogoGlow)"/>
        <path d="M-14 -2 L0 14 L14 -2" 
              stroke="url(#textGradient)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#ogLogoGlow)"/>
      </g>
      
      <text x="600" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="white" text-anchor="middle">BaseFlow</text>
      <text x="600" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="url(#textGradient)" text-anchor="middle">Trade Smarter, Flow Faster</text>
      <text x="600" y="500" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#888888" text-anchor="middle">DEX Aggregator • DCA • Limit Orders • Stop-Loss</text>
      
      <g transform="translate(600, 570)">
        <rect x="-80" y="-20" width="160" height="40" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)"/>
        <text x="0" y="6" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#888888" text-anchor="middle">Built on Base</text>
      </g>
    </svg>
  `;
}

// Create Screenshot SVG (1170x2532)
function createScreenshotSVG() {
  return `
    <svg width="1170" height="2532" viewBox="0 0 1170 2532" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ssGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${COLORS.blue}"/>
          <stop offset="50%" stop-color="${COLORS.cyan}"/>
          <stop offset="100%" stop-color="${COLORS.purple}"/>
        </linearGradient>
        <radialGradient id="ssGlow1" cx="30%" cy="20%" r="50%">
          <stop offset="0%" stop-color="${COLORS.blue}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
        <radialGradient id="ssGlow2" cx="70%" cy="80%" r="45%">
          <stop offset="0%" stop-color="${COLORS.purple}" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="transparent"/>
        </radialGradient>
      </defs>
      
      <rect width="1170" height="2532" fill="${COLORS.dark}"/>
      <rect width="1170" height="2532" fill="url(#ssGlow1)"/>
      <rect width="1170" height="2532" fill="url(#ssGlow2)"/>
      
      <rect x="0" y="0" width="1170" height="100" fill="${COLORS.dark}"/>
      
      <g transform="translate(0, 100)">
        <rect width="1170" height="120" fill="rgba(255,255,255,0.03)"/>
        <g transform="translate(60, 35)">
          <rect width="50" height="50" rx="12" fill="url(#ssGradient)" opacity="0.8"/>
          <rect x="3" y="3" width="44" height="44" rx="10" fill="${COLORS.dark}"/>
          <path d="M25 10 L12 18 V32 C12 40 25 46 25 46 C25 46 38 40 38 32 V18 Z" 
                stroke="white" stroke-width="2.5" fill="none"/>
          <path d="M19 24 L25 32 L31 24" 
                stroke="url(#ssGradient)" stroke-width="3" fill="none"/>
        </g>
        <text x="130" y="72" font-family="system-ui" font-size="32" font-weight="bold" fill="white">BaseFlow</text>
        <rect x="900" y="30" width="200" height="60" rx="16" fill="url(#ssGradient)"/>
        <text x="1000" y="70" font-family="system-ui" font-size="24" font-weight="600" fill="white" text-anchor="middle">Connect</text>
      </g>
      
      <g transform="translate(60, 350)">
        <text font-family="system-ui" font-size="64" font-weight="bold" fill="white">Trade Smarter</text>
        <text y="80" font-family="system-ui" font-size="64" font-weight="bold" fill="url(#ssGradient)">Flow Faster</text>
        <text y="160" font-family="system-ui" font-size="28" fill="#888888">The ultimate DEX aggregator on Base</text>
      </g>
      
      <g transform="translate(60, 650)">
        <rect width="1050" height="700" rx="40" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <text x="40" y="70" font-family="system-ui" font-size="32" font-weight="600" fill="white">Swap</text>
        
        <rect x="40" y="110" width="970" height="180" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <text x="70" y="160" font-family="system-ui" font-size="22" fill="#666666">You Pay</text>
        <text x="70" y="240" font-family="system-ui" font-size="56" font-weight="600" fill="white">1.0</text>
        <rect x="800" y="170" width="170" height="70" rx="20" fill="rgba(255,255,255,0.05)"/>
        <text x="885" y="215" font-family="system-ui" font-size="28" font-weight="600" fill="white" text-anchor="middle">ETH</text>
        
        <circle cx="525" cy="330" r="35" fill="${COLORS.dark}" stroke="rgba(255,255,255,0.1)"/>
        <path d="M525 315 V345 M510 330 L525 345 L540 330" stroke="white" stroke-width="3" fill="none"/>
        
        <rect x="40" y="370" width="970" height="180" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        <text x="70" y="420" font-family="system-ui" font-size="22" fill="#666666">You Receive</text>
        <text x="70" y="500" font-family="system-ui" font-size="56" font-weight="600" fill="${COLORS.cyan}">2,450.00</text>
        <rect x="800" y="430" width="170" height="70" rx="20" fill="rgba(255,255,255,0.05)"/>
        <text x="885" y="475" font-family="system-ui" font-size="28" font-weight="600" fill="white" text-anchor="middle">USDC</text>
        
        <rect x="40" y="590" width="970" height="80" rx="20" fill="url(#ssGradient)"/>
        <text x="525" y="642" font-family="system-ui" font-size="28" font-weight="600" fill="white" text-anchor="middle">Swap</text>
      </g>
      
      <g transform="translate(60, 1420)">
        <rect width="250" height="80" rx="40" fill="rgba(0,212,255,0.1)" stroke="rgba(0,212,255,0.3)"/>
        <text x="125" y="50" font-family="system-ui" font-size="24" fill="${COLORS.cyan}" text-anchor="middle">Best Rates</text>
        
        <rect x="280" y="0" width="250" height="80" rx="40" fill="rgba(123,97,255,0.1)" stroke="rgba(123,97,255,0.3)"/>
        <text x="405" y="50" font-family="system-ui" font-size="24" fill="${COLORS.purple}" text-anchor="middle">Auto DCA</text>
        
        <rect x="560" y="0" width="250" height="80" rx="40" fill="rgba(0,255,148,0.1)" stroke="rgba(0,255,148,0.3)"/>
        <text x="685" y="50" font-family="system-ui" font-size="24" fill="${COLORS.green}" text-anchor="middle">Limit Orders</text>
        
        <rect x="840" y="0" width="270" height="80" rx="40" fill="rgba(255,97,220,0.1)" stroke="rgba(255,97,220,0.3)"/>
        <text x="975" y="50" font-family="system-ui" font-size="24" fill="${COLORS.pink}" text-anchor="middle">Stop-Loss</text>
      </g>
      
      <g transform="translate(60, 1570)">
        <text font-family="system-ui" font-size="36" font-weight="600" fill="white">Powered by Best DEXs</text>
        
        <g transform="translate(0, 60)">
          <rect x="0" width="240" height="100" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="120" y="62" font-family="system-ui" font-size="26" fill="white" text-anchor="middle">Uniswap</text>
          
          <rect x="260" width="240" height="100" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="380" y="62" font-family="system-ui" font-size="26" fill="white" text-anchor="middle">Aerodrome</text>
          
          <rect x="520" width="240" height="100" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="640" y="62" font-family="system-ui" font-size="26" fill="white" text-anchor="middle">BaseSwap</text>
          
          <rect x="780" width="240" height="100" rx="20" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
          <text x="900" y="62" font-family="system-ui" font-size="26" fill="white" text-anchor="middle">SushiSwap</text>
        </g>
      </g>
      
      <g transform="translate(60, 1850)">
        <rect width="1050" height="180" rx="30" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)"/>
        
        <g transform="translate(131, 90)">
          <text font-family="system-ui" font-size="42" font-weight="bold" fill="url(#ssGradient)" text-anchor="middle">$0</text>
          <text y="45" font-family="system-ui" font-size="22" fill="#666666" text-anchor="middle">Volume</text>
        </g>
        
        <g transform="translate(393, 90)">
          <text font-family="system-ui" font-size="42" font-weight="bold" fill="url(#ssGradient)" text-anchor="middle">0.3%</text>
          <text y="45" font-family="system-ui" font-size="22" fill="#666666" text-anchor="middle">Fee</text>
        </g>
        
        <g transform="translate(655, 90)">
          <text font-family="system-ui" font-size="42" font-weight="bold" fill="url(#ssGradient)" text-anchor="middle">4</text>
          <text y="45" font-family="system-ui" font-size="22" fill="#666666" text-anchor="middle">DEXs</text>
        </g>
        
        <g transform="translate(917, 90)">
          <text font-family="system-ui" font-size="42" font-weight="bold" fill="url(#ssGradient)" text-anchor="middle">24/7</text>
          <text y="45" font-family="system-ui" font-size="22" fill="#666666" text-anchor="middle">Active</text>
        </g>
      </g>
      
      <g transform="translate(0, 2332)">
        <rect width="1170" height="200" fill="rgba(10,11,13,0.95)"/>
        <rect y="0" width="1170" height="1" fill="rgba(255,255,255,0.08)"/>
        
        <g transform="translate(146, 80)">
          <text font-family="system-ui" font-size="28" fill="${COLORS.blue}" text-anchor="middle">Swap</text>
        </g>
        <g transform="translate(438, 80)">
          <text font-family="system-ui" font-size="28" fill="#666666" text-anchor="middle">DCA</text>
        </g>
        <g transform="translate(730, 80)">
          <text font-family="system-ui" font-size="28" fill="#666666" text-anchor="middle">Limit</text>
        </g>
        <g transform="translate(1022, 80)">
          <text font-family="system-ui" font-size="28" fill="#666666" text-anchor="middle">Stop-Loss</text>
        </g>
      </g>
    </svg>
  `;
}

async function generateImages() {
  console.log('Generating BaseFlow images...\n');

  try {
    // 1. Icon (512x512)
    console.log('Creating icon.png (512x512)...');
    const iconSvg = createLogoSVG(512);
    await sharp(Buffer.from(iconSvg)).png().toFile(path.join(outputDir, 'icon.png'));
    console.log('   icon.png created');

    // 2. Icon 192 (192x192)
    console.log('Creating icon-192.png (192x192)...');
    const icon192Svg = createLogoSVG(192);
    await sharp(Buffer.from(icon192Svg)).png().toFile(path.join(outputDir, 'icon-192.png'));
    console.log('   icon-192.png created');

    // 3. Splash (200x200)
    console.log('Creating splash.png (200x200)...');
    const splashSvg = createLogoSVG(200);
    await sharp(Buffer.from(splashSvg)).png().toFile(path.join(outputDir, 'splash.png'));
    console.log('   splash.png created');

    // 4. OG Image (1200x630)
    console.log('Creating og-image.png (1200x630)...');
    const ogSvg = createOGImageSVG();
    await sharp(Buffer.from(ogSvg)).png().toFile(path.join(outputDir, 'og-image.png'));
    console.log('   og-image.png created');

    // 5. Screenshot (1170x2532)
    console.log('Creating screenshot.png (1170x2532)...');
    const screenshotSvg = createScreenshotSVG();
    await sharp(Buffer.from(screenshotSvg)).png().toFile(path.join(outputDir, 'screenshot.png'));
    console.log('   screenshot.png created');

    // 6. Favicon (32x32 then convert to ico)
    console.log('Creating favicon.ico...');
    const faviconSvg = createLogoSVG(32);
    await sharp(Buffer.from(faviconSvg)).png().toFile(path.join(outputDir, '../favicon.ico'));
    console.log('   favicon.ico created');

    console.log('\nAll images generated successfully!');
    console.log('Output directory: ' + outputDir);
  } catch (error) {
    console.error('Error generating images:', error);
    process.exit(1);
  }
}

generateImages();
