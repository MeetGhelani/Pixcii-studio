// art-worker.js

self.onmessage = function(e) {
  const { imageData, width, height, settings, platformMode } = e.data;
  const { contrast, brightness, gamma, invert } = settings;

  const data = imageData.data;
  const processedData = new Uint8ClampedArray(data.length);

  // 1. Shared Pre-processing
  const adjust = (val) => {
    // Contrast & Brightness
    let v = (val / 255 - 0.5) * contrast + 0.5;
    v *= brightness;
    // Gamma
    v = Math.pow(Math.max(0, v), 1 / gamma);
    return Math.max(0, Math.min(1, v)) * 255;
  };

  const getLuminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

  for (let i = 0; i < data.length; i += 4) {
    let r = adjust(data[i]);
    let g = adjust(data[i + 1]);
    let b = adjust(data[i + 2]);
    let lum = getLuminance(r, g, b);
    
    if (invert) lum = 255 - lum;

    processedData[i] = processedData[i+1] = processedData[i+2] = lum;
    processedData[i+3] = data[i+3];
  }

  // 2. Route to Generator
  if (platformMode === 'ascii') {
    handleAscii(processedData, width, height, settings);
  } else if (platformMode === 'line') {
    handleLineArt(processedData, width, height, settings);
  } else if (platformMode === 'typography') {
    handleTypography(processedData, width, height, settings);
  } else if (platformMode === 'halftone') {
    handleHalftone(processedData, width, height, settings);
  }
};

function handleAscii(data, width, height, settings) {
  const { mode, edgeEnhancement, customRamp } = settings;
  const charsets = {
    detailed: '@%#*+=-:. '.split(''),
    smooth: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '.split(''),
    block: '█▓▒░ '.split(''),
    terminal: '#+-:. '.split('')
  };
  
  let charset = charsets[mode] || charsets.detailed;
  if (customRamp && customRamp.trim().length > 0) {
    charset = customRamp.split('');
  }
  const numChars = charset.length;

  let ascii = '';
  const gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const luminance = data[idx];
      
      let char = ' ';
      if (edgeEnhancement && x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        let valX = 0, valY = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            valX += data[((y + ky) * width + (x + kx)) * 4] * gx[ky + 1][kx + 1];
            valY += data[((y + ky) * width + (x + kx)) * 4] * gy[ky + 1][kx + 1];
          }
        }
        const mag = Math.sqrt(valX * valX + valY * valY);
        if (mag > 50) {
          const angle = Math.atan2(valY, valX) * (180 / Math.PI);
          if (Math.abs(angle) < 22.5 || Math.abs(angle) > 157.5) char = '|';
          else if (angle > 22.5 && angle <= 67.5) char = '/';
          else if (Math.abs(angle) > 67.5 && Math.abs(angle) <= 112.5) char = '-';
          else char = '\\';
        } else {
          const charIdx = Math.floor((luminance / 255) * (numChars - 1));
          char = charset[numChars - 1 - charIdx];
        }
      } else {
        const charIdx = Math.floor((luminance / 255) * (numChars - 1));
        char = charset[numChars - 1 - charIdx];
      }
      ascii += char;
    }
    ascii += '\n';
  }
  self.postMessage({ type: 'ascii', ascii });
}

function handleLineArt(data, width, height, settings) {
  const { threshold, thickness } = settings;
  const result = new Uint8ClampedArray(width * height * 4);
  
  const gx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
  const gy = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let valX = 0, valY = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          valX += data[((y + ky) * width + (x + kx)) * 4] * gx[ky + 1][kx + 1];
          valY += data[((y + ky) * width + (x + kx)) * 4] * gy[ky + 1][kx + 1];
        }
      }
      const mag = Math.sqrt(valX * valX + valY * valY);
      const v = mag > threshold ? 255 : 0;
      
      if (v === 255) {
        // Apply thickness (dilation-like effect)
        const t = Math.floor(thickness);
        for (let ty = -t; ty <= t; ty++) {
          for (let tx = -t; tx <= t; tx++) {
            const ry = y + ty;
            const rx = x + tx;
            if (ry >= 0 && ry < height && rx >= 0 && rx < width) {
              const ridx = (ry * width + rx) * 4;
              result[ridx] = result[ridx+1] = result[ridx+2] = 255;
              result[ridx+3] = 255;
            }
          }
        }
      }
    }
  }
  self.postMessage({ type: 'line', imageData: result, width, height });
}

function handleTypography(data, width, height, settings) {
  const rawWords = (settings.typoText || 'PIXCII').split(/\s+/);
  const threshold = settings.threshold || 128;
  const spacing = settings.spacing || 1.0;
  
  // To avoid breaking the strict coordinate grid and causing horizontal stretching,
  // we integrate the requested spacing directly into the word strings as trailing spaces.
  const words = rawWords.map(w => spacing > 1.2 ? w + ' ' : w);
  
  let ascii = '';
  let wordIdx = 0;
  let charInWordIdx = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lum = data[(y * width + x) * 4];
      if (lum < threshold) {
        const currentWord = words[wordIdx % words.length];
        ascii += currentWord[charInWordIdx % currentWord.length];
        charInWordIdx++;
        if (charInWordIdx >= currentWord.length) {
          charInWordIdx = 0;
          wordIdx++;
        }
      } else {
        ascii += ' ';
      }
    }
    ascii += '\n';
  }
  self.postMessage({ type: 'typography', ascii });
}

function handleHalftone(data, width, height, settings) {
  const { shape, rotation } = settings;
  const spacing = Math.max(0.5, settings.spacing || 1.0); // Safety fallback
  const dots = [];
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      // Rotate grid coordinate
      const rx = Math.floor(x * cos - y * sin);
      const ry = Math.floor(x * sin + y * cos);
      
      const srcX = Math.floor(x);
      const srcY = Math.floor(y);
      
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const lum = data[(srcY * width + srcX) * 4];
        const r = (1 - lum / 255) * 0.5 * spacing;
        if (r > 0.05) {
          dots.push({ x: srcX, y: srcY, r, shape });
        }
      }
    }
  }
  self.postMessage({ type: 'halftone', dots, width, height });
}
