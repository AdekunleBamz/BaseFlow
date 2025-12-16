const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

const conversions = [
  { input: 'icon.svg', output: 'icon.png', width: 512, height: 512 },
  { input: 'og-image.svg', output: 'og-image.png', width: 1200, height: 630 },
  { input: 'splash.svg', output: 'splash.png', width: 1200, height: 1200 },
  { input: 'screenshot.svg', output: 'screenshot.png', width: 1170, height: 2532 },
  { input: 'icon-192.svg', output: 'icon-192.png', width: 192, height: 192 },
  { input: 'favicon.svg', output: 'favicon.png', width: 32, height: 32 },
];

async function convertImages() {
  console.log('🎨 Converting SVG images to PNG...\n');
  
  for (const { input, output, width, height } of conversions) {
    const inputPath = path.join(imagesDir, input);
    const outputPath = path.join(imagesDir, output);
    
    try {
      await sharp(inputPath)
        .resize(width, height)
        .png()
        .toFile(outputPath);
      
      console.log(`  ✅ ${input} → ${output} (${width}x${height})`);
    } catch (error) {
      console.error(`  ❌ Failed to convert ${input}:`, error.message);
    }
  }
  
  // Create favicon.ico
  try {
    const faviconBuffer = await sharp(path.join(imagesDir, 'favicon.svg'))
      .resize(32, 32)
      .png()
      .toBuffer();
    
    fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), faviconBuffer);
    console.log('  ✅ favicon.ico created');
  } catch (error) {
    console.error('  ❌ Failed to create favicon.ico:', error.message);
  }
  
  console.log('\n✅ All PNG images created successfully!');
}

convertImages();
