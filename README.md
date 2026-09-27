# Lyrics2Slides

A web-based tool for converting lyrics into PowerPoint presentations with support for dual-language content, live preview, and customizable styling.

## Features

- **Dual-language support**: Display primary and secondary lyrics (e.g., Chinese and English) on the same slide
- **Live preview**: See slides update in real-time as you type
- **Slide navigation**: Browse slides using keyboard shortcuts or navigation controls
- **Font customization**: Configure font family, size, and color for each language
- **Background images**: Use a photo as the slide background, with a dim overlay for readability (stored locally in IndexedDB, cropped to 16:9)
- **PowerPoint export**: Generate .pptx files with PptxGenJS

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/b1n9s/lyrics2slides.git
cd lyrics2slides

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```txt
lyrics2slides/
├── src/
│   ├── constants.js      # App constants and configuration
│   ├── state.js          # State management with pub/sub
│   ├── parser.js         # Lyrics parsing logic
│   ├── validation.js     # Input validation
│   ├── preview.js        # Slide preview rendering
│   ├── controls.js       # UI controls handling
│   ├── navigation.js     # Slide navigation
│   ├── export.js         # PowerPoint export
│   ├── fonts.js          # Font handling utilities
│   ├── background.js     # Background image storage, cropping and rendering
│   ├── backgroundPicker.js # Background popover UI
│   └── input.js          # Input handling
├── main.js               # Application entry point
├── index.html            # HTML template
└── style.css             # Styles
```

## Architecture

### State Management

The app uses a custom pub/sub pattern for reactive state management:

```javascript
import { state, subscribe, updateSettings } from './src/state.js';

// Subscribe to state changes
subscribe((newState) => {
  console.log('State updated:', newState);
});

// Update state
updateSettings({ backgroundColor: '#ff0000' });
```

State includes:

- Lyrics content (primary/secondary)
- Slide data
- Current slide index
- Font and color settings

### Lyrics Parsing

The parser (`parser.js`) converts raw text into structured slides:

- Splits text by blank lines to create sections
- Each section becomes one slide
- Primary and secondary lyrics are paired by index
- Handles mismatched section counts gracefully

```javascript
import { parseLyrics } from './src/parser.js';

const slides = parseLyrics(primaryText, secondaryText);
// Returns: [{ id: 1, primary: ['line1', 'line2'], secondary: [...] }, ...]
```

### PowerPoint Export

Uses PptxGenJS to generate .pptx files with:

- 16:9 widescreen layout
- Custom fonts, colors, and backgrounds
- Text auto-sizing and centering
- Dual-language text blocks per slide

## Testing

The project uses Vitest with jsdom for unit testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run
```
