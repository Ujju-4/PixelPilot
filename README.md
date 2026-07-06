# PixelPilot AI

> Transform any image in seconds with AI.

An AI-powered image toolkit. Upload an image and PixelPilot AI analyses it first —
recommending the right edits rather than handing you a wall of buttons.

---

## Features

| Category | Tools |
|---|---|
| **Analysis** | Resolution, blur, noise, exposure, contrast, rotation, alpha detection |
| **Editing** | Background removal, object removal, magic expand, upscale, enhance, resize, compress, convert |
| **Extraction** | OCR text extraction, EXIF/GPS metadata reader |
| **Batch** | Multi-image upload, parallel analysis, ZIP download |
| **History** | Disk-persisted sessions, rename, delete, re-download |
| **UX** | Command palette (⌘K), before/after slider, undo stack, keyboard shortcuts, dark mode |

---

## Quickstart

```bash
# Install Python sidecar dependencies (required once):
pip install -r backend/requirements.txt --break-system-packages
# On macOS: brew install tesseract
# On Ubuntu: sudo apt-get install tesseract-ocr

npm install
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

---

## Environment variables

Copy `backend/.env.example` → `backend/.env`:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
MAX_UPLOAD_SIZE_BYTES=26214400   # 25 MB
```

---

## Production deployment

### Docker Compose (recommended)

```bash
# Build and start all services:
docker compose -f docker-compose.prod.yml up --build -d

# View logs:
docker compose -f docker-compose.prod.yml logs -f

# Stop:
docker compose -f docker-compose.prod.yml down
```

The frontend is served by nginx on port 80, which also proxies `/api/*` to the backend.
Uploaded files and history are persisted in named Docker volumes.

### Manual deployment

```bash
# Build both packages:
npm run build

# Start the backend (serves the API):
cd backend && node dist/server.js

# Serve the frontend build with any static file server that supports HTML5 history
# routing and reverse-proxies /api to the backend. Example using nginx:
# → copy frontend/nginx.conf and adjust the backend upstream address.
```

---

## System requirements

| Requirement | Notes |
|---|---|
| Node.js 22+ | `npm install && npm run dev` |
| Python 3.9+ | Background removal + object removal + magic expand sidecar |
| opencv-python-headless | `pip install -r backend/requirements.txt` |
| Tesseract OCR 5+ | Ubuntu: `apt-get install tesseract-ocr` · macOS: `brew install tesseract` |

### Honest notes on AI-powered features

- **Background removal** uses OpenCV GrabCut (classical CV), not a neural matting network.
  rembg/U2Net requires fetching pretrained weights at runtime from GitHub release assets,
  which fails in network-restricted environments. GrabCut ships inside opencv-python itself.
  Quality is lower on busy or low-contrast backgrounds; swapping in rembg is a contained
  change inside `backend/src/services/backgroundRemovalService.ts`.

- **Upscaler** uses high-quality Lanczos3 resampling, not Real-ESRGAN or a generative
  super-resolution network. It sharpens edges better than bilinear scaling, but does not
  invent new texture detail.

- **Magic Expand** uses canvas extension + OpenCV inpainting, not generative outpainting.
  Works well for smooth or textured backgrounds.

- **Object removal** uses Telea inpainting — good for small masked regions on uniform
  or textured backgrounds.

- **HEIC uploads** are accepted and genuinely attempted; decoding depends on whether
  the host's libvips was compiled with HEVC support.

---

## Project structure

```
pixelpilot-ai/
├── backend/
│   ├── src/
│   │   ├── config/          env.ts
│   │   ├── controllers/     images, edits, batch, history, health
│   │   ├── middleware/       upload, batchUpload, errorHandler
│   │   ├── routes/           images, batch, history, health
│   │   ├── services/         imageAnalysis, editPipeline, backgroundRemoval,
│   │   │                     objectRemoval, magicExpand, ocr, metadata,
│   │   │                     imageStore, history, resizePresets
│   │   ├── types/            api, image, edit
│   │   └── utils/            errors
│   ├── scripts/              remove_background.py, remove_object.py, magic_expand.py
│   ├── uploads/              incoming image files (gitignored)
│   ├── outputs/              processed output files (gitignored)
│   ├── storage/history/      per-session JSON history (gitignored)
│   ├── requirements.txt      Python sidecar deps
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/     AnalysisResultsPanel, RecommendationCard, AnalysisSkeleton
│   │   │   ├── editor/       EditorPanel, ResultCard, tools/*
│   │   │   ├── icons/        LogoMark, ThemeIcons, UploadIcons, EditorIcons
│   │   │   ├── layout/       NavBar, AppShell
│   │   │   └── ui/           CommandPalette, BeforeAfterSlider, SkipToMain,
│   │   │                     ProgressBar, StatusPill, StatChip, OptionGroup,
│   │   │                     ToggleRow, ErrorBanner, ThemeToggle
│   │   ├── contexts/         Theme, CommandPalette, Undo
│   │   ├── hooks/            useTheme, useHealth, useImageUpload, useKeyboardShortcuts,
│   │   │                     useFocusTrap
│   │   ├── pages/            Home, Batch, History, NotFound
│   │   ├── services/         apiClient, health, images, edits, batch
│   │   ├── types/            api, image, edit, history, theme
│   │   └── utils/            fileValidation
│   ├── public/               favicon.svg, robots.txt
│   ├── nginx.conf            production nginx config
│   └── Dockerfile
├── docker-compose.yml        development
├── docker-compose.prod.yml   production
└── README.md
```

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `⌘Z` / `Ctrl+Z` | Undo last edit |
| `C` | Toggle before/after comparison |
| `↑` / `↓` in palette | Navigate actions |
| `Enter` in palette | Select action |
| `Esc` | Close palette |
| `←` / `→` on slider | Move before/after divider by 5% |

---

## Tech stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, Framer Motion, React Query, React Router

**Backend**: Node.js 22, Express, TypeScript, Sharp, Multer, Archiver, exifr

**Python sidecar**: OpenCV (GrabCut inpainting), Tesseract OCR 5

**Deployment**: nginx (frontend/reverse proxy), Docker Compose
