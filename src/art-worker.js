// art-worker.js

self.onmessage = function(e) {
  const { imageData, width, height, settings, platformMode } = e.data;
  const { density, contrast, brightness } = settings;

  const data = imageData.data;
  const numPixels = width * height;
  
  // Shared Pre-processing (Grayscale + Contrast + Brightness)
  const processedData = new Uint8ClampedArray(data.length);
  const adjust = (val) => {
    let v = (val / 255 - 0.5) * contrast + 0.5;
    v *= brightness;
    return Math.max(0, Math.min(1, v)) * 255;
  };

  const getLuminance = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

  for (let i = 0; i < data.length; i += 4) {
    let r = adjust(data[i]);
    let g = adjust(data[i + 1]);
    let b = adjust(data[i + 2]);
    const lum = getLuminance(r, g, b);
    processedData[i] = processedData[i+1] = processedData[i+2] = lum;
    processedData[i+3] = data[i+3];
  }

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
  const { mode, edgeEnhancement, colorMode } = settings;
  const charsets = {
    detailed: '@%#*+=-:. '.split(''),
    smooth: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. '.split(''),
    block: '█▓▒░ '.split(''),
    terminal: '#+-:. '.split('')
  };
  const charset = charsets[mode] || charsets.detailed;
  const numChars = charset.length;

  let ascii = '';
  let colorData = [];

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
            const kidx = ((y + ky) * width + (x + kx)) * 4;
            valX += data[kidx] * gx[ky + 1][kx + 1];
            valY += data[kidx] * gy[ky + 1][kx + 1];
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
  const threshold = settings.threshold || 50;
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
      const idx = (y * width + x) * 4;
      const v = mag > threshold ? 255 : 0;
      result[idx] = result[idx+1] = result[idx+2] = v;
      result[idx+3] = 255;
    }
  }
  self.postMessage({ type: 'line', imageData: result, width, height });
}

function handleTypography(data, width, height, settings) {
  const text = settings.typoText || 'PIXCII';
  const scale = settings.typoScale || 1.0;
  let ascii = '';
  let charIdx = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lum = data[(y * width + x) * 4];
      if (lum < 200) { // Only draw text on non-white areas
        ascii += text[charIdx % text.length];
        charIdx++;
      } else {
        ascii += ' ';
      }
    }
    ascii += '\n';
  }
  self.postMessage({ type: 'typography', ascii });
}

function handleHalftone(data, width, height, settings) {
  const shape = settings.halftoneShape || 'circle';
  const spacing = settings.spacing || 1.0;
  const dots = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lum = data[(y * width + x) * 4];
      const radius = (1 - lum / 255) * 0.5 * spacing;
      if (radius > 0.05) {
        dots.push({ x, y, r: radius, shape });
      }
    }
  }
  self.postMessage({ type: 'halftone', dots, width, height });
}
