# Chromeleon - Website Rethemer Chrome Extension

A powerful Chrome extension that allows you to fully retheme any website with custom styling, animations, and React-based controls. Built with React, TypeScript, Vite, and Framer Motion.

## Features

- **Complete Style Override**: Strips existing website styles and applies consistent theming
- **Real-time Theme Controls**: Adjust colors, fonts, spacing, and animations on the fly
- **Preset Themes**: Quick access to Dark, Light, Sepia, and High Contrast themes
- **Reader Mode**: Transform any webpage into a clean, readable format
- **Framer Motion Animations**: Smooth, beautiful animations throughout the interface
- **Persistent Settings**: Your theme preferences are saved and synced across devices
- **Overlay Mode**: Full-screen overlay controls for advanced theming

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations
- **Chrome Extension Manifest v3**
- **Chrome Storage API** for settings persistence

## Project Structure

```
chromeleon/
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── popup.html             # Popup entry point
├── src/
│   ├── popup/                 # React popup UI
│   │   ├── popup.tsx          # Main popup component
│   │   └── popup.css          # Popup-specific styles
│   ├── content/               # Content script logic
│   │   ├── content.ts         # Main content script
│   │   └── overlay.tsx        # React overlay component
│   ├── background/            # Background service worker
│   │   └── background.ts      # Extension lifecycle management
│   ├── styles/                # Global styles
│   │   └── content.css        # Injected website styles
│   └── index.css              # Main CSS with Tailwind
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── postcss.config.js
```

## Installation & Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Build extension:**
   ```bash
   npm run build:extension
   ```

5. **Load in Chrome:**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Usage

### Basic Theming
1. Click the Chromeleon extension icon in your browser toolbar
2. Choose from preset themes or customize colors, fonts, and spacing
3. Changes are applied immediately to the current webpage

### Advanced Controls
- **Color Picker**: Adjust background, text, and accent colors
- **Typography**: Change font family, border radius, and spacing
- **Animations**: Toggle smooth transitions on/off
- **Overlay Mode**: Access full-screen controls
- **Reader Mode**: Transform the page into a clean reading experience

### Keyboard Shortcuts
- `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac): Toggle overlay mode
- `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac): Toggle reader mode

## API Reference

### Content Script Messages

The content script responds to these message types:

```typescript
// Update theme settings
{
  type: 'UPDATE_THEME',
  settings: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    borderRadius: string;
    spacing: string;
    animations: boolean;
  }
}

// Get current theme settings
{
  type: 'GET_THEME'
}

// Toggle overlay mode
{
  type: 'TOGGLE_OVERLAY',
  active: boolean
}

// Replace page content (reader mode)
{
  type: 'REPLACE_CONTENT'
}
```

### Theme Settings Interface

```typescript
interface ThemeSettings {
  backgroundColor: string;    // CSS color value
  textColor: string;         // CSS color value
  accentColor: string;       // CSS color value
  fontFamily: string;        // CSS font-family value
  borderRadius: string;      // CSS border-radius value
  spacing: string;           // CSS spacing value (em)
  animations: boolean;       // Enable/disable transitions
}
```

## Customization

### Adding New Preset Themes

Edit `src/popup/popup.tsx` and add to the `presetThemes` array:

```typescript
const presetThemes = [
  // ... existing themes
  { name: 'Custom', bg: '#your-color', text: '#your-color', accent: '#your-color' }
];
```

### Custom CSS Injection

Modify `src/styles/content.css` to add custom styles that will be injected into web pages.

### Extending the Overlay

Edit `src/content/overlay.tsx` to add new controls or modify the overlay interface.

## Browser Compatibility

- Chrome 88+ (Manifest v3 support)
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/) for fast development
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Icons from [Heroicons](https://heroicons.com/)
