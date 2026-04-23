# ◈ Pixcii Studio

**Pixcii Studio** is a premium, high-fidelity image stylization platform that converts your photos into stunning ASCII, Line Art, Typography, and Halftone patterns. Built for designers, developers, and digital artists, it focuses on crisp output, modern aesthetics, and professional-grade exports.

---

## ✨ Features

### 1. ASCII Art Generator
- **Detailed Mode**: High-density mapping for complex textures.
- **Smooth Mode**: Balanced character sets for a clean look.
- **Block Mode**: Bold, structural output using Unicode blocks.
- **Terminal Mode**: Classic retro-tech aesthetic.

### 2. Typography Art
- Rebuild any image using custom words or phrases.
- Perfect for creative posters, brand identity, and social media.

### 3. Halftone / Dot Art
- Professional-grade dot patterns (Circle or Square).
- Adjustable spacing and density for high-contrast graphic design.

### 4. Line Art
- Minimalist edge-detection based visuals using Sobel operators.

---

## 📸 Screenshots

> [!TIP]
> Add your screenshots to the `./docs/screenshots/` folder and name them accordingly.

![Main Dashboard](./docs/screenshots/dashboard.png)
*The Pixcii Studio Dashboard in Dark Mode*


---

## 🚀 How to Use

1. **Upload**: Drag & drop or paste an image directly into the workspace.
2. **Switch Mode**: Select your desired generator from the top navigation bar (ASCII, Line Art, Typography, or Halftone).
3. **Adjust Settings**:
   - Use **Shared Settings** (Density, Contrast, Brightness) for global changes.
   - Use **Mode-Specific Controls** to tweak details like dot shape or custom text.
4. **Export**: 
   - **PNG**: High-resolution anti-aliased image.
   - **SVG**: Fully scalable vector output for use in tools like Figma or Illustrator.

---

## 🛠️ Technical Stack

- **Core**: Vanilla JavaScript & HTML5
- **Processing**: Multi-threaded **Web Workers** (`art-worker.js`) for near-instant previews.
- **Styling**: Vanilla CSS with a custom **Theme Engine** (Light/Dark mode).
- **Build Tool**: [Vite](https://vitejs.dev/) for blazing-fast development.

---

## 💻 Local Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🤝 Collaboration & Forking

We welcome contributions to Pixcii Studio! Whether you're fixing a bug, adding a new generator, or improving the UI, your help is appreciated.

- **Forking**: Feel free to fork this repository to experiment with your own versions.
- **Pull Requests**: If you've made an improvement, please submit a PR! We review all contributions.
- **Issues**: Found a bug or have a feature request? Open an issue on GitHub.
- **Collaboration**: If you're interested in a larger partnership or deep integration, reach out via GitHub or Twitter.

---

Built for the modern web • Designed for clarity • Built for speed.
