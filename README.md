# ◈ Pixcii Studio

**Pixcii Studio** is a premium, high-fidelity image stylization platform that converts your photos into stunning ASCII, Line Art, Typography, and Halftone patterns. Built for designers, developers, and digital artists, it focuses on crisp output, modern aesthetics, and professional-grade performance.

---

## ✨ Advanced Features

### 1. High-Fidelity Color Studio
- **Precision Picker**: Floating, sidebar-docked HSVA color picker for seamless side-by-side editing.
- **Gradient Engine**: Support for both **Linear** and **Radial** gradients with adjustable angles.
- **State Sync**: Real-time synchronization between the color map, hex inputs, and live artwork.

### 2. Multi-Mode Art Generation
- **ASCII Art**: Detailed, Smooth, Block, and Terminal modes with custom character ramps.
- **Typography Art**: Rebuild images using custom word lists—perfect for posters and brand identity.
- **Halftone Patterns**: Professional-grade dot patterns (Circle/Square) with adjustable rotation and spacing.
- **Line Art**: Minimalist edge-detection based visuals using Sobel operators.

### 3. Persistence Engine
- **Refresh-Proof Workspace**: Every adjustment—including uploaded images, sliders, and color palettes—stays intact after a page refresh.
- **Session Recovery**: Automatically restores your entire creative environment so you can pick up exactly where you left off.

### 4. Professional UX & Design
- **Safety Confirmation**: Built-in modals with glassmorphism effects to prevent accidental workspace resets.
- **Responsive Workspace**: Optimized for high-resolution displays and tablet environments.
- **Theme Engine**: Seamlessly toggle between a sleek Dark Mode and a crisp, high-contrast Light Mode.

---

## 📸 Recommended Screenshot Updates

To showcase the latest version of Pixcii Studio, please add or update the following screenshots in `./docs/screenshots/`:

1.  **`dashboard_main.png`**: (Update) Capture the main workspace in Dark Mode showing the new navigation tabs and refined sidebar.
2.  **`color_studio.png`**: (New) Show the floating Color Studio picker in action, ideally while selecting a vibrant gradient.
3.  **`persistence_demo.gif`**: (New) A short recording showing a page refresh where the image and settings stay perfectly intact.
4.  **`confirmation_modal.png`**: (New) Capture the centered glassmorphism confirmation popup.
5.  **`light_mode_sidebar.png`**: (New) Show the refined light theme's right-side controls and improved contrast.

---

## 🚀 How to Use

1. **Upload**: Drag & drop or browse for an image. Your image is automatically cached for session persistence.
2. **Select Mode**: Use the top navigation to switch between ASCII, Line Art, Typography, or Halftone.
3. **Refine**:
   - Adjust **Preprocessing** (Density, Contrast, Gamma) to prep your source image.
   - Use the **Generator Engine** to tweak mode-specific details.
   - Open the **Color Studio** to apply solid colors or dynamic gradients.
4. **Export**: 
   - **PNG**: High-resolution pixel-perfect export.
   - **SVG**: Fully scalable vector output for Figma, Illustrator, or web development.

---

## 🛠️ Technical Stack

- **Core**: Vanilla JavaScript & HTML5
- **Processing**: Multi-threaded **Web Workers** (`art-worker.js`) for near-instant previews.
- **Persistence**: **LocalStorage API** for full session and image data recovery.
- **Styling**: Vanilla CSS with a custom **HSVA-to-Hex** color management system.
- **Build Tool**: [Vite](https://vitejs.dev/)

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

We welcome contributions! Whether you're adding a new generator mode or improving the UI aesthetics, feel free to contribute.

- **Forking**: Feel free to fork and build your own experimental versions.
- **Pull Requests**: Submit PRs for bug fixes or feature enhancements.
- **Issues**: Open an issue for bugs or feature requests.

---

Built for the modern web • Designed for clarity • Built for speed.
