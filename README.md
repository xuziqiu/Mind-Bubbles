# Mind Bubbles

A lightweight mind-mapping and bubble-diagram app built with React, Vite, and TypeScript.

Mind Bubbles runs fully on the client side. There is no backend service and no API key is required.

The app defaults to English and includes a Chinese language toggle in the UI.

## Features

- Create and connect nodes on a freeform canvas
- Drag, edit, and reorganize bubble layouts visually
- Built-in physics simulation for more dynamic diagrams
- Undo and redo support
- Import and export Mermaid, JSON, and PNG
- Bilingual UI support
- Light and dark themes

## Getting Started

Requirements: Node.js 18+

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run preview
```

## Deployment Notes

- Development uses `/`
- Production is currently configured for the GitHub Pages subpath `/mind-bubbles/`
- If you deploy from the site root instead, update `base` in `vite.config.ts` to `/`

## Tech Stack

- React 19
- Vite 6
- TypeScript
- lucide-react
