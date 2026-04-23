import './style.css'

// Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const asciiOutput = document.getElementById('ascii-output');
const artCanvas = document.getElementById('art-canvas');
const canvasContainer = document.getElementById('canvas-container');
const originalImage = document.getElementById('original-image');
const modeTabs = document.querySelectorAll('.mode-tab');
const modePanels = document.querySelectorAll('.mode-panel');
const densitySlider = document.getElementById('density-slider');
const contrastSlider = document.getElementById('contrast-slider');
const brightnessSlider = document.getElementById('brightness-slider');
const densityValue = document.getElementById('density-value');
const contrastValue = document.getElementById('contrast-value');
const brightnessValue = document.getElementById('brightness-value');
const resetBtn = document.getElementById('reset-btn');
const copyBtn = document.getElementById('copy-btn');
const copySvgBtn = document.getElementById('copy-svg-btn');
const exportPngBtn = document.getElementById('export-png');
const exportSvgBtn = document.getElementById('export-svg');
const tabBtns = document.querySelectorAll('.tab-btn');

// Mode Specific Elements
const edgeToggle = document.getElementById('edge-toggle');
const colorToggle = document.getElementById('color-toggle');
const thresholdSlider = document.getElementById('threshold-slider');
const thresholdValue = document.getElementById('threshold-value');
const lineColorPicker = document.getElementById('line-color');
const typoTextInput = document.getElementById('typo-text');
const typoScaleSlider = document.getElementById('typo-scale');
const spacingSlider = document.getElementById('spacing-slider');
const spacingValue = document.getElementById('spacing-value');

// State
let currentImage = null;
let platformMode = 'ascii';
let isProcessing = false;
let currentArtData = null;
let worker = null;

// Initialize Worker
function initWorker() {
  if (worker) worker.terminate();
  worker = new Worker(new URL('./art-worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = (e) => {
    currentArtData = e.data;
    renderArt();
    isProcessing = false;
  };
}

// Mode Switching
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    platformMode = tab.dataset.mode;
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Switch panels
    modePanels.forEach(panel => {
      panel.classList.toggle('hidden', panel.id !== `${platformMode}-controls`);
    });

    // Toggle Preview visibility
    if (platformMode === 'ascii' || platformMode === 'typography') {
      asciiOutput.classList.remove('hidden');
      canvasContainer.classList.add('hidden');
    } else {
      asciiOutput.classList.add('hidden');
      canvasContainer.classList.remove('hidden');
    }

    if (currentImage) processImage();
  });
});

// Event Listeners
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadImage(file);
});

[densitySlider, contrastSlider, brightnessSlider, thresholdSlider, typoScaleSlider, spacingSlider, edgeToggle, colorToggle, lineColorPicker, typoTextInput].forEach(el => {
  el.addEventListener('input', () => {
    updateBadgeValues();
    if (currentImage) processImage();
  });
});

document.querySelectorAll('input[name="style-mode"], input[name="halftone-shape"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (currentImage) processImage();
  });
});

resetBtn.addEventListener('click', () => {
  currentImage = null;
  currentArtData = null;
  previewContainer.classList.add('hidden');
  dropZone.classList.remove('hidden');
  fileInput.value = '';
});

// Art Handling
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      originalImage.src = img.src;
      dropZone.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      processImage();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function processImage() {
  if (!currentImage || isProcessing) return;
  isProcessing = true;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const density = parseInt(densitySlider.value);
  const aspect = currentImage.width / currentImage.height;
  
  // Base dimensions on density
  let width = density;
  let height = Math.round(width / aspect);

  // Correction for ASCII/Typo (monospace aspect ratio)
  if (platformMode === 'ascii' || platformMode === 'typography') {
    const charAspectRatio = 0.55; 
    height = Math.round(width / aspect * charAspectRatio);
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(currentImage, 0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  
  const settings = {
    density,
    contrast: parseFloat(contrastSlider.value),
    brightness: parseFloat(brightnessSlider.value),
    mode: document.querySelector('input[name="style-mode"]:checked')?.value,
    edgeEnhancement: edgeToggle.checked,
    colorMode: colorToggle.checked,
    threshold: parseInt(thresholdSlider.value),
    typoText: typoTextInput.value,
    typoScale: parseFloat(typoScaleSlider.value),
    halftoneShape: document.querySelector('input[name="halftone-shape"]:checked')?.value,
    spacing: parseFloat(spacingSlider.value)
  };

  if (!worker) initWorker();
  worker.postMessage({ imageData, width, height, settings, platformMode });
}

function renderArt() {
  if (!currentArtData) return;

  if (currentArtData.type === 'ascii' || currentArtData.type === 'typography') {
    asciiOutput.textContent = currentArtData.ascii;
    fitTextToFrame(currentArtData.ascii);
  } else if (currentArtData.type === 'line') {
    renderLineArt(currentArtData);
  } else if (currentArtData.type === 'halftone') {
    renderHalftone(currentArtData);
  }
}

function fitTextToFrame(text) {
  const viewport = asciiOutput.parentElement;
  const containerWidth = viewport.clientWidth - 40; 
  const containerHeight = viewport.clientHeight - 40; 
  
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  if (lines.length === 0 || lines[0].length === 0) return;
  
  const numCols = lines[0].length;
  const numRows = lines.length;
  
  const fontSizeW = (containerWidth / numCols) / 0.6;
  const fontSizeH = containerHeight / numRows;
  
  const optimalFontSize = Math.min(fontSizeW, fontSizeH) * 0.98;
  asciiOutput.style.fontSize = `${optimalFontSize}px`;
  asciiOutput.style.lineHeight = `${optimalFontSize}px`;
}

function renderLineArt({ imageData, width, height }) {
  artCanvas.width = width;
  artCanvas.height = height;
  const ctx = artCanvas.getContext('2d');
  
  const imgDataObj = new ImageData(new Uint8ClampedArray(imageData), width, height);
  
  // Use stroke color
  const color = hexToRgb(lineColorPicker.value);
  for (let i = 0; i < imgDataObj.data.length; i += 4) {
    if (imgDataObj.data[i] === 255) {
      imgDataObj.data[i] = color.r;
      imgDataObj.data[i+1] = color.g;
      imgDataObj.data[i+2] = color.b;
    }
  }
  ctx.putImageData(imgDataObj, 0, 0);
}

function renderHalftone({ dots, width, height }) {
  artCanvas.width = width * 10;
  artCanvas.height = height * 10;
  const ctx = artCanvas.getContext('2d');
  
  const styles = getComputedStyle(document.documentElement);
  const bgColor = styles.getPropertyValue('--ascii-bg').trim();
  const dotColor = styles.getPropertyValue('--ascii-color').trim();

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, artCanvas.width, artCanvas.height);
  ctx.fillStyle = dotColor;

  dots.forEach(dot => {
    ctx.beginPath();
    if (dot.shape === 'circle') {
      ctx.arc(dot.x * 10, dot.y * 10, dot.r * 10, 0, Math.PI * 2);
    } else {
      const s = dot.r * 20;
      ctx.rect(dot.x * 10 - s/2, dot.y * 10 - s/2, s, s);
    }
    ctx.fill();
  });
}

// Utility
function updateBadgeValues() {
  densityValue.textContent = densitySlider.value;
  contrastValue.textContent = contrastSlider.value;
  brightnessValue.textContent = brightnessSlider.value;
  thresholdValue.textContent = thresholdSlider.value;
  spacingValue.textContent = spacingSlider.value;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

// Exporting
exportPngBtn.addEventListener('click', () => {
  if (platformMode === 'ascii' || platformMode === 'typography') {
    exportTextToPng(currentArtData.ascii);
  } else {
    const link = document.createElement('a');
    link.download = `pixcii-${platformMode}-${Date.now()}.png`;
    link.href = artCanvas.toDataURL('image/png');
    link.click();
  }
});

exportSvgBtn.addEventListener('click', () => {
  const svg = generateSvgString();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `pixcii-${platformMode}-${Date.now()}.svg`;
  link.href = url;
  link.click();
});

function generateSvgString() {
  if (platformMode === 'ascii' || platformMode === 'typography') {
    return generateTextSvg(currentArtData.ascii);
  } else if (platformMode === 'halftone') {
    return generateHalftoneSvg(currentArtData.dots, currentArtData.width, currentArtData.height);
  } else {
    // Basic line art SVG
    return `<svg width="${currentArtData.width}" height="${currentArtData.height}" xmlns="http://www.w3.org/2000/svg"><image href="${artCanvas.toDataURL()}" width="100%" height="100%" /></svg>`;
  }
}

// Reuse existing text SVG/PNG logic with minor adjustments...
function generateTextSvg(text) {
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  const fontSize = 12;
  const lineHeight = 12;
  const charWidth = 7.2;
  const width = lines[0].length * charWidth + 40;
  const height = lines.length * lineHeight + 40;
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="100%" height="100%" fill="black"/>`;
  svg += `<style>.ascii { font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}px; fill: white; }</style>`;
  lines.forEach((line, i) => {
    svg += `<text x="20" y="${20 + (i + 1) * lineHeight}" class="ascii">${escapeHtml(line)}</text>`;
  });
  svg += `</svg>`;
  return svg;
}

function generateHalftoneSvg(dots, w, h) {
  let svg = `<svg width="${w * 10}" height="${h * 10}" viewBox="0 0 ${w * 10} ${h * 10}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="100%" height="100%" fill="black"/>`;
  dots.forEach(dot => {
    if (dot.shape === 'circle') {
      svg += `<circle cx="${dot.x * 10}" cy="${dot.y * 10}" r="${dot.r * 10}" fill="white" />`;
    } else {
      const s = dot.r * 20;
      svg += `<rect x="${dot.x * 10 - s/2}" y="${dot.y * 10 - s/2}" width="${s}" height="${s}" fill="white" />`;
    }
  });
  svg += `</svg>`;
  return svg;
}

function exportTextToPng(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  const fontSize = 16;
  const lineHeight = fontSize;
  const charWidth = fontSize * 0.6;
  canvas.width = lines[0].length * charWidth + 40;
  canvas.height = lines.length * lineHeight + 40;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'top';
  lines.forEach((line, i) => {
    ctx.fillText(line, 20, 20 + i * lineHeight);
  });
  const link = document.createElement('a');
  link.download = `pixcii-text-${Date.now()}.png`;
  link.href = canvas.toDataURL();
  link.click();
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Tabs
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    if (tab === 'art') {
      if (platformMode === 'ascii' || platformMode === 'typography') asciiOutput.classList.remove('hidden');
      else canvasContainer.classList.remove('hidden');
      originalImage.classList.add('hidden');
    } else {
      asciiOutput.classList.add('hidden');
      canvasContainer.classList.add('hidden');
      originalImage.classList.remove('hidden');
    }
  });
});

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggle.innerHTML = newTheme === 'light' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
});

// Init
updateBadgeValues();
initWorker();
const resizeObserver = new ResizeObserver(() => { if (currentArtData) renderArt(); });
resizeObserver.observe(previewContainer);
