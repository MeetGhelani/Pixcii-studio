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
const modeControls = document.querySelectorAll('.mode-controls');
const tabBtns = document.querySelectorAll('.tab-btn');
const artLoader = document.getElementById('art-loader');

// Shared Sliders
const densitySlider = document.getElementById('density-slider');
const contrastSlider = document.getElementById('contrast-slider');
const gammaSlider = document.getElementById('gamma-slider');
const densityValue = document.getElementById('density-value');
const contrastValue = document.getElementById('contrast-value');
const gammaValue = document.getElementById('gamma-value');

// Mode Specific
const asciiRamp = document.getElementById('ascii-ramp');
const thresholdSlider = document.getElementById('threshold-slider');
const thresholdValue = document.getElementById('threshold-value');
const lineThicknessSlider = document.getElementById('line-thickness-slider');
const lineThicknessValue = document.getElementById('line-thickness-value');
const typoTextInput = document.getElementById('typo-text');
const typoSpacingSlider = document.getElementById('typo-spacing-slider');
const typoSpacingValue = document.getElementById('typo-spacing-value');
const halftoneRotationSlider = document.getElementById('halftone-rotation-slider');
const halftoneRotationValue = document.getElementById('halftone-rotation-value');
const spacingSlider = document.getElementById('spacing-slider');
const spacingValue = document.getElementById('spacing-value');

// Composition & Layout
const rotationSlider = document.getElementById('rotation-slider');
const rotationValue = document.getElementById('rotation-value');
const flipHToggle = document.getElementById('flip-h-toggle');
const flipVToggle = document.getElementById('flip-v-toggle');
const paddingSlider = document.getElementById('padding-slider');
const paddingValue = document.getElementById('padding-value');

// Advanced Typo
const typoWeightSlider = document.getElementById('typo-weight-slider');
const typoWeightValue = document.getElementById('typo-weight-value');
const typoLetterSpacingSlider = document.getElementById('typo-letter-spacing-slider');
const typoLetterSpacingValue = document.getElementById('typo-letter-spacing-value');

// Post Processing
const blurSlider = document.getElementById('blur-slider');
const blurValue = document.getElementById('blur-value');
const sharpnessSlider = document.getElementById('sharpness-slider');
const sharpnessValue = document.getElementById('sharpness-value');
const grainSlider = document.getElementById('grain-slider');
const grainValue = document.getElementById('grain-value');
const hueRotateSlider = document.getElementById('hue-rotate-slider');
const hueRotateValue = document.getElementById('hue-rotate-value');

// Style & Global
const solidColorGroup = document.getElementById('solid-color-group');
const gradientColorGroup = document.getElementById('gradient-color-group');
const artFgColor = document.getElementById('art-fg-color');
const artBgColor = document.getElementById('art-bg-color');
const gradientColor1 = document.getElementById('gradient-color-1');
const gradientColor2 = document.getElementById('gradient-color-2');
const gradientAngleSlider = document.getElementById('gradient-angle-slider');
const gradientAngleValue = document.getElementById('gradient-angle-value');

const invertToggle = document.getElementById('invert-toggle');
const edgeToggle = document.getElementById('edge-toggle');
const themeToggle = document.getElementById('theme-toggle');
const resetBtn = document.getElementById('reset-btn');

// Confirmation Modal Elements
const confirmModal = document.getElementById('confirm-modal');
const confirmClearBtn = document.getElementById('confirm-clear');
const cancelClearBtn = document.getElementById('cancel-clear');

// State
let currentImage = null;
let platformMode = 'ascii';
let isProcessing = false;
let currentArtData = null;
let worker = null;
let baseCharAspectRatio = 0.6; // Will be measured dynamically

// Persistence Keys
const SETTINGS_KEY = 'pixcii-settings';
const IMAGE_KEY = 'pixcii-image';

// --- Persistence Logic ---
function saveSettings() {
  const settings = {
    platformMode,
    density: densitySlider.value,
    contrast: contrastSlider.value,
    gamma: gammaSlider.value,
    asciiRamp: asciiRamp.value,
    threshold: thresholdSlider.value,
    lineThickness: lineThicknessSlider.value,
    typoText: typoTextInput.value,
    typoSpacing: typoSpacingSlider.value,
    halftoneRotation: halftoneRotationSlider.value,
    spacing: spacingSlider.value,
    aspectRatio: document.querySelector('input[name="aspect-ratio"]:checked')?.value,
    rotation: rotationSlider.value,
    flipH: flipHToggle.checked,
    flipV: flipVToggle.checked,
    padding: paddingSlider.value,
    typoWeight: typoWeightSlider.value,
    typoLetterSpacing: typoLetterSpacingSlider.value,
    blur: blurSlider.value,
    sharpness: sharpnessSlider.value,
    grain: grainSlider.value,
    hueRotate: hueRotateSlider.value,
    colorMode: document.querySelector('input[name="color-mode"]:checked')?.value,
    gradientType: document.querySelector('input[name="gradient-type"]:checked')?.value,
    gradientAngle: gradientAngleSlider.value,
    artFgColor: artFgColor.value,
    artBgColor: artBgColor.value,
    gradientColor1: gradientColor1.value,
    gradientColor2: gradientColor2.value,
    invert: invertToggle.checked,
    edge: edgeToggle.checked,
    theme: document.documentElement.getAttribute('data-theme') || 'dark',
    halftoneShape: document.querySelector('input[name="halftone-shape"]:checked')?.value
  };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return;
  try {
    const s = JSON.parse(saved);
    platformMode = s.platformMode || 'ascii';
    
    if (s.density) densitySlider.value = s.density;
    if (s.contrast) contrastSlider.value = s.contrast;
    if (s.gamma) gammaSlider.value = s.gamma;
    if (s.asciiRamp) asciiRamp.value = s.asciiRamp;
    if (s.threshold) thresholdSlider.value = s.threshold;
    if (s.lineThickness) lineThicknessSlider.value = s.lineThickness;
    if (s.typoText) typoTextInput.value = s.typoText;
    if (s.typoSpacing) typoSpacingSlider.value = s.typoSpacing;
    if (s.halftoneRotation) halftoneRotationSlider.value = s.halftoneRotation;
    if (s.spacing) spacingSlider.value = s.spacing;
    
    if (s.aspectRatio) {
      const radio = document.querySelector(`input[name="aspect-ratio"][value="${s.aspectRatio}"]`);
      if (radio) radio.checked = true;
    }
    if (s.rotation) rotationSlider.value = s.rotation;
    if (s.flipH !== undefined) flipHToggle.checked = s.flipH;
    if (s.flipV !== undefined) flipVToggle.checked = s.flipV;
    if (s.padding) paddingSlider.value = s.padding;

    if (s.gradientAngle) gradientAngleSlider.value = s.gradientAngle;
    
    if (s.typoWeight) typoWeightSlider.value = s.typoWeight;
    if (s.typoLetterSpacing) typoLetterSpacingSlider.value = s.typoLetterSpacing;
    if (s.blur) blurSlider.value = s.blur;
    if (s.sharpness) sharpnessSlider.value = s.sharpness;
    if (s.grain) grainSlider.value = s.grain;
    if (s.hueRotate) hueRotateSlider.value = s.hueRotate;
    
    if (s.artFgColor) artFgColor.value = s.artFgColor;
    if (s.artBgColor) artBgColor.value = s.artBgColor;
    if (s.gradientColor1) gradientColor1.value = s.gradientColor1;
    if (s.gradientColor2) gradientColor2.value = s.gradientColor2;
    
    if (s.invert !== undefined) invertToggle.checked = s.invert;
    if (s.edge !== undefined) edgeToggle.checked = s.edge;
    
    if (s.colorMode) {
      const radio = document.querySelector(`input[name="color-mode"][value="${s.colorMode}"]`);
      if (radio) radio.checked = true;
    }
    if (s.gradientType) {
      const radio = document.querySelector(`input[name="gradient-type"][value="${s.gradientType}"]`);
      if (radio) radio.checked = true;
    }
    if (s.halftoneShape) {
      const radio = document.querySelector(`input[name="halftone-shape"][value="${s.halftoneShape}"]`);
      if (radio) radio.checked = true;
    }

    if (s.theme) {
      document.documentElement.setAttribute('data-theme', s.theme);
      updateThemeIcon(s.theme);
    }

    modeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === platformMode));
    modeControls.forEach(ctrl => ctrl.classList.toggle('hidden', ctrl.id !== `${platformMode}-controls`));
    updateColorModeVisibility();
    updateBadgeValues();
  } catch (e) { console.error("Load failed", e); }
}

function updateThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'light' 
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
}

// Export Dropdown
const exportBtn = document.getElementById('export-btn');
const exportMenu = document.getElementById('export-menu');
const exportDropdown = exportBtn.parentElement;

exportBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  exportMenu.classList.toggle('hidden');
  exportDropdown.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!exportDropdown.contains(e.target)) {
    exportMenu.classList.add('hidden');
    exportDropdown.classList.remove('open');
  }
});

// Initialize Worker & Font
function measureFontAspectRatio() {
  const span = document.createElement('span');
  span.style.fontFamily = 'var(--font-mono)';
  span.style.fontSize = '100px';
  span.style.lineHeight = '1';
  span.style.position = 'absolute';
  span.style.visibility = 'hidden';
  span.style.letterSpacing = '0px';
  span.textContent = 'X';
  document.body.appendChild(span);
  const rect = span.getBoundingClientRect();
  baseCharAspectRatio = rect.width / rect.height;
  document.body.removeChild(span);
  if (!baseCharAspectRatio || baseCharAspectRatio < 0.3 || baseCharAspectRatio > 1.0) {
    baseCharAspectRatio = 0.6; // Safe fallback
  }
}

function initWorker() {
  if (worker) worker.terminate();
  worker = new Worker(new URL('./art-worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = (e) => {
    currentArtData = e.data;
    renderArt();
    isProcessing = false;
    artLoader.classList.add('hidden');
  };
  worker.onerror = (err) => {
    console.error("Worker Error:", err);
    isProcessing = false;
    artLoader.classList.add('hidden');
  };
}

// Mode Switching
modeTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    platformMode = tab.dataset.mode;
    modeTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    modeControls.forEach(ctrl => {
      ctrl.classList.toggle('hidden', ctrl.id !== `${platformMode}-controls`);
    });
    const isTextMode = platformMode === 'ascii' || platformMode === 'typography';
    asciiOutput.classList.toggle('hidden', !isTextMode);
    canvasContainer.classList.toggle('hidden', isTextMode);
    saveSettings();
    if (currentImage) processImage();
  });
});

// Accordion Logic
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    trigger.parentElement.classList.toggle('open');
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

// Gradient/Solid Toggle Logic
function updateColorModeVisibility() {
  const modeElement = document.querySelector('input[name="color-mode"]:checked');
  if (!modeElement) return;
  const mode = modeElement.value;
  solidColorGroup.classList.toggle('hidden', mode !== 'solid');
  gradientColorGroup.classList.toggle('hidden', mode !== 'gradient');
  const gTypeElement = document.querySelector('input[name="gradient-type"]:checked');
  if (gTypeElement) {
    const gType = gTypeElement.value;
    gradientAngleSlider.parentElement.classList.toggle('hidden', gType !== 'linear');
  }
}

document.querySelectorAll('input[name="color-mode"], input[name="gradient-type"], input[name="halftone-shape"], input[name="style-mode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    updateColorModeVisibility();
    saveSettings();
    if (currentImage) processImage();
    else renderArt();
  });
});

document.querySelectorAll('input[name="aspect-ratio"]').forEach(radio => {
  radio.addEventListener('change', () => {
    saveSettings();
    if (currentImage) processImage();
  });
});

const allInputs = [
  densitySlider, contrastSlider, gammaSlider, 
  asciiRamp, thresholdSlider, lineThicknessSlider, 
  typoTextInput, typoSpacingSlider,
  halftoneRotationSlider, spacingSlider,
  artFgColor, artBgColor, gradientColor1, gradientColor2, gradientAngleSlider,
  invertToggle, edgeToggle,
  typoWeightSlider, typoLetterSpacingSlider,
  blurSlider, sharpnessSlider, grainSlider, hueRotateSlider,
  rotationSlider, flipHToggle, flipVToggle, paddingSlider
];

allInputs.forEach(el => {
  if (el) {
    el.addEventListener('input', () => {
      updateBadgeValues();
      saveSettings();
      if (currentImage) {
        if (el === artFgColor || el === artBgColor || el === gradientColor1 || el === gradientColor2 || el === gradientAngleSlider ||
            el === typoWeightSlider || el === typoLetterSpacingSlider || 
            el === blurSlider || el === sharpnessSlider || el === grainSlider || el === hueRotateSlider ||
            el === paddingSlider) {
          renderArt();
        } else {
          processImage();
        }
      }
    });
  }
});

// --- High-Fidelity Color Studio ---
const customPicker = document.getElementById('custom-picker');
const colorMap = document.getElementById('color-map');
const mapPointer = document.getElementById('map-pointer');
const hueSlider = document.getElementById('hue-slider');
const hexInput = document.getElementById('hex-input');
const colorPreview = document.getElementById('current-color-preview');
const closePicker = document.getElementById('close-picker');
const presetsGrid = document.getElementById('presets-grid');
const mapCtx = colorMap.getContext('2d', { willReadFrequently: true });

let activeColorTarget = null;
let curH = 0, curS = 100, curV = 100;

const STUDIO_PRESETS = [
  '#7C3AED', '#2DD4BF', '#F43F5E', '#FB923C', '#FACC15', '#FFFFFF',
  '#000000', '#475569', '#1E293B', '#10B981', '#3B82F6', '#8B5CF6'
];

function initPicker() {
  presetsGrid.innerHTML = '';
  STUDIO_PRESETS.forEach(hex => {
    const div = document.createElement('div');
    div.className = 'preset-color';
    div.style.backgroundColor = hex;
    div.addEventListener('click', () => updatePickerFromHex(hex));
    presetsGrid.appendChild(div);
  });
}

function drawColorMap() {
  const w = colorMap.width, h = colorMap.height;
  mapCtx.clearRect(0, 0, w, h);
  const gradH = mapCtx.createLinearGradient(0, 0, w, 0);
  gradH.addColorStop(0, '#fff');
  gradH.addColorStop(1, `hsl(${curH}, 100%, 50%)`);
  mapCtx.fillStyle = gradH;
  mapCtx.fillRect(0, 0, w, h);
  const gradV = mapCtx.createLinearGradient(0, 0, 0, h);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, '#000');
  mapCtx.fillStyle = gradV;
  mapCtx.fillRect(0, 0, w, h);
}

function updatePickerFromHex(hex) {
  const { h, s, v } = hexToHsv(hex);
  curH = h; curS = s; curV = v;
  syncUI();
}

function syncUI() {
  hueSlider.value = curH;
  drawColorMap();
  const x = (curS / 100) * colorMap.width;
  const y = (1 - curV / 100) * colorMap.height;
  mapPointer.style.left = `${x}px`;
  mapPointer.style.top = `${y}px`;
  const hex = hsvToHex(curH, curS, curV);
  colorPreview.style.backgroundColor = hex;
  hexInput.value = hex.replace('#', '');
  if (activeColorTarget) {
    activeColorTarget.value = hex;
    saveSettings();
    renderArt();
  }
}

function handleMapInput(e) {
  const rect = colorMap.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
  curS = (x / rect.width) * 100;
  curV = 100 - (y / rect.height) * 100;
  syncUI();
}

colorMap.addEventListener('mousedown', (e) => {
  handleMapInput(e);
  const onMove = (me) => requestAnimationFrame(() => handleMapInput(me));
  const onUp = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
});

hueSlider.addEventListener('input', () => { curH = hueSlider.value; syncUI(); });
hexInput.addEventListener('input', () => {
  let val = hexInput.value;
  if (val.length === 6 && /^[0-9A-F]+$/i.test(val)) {
    updatePickerFromHex('#' + val);
  }
});

closePicker.addEventListener('click', () => customPicker.classList.add('hidden'));

document.addEventListener('mousedown', (e) => {
  if (!customPicker.classList.contains('hidden')) {
    const isColorInput = Array.from(document.querySelectorAll('input[type="color"]')).some(input => input.contains(e.target));
    if (!customPicker.contains(e.target) && !isColorInput) {
      customPicker.classList.add('hidden');
    }
  }
});

document.querySelectorAll('input[type="color"]').forEach(input => {
  input.addEventListener('click', (e) => {
    e.preventDefault();
    activeColorTarget = input;
    customPicker.classList.remove('hidden');
    updatePickerFromHex(input.value);
  });
});

function hexToHsv(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, v = max, d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToHex(h, s, v) {
  h /= 360; s /= 100; v /= 100;
  let r, g, b, i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  const toHex = x => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

initPicker();

// Confirmation Logic
resetBtn.addEventListener('click', () => {
  if (currentImage) confirmModal.classList.remove('hidden');
});

cancelClearBtn.addEventListener('click', () => confirmModal.classList.add('hidden'));

confirmClearBtn.addEventListener('click', () => {
  currentImage = null; currentArtData = null;
  localStorage.removeItem(IMAGE_KEY); // Clear saved image
  previewContainer.classList.add('hidden'); dropZone.classList.remove('hidden'); fileInput.value = '';
  confirmModal.classList.add('hidden');
});

function loadImage(file, isRestore = false) {
  if (file instanceof File) {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      isProcessing = false; // Reset lock on new image
      currentImage = img;
      originalImage.src = objectUrl;
      dropZone.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      processImage();
      
      // Save to localStorage only if reasonably small (< 2MB roughly)
      if (file.size < 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try { localStorage.setItem(IMAGE_KEY, e.target.result); } catch (e) { console.warn("Image too large for persistence"); }
        };
        reader.readAsDataURL(file);
      }
    };
    img.src = objectUrl;
  } else if (typeof file === 'string') {
    // Restore from Base64 or URL
    const img = new Image();
    img.onload = () => {
      isProcessing = false;
      currentImage = img;
      originalImage.src = file;
      dropZone.classList.add('hidden');
      previewContainer.classList.remove('hidden');
      processImage();
    };
    img.src = file;
  }
}

function processImage() {
  if (!currentImage || isProcessing) return;
  isProcessing = true;

  const aspectRatio = document.querySelector('input[name="aspect-ratio"]:checked')?.value || 'original';
  const rotation = parseInt(rotationSlider.value) || 0;
  const flipH = flipHToggle.checked;
  const flipV = flipVToggle.checked;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const imgW = currentImage.width;
  const imgH = currentImage.height;
  const imgAspect = imgW / imgH;

  // Determine the target bounds aspect ratio
  const targetAspect = aspectRatio === 'original' ? imgAspect : (() => {
    const [rw, rh] = aspectRatio.split(':').map(Number);
    return rw / rh;
  })();

  const density = parseInt(densitySlider.value);
  
  // Physical target dimensions (before rotation and character scaling)
  const targetWidth = density;
  const targetHeight = Math.round(targetWidth / targetAspect);

  // Calculate draw size to 'contain' the image within target dimensions
  let drawW = targetWidth;
  let drawH = targetHeight;

  if (imgAspect > targetAspect) {
    drawH = targetWidth / imgAspect; // Image is wider, fit width
  } else {
    drawW = targetHeight * imgAspect; // Image is taller, fit height
  }

  const isRotated90 = rotation === 90 || rotation === 270;
  
  // Calculate bounding box for the square-pixel canvas
  const squareCanvasW = isRotated90 ? targetHeight : targetWidth;
  const squareCanvasH = isRotated90 ? targetWidth : targetHeight;
  
  let finalCanvasW = squareCanvasW;
  let finalCanvasH = squareCanvasH;
  
  // Character aspect ratio compensation (dynamic base + letter spacing in ems)
  const letterSpacingEm = parseFloat(typoLetterSpacingSlider.value) || 0;
  const charAspectRatio = baseCharAspectRatio + letterSpacingEm;

  if (platformMode === 'ascii' || platformMode === 'typography') {
    // Only squish the Y axis (rows) to compensate for character height
    finalCanvasH = Math.round(squareCanvasH * charAspectRatio);
  }

  canvas.width = finalCanvasW;
  canvas.height = finalCanvasH;

  // Apply Transformations
  if (platformMode === 'ascii' || platformMode === 'typography') {
    ctx.scale(1, charAspectRatio); // Puts context into pure square-pixel coordinate space
  }
  
  // Move to the center of the square-pixel bounds
  ctx.translate(squareCanvasW / 2, squareCanvasH / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  
  // Draw the full image centered and scaled to fit (contain)
  ctx.drawImage(currentImage, 0, 0, imgW, imgH, -drawW / 2, -drawH / 2, drawW, drawH);
  
  // Final image data for the worker
  const finalW = canvas.width, finalH = canvas.height;
  const imageData = ctx.getImageData(0, 0, finalW, finalH);

  const settings = {
    contrast: parseFloat(contrastSlider.value), brightness: 1.0, gamma: parseFloat(gammaSlider.value),
    invert: invertToggle.checked, mode: document.querySelector('input[name="style-mode"]:checked')?.value,
    customRamp: asciiRamp.value, edgeEnhancement: edgeToggle.checked, threshold: parseInt(thresholdSlider.value),
    thickness: parseFloat(lineThicknessSlider.value), typoText: typoTextInput.value,
    spacing: parseFloat(platformMode === 'halftone' ? spacingSlider.value : typoSpacingSlider.value),
    rotation: parseInt(halftoneRotationSlider.value), halftoneShape: document.querySelector('input[name="halftone-shape"]:checked')?.value
  };
  if (!worker) initWorker();
  artLoader.classList.remove('hidden');
  // Use Transferable Objects for performance and use the actual imageData dimensions
  worker.postMessage(
    { imageData, width: imageData.width, height: imageData.height, settings, platformMode },
    [imageData.data.buffer]
  );
}

function renderArt() {
  if (!currentArtData) return;
  const colorMode = document.querySelector('input[name="color-mode"]:checked')?.value || 'solid';
  const gradientType = document.querySelector('input[name="gradient-type"]:checked')?.value || 'linear';
  const bgColor = artBgColor.value;
  const fgColor = artFgColor.value;
  const gColor1 = gradientColor1.value;
  const gColor2 = gradientColor2.value;
  if (currentArtData.type === 'ascii' || currentArtData.type === 'typography') {
    asciiOutput.textContent = currentArtData.ascii;
    asciiOutput.parentElement.style.background = bgColor;
    if (colorMode === 'gradient') {
      asciiOutput.style.backgroundImage = gradientType === 'linear' 
        ? `linear-gradient(${gradientAngleSlider.value}deg, ${gColor1}, ${gColor2})`
        : `radial-gradient(circle, ${gColor1}, ${gColor2})`;
      asciiOutput.style.webkitBackgroundClip = 'text';
      asciiOutput.style.webkitTextFillColor = 'transparent';
    } else {
      asciiOutput.style.backgroundImage = 'none';
      asciiOutput.style.webkitTextFillColor = 'initial';
      asciiOutput.style.color = fgColor;
    }

    // Apply Advanced Typography
    asciiOutput.style.fontWeight = typoWeightSlider.value;
    asciiOutput.style.letterSpacing = `${typoLetterSpacingSlider.value}em`;

    fitTextToFrame(currentArtData.ascii);
  } else if (currentArtData.type === 'line') {
    renderCanvasArt(currentArtData);
  } else if (currentArtData.type === 'halftone') {
    renderHalftone(currentArtData);
  }

  applyPostProcessing();
  
  // Apply Padding
  const viewport = asciiOutput.parentElement;
  viewport.style.padding = `${paddingSlider.value}px`;
}

function applyPostProcessing() {
  const filters = [
    `blur(${blurSlider.value}px)`,
    `contrast(${sharpnessSlider.value}%)`,
    `hue-rotate(${hueRotateSlider.value}deg)`
  ];
  
  const viewport = asciiOutput.parentElement;
  viewport.style.filter = filters.join(' ');
  
  // Handle Grain
  const grainOverlay = viewport.querySelector('.grain-overlay');
  if (grainOverlay) {
    grainOverlay.style.opacity = grainSlider.value / 100;
  }
}

function fitTextToFrame(text) {
  const viewport = asciiOutput.parentElement;
  const containerWidth = viewport.clientWidth - 40, containerHeight = viewport.clientHeight - 40; 
  const lines = text.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
  if (lines.length === 0 || lines[0].length === 0) return;
  const numCols = lines[0].length, numRows = lines.length;
  
  const letterSpacingEm = parseFloat(typoLetterSpacingSlider.value) || 0;
  const effectiveCharRatio = baseCharAspectRatio + letterSpacingEm;
  
  // Account for dynamic font width in calculation
  const fontSizeW = Math.max(1, (containerWidth / numCols) / effectiveCharRatio);
  const fontSizeH = containerHeight / numRows;
  
  const optimalFontSize = Math.min(fontSizeW, fontSizeH) * 0.98;
  asciiOutput.style.fontSize = `${optimalFontSize}px`; asciiOutput.style.lineHeight = `${optimalFontSize}px`;
}

function getCanvasFill(ctx, width, height) {
  const colorMode = document.querySelector('input[name="color-mode"]:checked')?.value || 'solid';
  const gradientType = document.querySelector('input[name="gradient-type"]:checked')?.value || 'linear';
  const gColor1 = gradientColor1.value;
  const gColor2 = gradientColor2.value;
  const fgColor = artFgColor.value;
  if (colorMode === 'gradient') {
    const cx = width / 2, cy = height / 2, r = Math.sqrt(width * width + height * height) / 2;
    if (gradientType === 'linear') {
      const rad = (gradientAngleSlider.value * Math.PI) / 180;
      const x0 = cx - Math.cos(rad) * r, y0 = cy - Math.sin(rad) * r;
      const x1 = cx + Math.cos(rad) * r, y1 = cy + Math.sin(rad) * r;
      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      grad.addColorStop(0, gColor1); grad.addColorStop(1, gColor2);
      return grad;
    } else {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, gColor1); grad.addColorStop(1, gColor2);
      return grad;
    }
  }
  return fgColor;
}

function renderCanvasArt({ imageData, width, height }) {
  artCanvas.width = width; artCanvas.height = height;
  const ctx = artCanvas.getContext('2d');
  ctx.fillStyle = artBgColor.value;
  ctx.fillRect(0, 0, width, height);
  const fill = getCanvasFill(ctx, width, height);
  const tempCanvas = document.createElement('canvas'); tempCanvas.width = width; tempCanvas.height = height;
  const tctx = tempCanvas.getContext('2d');
  const imgDataObj = new ImageData(new Uint8ClampedArray(imageData), width, height);
  tctx.putImageData(imgDataObj, 0, 0);
  tctx.globalCompositeOperation = 'source-in';
  tctx.fillStyle = fill; tctx.fillRect(0, 0, width, height);
  ctx.drawImage(tempCanvas, 0, 0);
}

function renderHalftone({ dots, width, height }) {
  artCanvas.width = width * 10; artCanvas.height = height * 10;
  const ctx = artCanvas.getContext('2d');
  ctx.fillStyle = artBgColor.value; ctx.fillRect(0, 0, artCanvas.width, artCanvas.height);
  const fill = getCanvasFill(ctx, artCanvas.width, artCanvas.height);
  ctx.fillStyle = fill;
  dots.forEach(dot => {
    ctx.beginPath();
    if (dot.shape === 'circle') ctx.arc(dot.x * 10, dot.y * 10, dot.r * 10, 0, Math.PI * 2);
    else { const s = dot.r * 20; ctx.rect(dot.x * 10 - s/2, dot.y * 10 - s/2, s, s); }
    ctx.fill();
  });
}

function updateBadgeValues() {
  densityValue.textContent = densitySlider.value; contrastValue.textContent = contrastSlider.value;
  gammaValue.textContent = gammaSlider.value;  thresholdValue.textContent = thresholdSlider.value;
  lineThicknessValue.textContent = lineThicknessSlider.value; typoSpacingValue.textContent = typoSpacingSlider.value;
  halftoneRotationValue.textContent = `${halftoneRotationSlider.value}°`; spacingValue.textContent = spacingSlider.value;
  gradientAngleValue.textContent = `${gradientAngleSlider.value}°`;

  typoWeightValue.textContent = typoWeightSlider.value;
  typoLetterSpacingValue.textContent = `${typoLetterSpacingSlider.value}em`;
  blurValue.textContent = `${blurSlider.value}px`;
  sharpnessValue.textContent = `${sharpnessSlider.value}%`;
  grainValue.textContent = `${grainSlider.value}%`;
  hueRotateValue.textContent = `${hueRotateSlider.value}°`;
  
  rotationValue.textContent = `${rotationSlider.value}°`;
  paddingValue.textContent = `${paddingSlider.value}px`;
}

document.getElementById('export-png').addEventListener('click', () => {
  if (platformMode === 'ascii' || platformMode === 'typography') exportTextToPng(currentArtData.ascii);
  else {
    const link = document.createElement('a'); link.download = `pixcii-${platformMode}-${Date.now()}.png`;
    link.href = artCanvas.toDataURL('image/png'); link.click();
  }
});

document.getElementById('export-svg').addEventListener('click', () => {
  const svg = generateSvgString();
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.download = `pixcii-${platformMode}-${Date.now()}.svg`;
  link.href = url; link.click();
});

function generateSvgString() {
  const bgColor = artBgColor.value;
  if (platformMode === 'ascii' || platformMode === 'typography') return generateTextSvg(currentArtData.ascii);
  else if (platformMode === 'halftone') return generateHalftoneSvg(currentArtData.dots, currentArtData.width, currentArtData.height);
  else return `<svg width="${currentArtData.width}" height="${currentArtData.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bgColor}"/><image href="${artCanvas.toDataURL()}" width="100%" height="100%" /></svg>`;
}

function generateTextSvg(text) {
  const lines = text.split('\n'); if (lines[lines.length - 1] === '') lines.pop();
  const fontSize = 12, lineHeight = 12, charWidth = 7.2;
  const width = lines[0].length * charWidth + 40, height = lines.length * lineHeight + 40;
  const colorMode = document.querySelector('input[name="color-mode"]:checked')?.value || 'solid';
  const gradientType = document.querySelector('input[name="gradient-type"]:checked')?.value || 'linear';
  const bgColor = artBgColor.value;
  const gColor1 = gradientColor1.value;
  const gColor2 = gradientColor2.value;
  const fgColor = artFgColor.value;
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bgColor}"/>`;
  if (colorMode === 'gradient') {
    if (gradientType === 'linear') svg += `<defs><linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${gradientAngleSlider.value})"><stop offset="0%" stop-color="${gColor1}" /><stop offset="100%" stop-color="${gColor2}" /></linearGradient></defs>`;
    else svg += `<defs><radialGradient id="textGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="${gColor1}" /><stop offset="100%" stop-color="${gColor2}" /></radialGradient></defs>`;
    svg += `<style>.ascii { font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}px; fill: url(#textGrad); }</style>`;
  } else svg += `<style>.ascii { font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}px; fill: ${fgColor}; }</style>`;
  lines.forEach((line, i) => { svg += `<text x="20" y="${20 + (i + 1) * lineHeight}" class="ascii">${escapeHtml(line)}</text>`; });
  svg += `</svg>`; return svg;
}

function generateHalftoneSvg(dots, w, h) {
  const width = w * 10, height = h * 10;
  const colorMode = document.querySelector('input[name="color-mode"]:checked')?.value || 'solid';
  const gradientType = document.querySelector('input[name="gradient-type"]:checked')?.value || 'linear';
  const bgColor = artBgColor.value;
  const gColor1 = gradientColor1.value;
  const gColor2 = gradientColor2.value;
  const fgColor = artFgColor.value;
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${bgColor}"/>`;
  let fill = fgColor;
  if (colorMode === 'gradient') {
    if (gradientType === 'linear') svg += `<defs><linearGradient id="halftoneGrad" x1="0%" y1="0%" x2="100%" y2="100%" gradientTransform="rotate(${gradientAngleSlider.value})"><stop offset="0%" stop-color="${gColor1}" /><stop offset="100%" stop-color="${gColor2}" /></linearGradient></defs>`;
    else svg += `<defs><radialGradient id="halftoneGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stop-color="${gColor1}" /><stop offset="100%" stop-color="${gColor2}" /></radialGradient></defs>`;
    fill = 'url(#halftoneGrad)';
  }
  dots.forEach(dot => {
    if (dot.shape === 'circle') svg += `<circle cx="${dot.x * 10}" cy="${dot.y * 10}" r="${dot.r * 10}" fill="${fill}" />`;
    else { const s = dot.r * 20; svg += `<rect x="${dot.x * 10 - s/2}" y="${dot.y * 10 - s/2}" width="${s}" height="${s}" fill="${fill}" />`; }
  });
  svg += `</svg>`; return svg;
}

function exportTextToPng(text) {
  const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d'), lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  const fontSize = 16, lineHeight = fontSize, charWidth = fontSize * 0.6;
  canvas.width = lines[0].length * charWidth + 40; canvas.height = lines.length * lineHeight + 40;
  ctx.fillStyle = artBgColor.value; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const fill = getCanvasFill(ctx, canvas.width, canvas.height);
  ctx.font = `${fontSize}px "JetBrains Mono", monospace`; ctx.fillStyle = fill; ctx.textBaseline = 'top';
  lines.forEach((line, i) => { ctx.fillText(line, 20, 20 + i * lineHeight); });
  const link = document.createElement('a'); link.download = `pixcii-text-${Date.now()}.png`; link.href = canvas.toDataURL(); link.click();
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
    const tab = btn.dataset.tab, isArt = tab === 'art', isTextMode = platformMode === 'ascii' || platformMode === 'typography';
    if (isArt) { asciiOutput.classList.toggle('hidden', !isTextMode); canvasContainer.classList.toggle('hidden', isTextMode); originalImage.classList.add('hidden'); }
    else { asciiOutput.classList.add('hidden'); canvasContainer.classList.add('hidden'); originalImage.classList.remove('hidden'); }
  });
});

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme'), newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  updateThemeIcon(newTheme);
  saveSettings();
  if (currentImage) processImage();
});

// Initialization
measureFontAspectRatio();
updateBadgeValues(); 
initWorker();
loadSettings(); 

// Restore image if exists
const savedImage = localStorage.getItem(IMAGE_KEY);
if (savedImage) loadImage(savedImage, true);

const resizeObserver = new ResizeObserver(() => { if (currentArtData) renderArt(); }); 
resizeObserver.observe(previewContainer);
