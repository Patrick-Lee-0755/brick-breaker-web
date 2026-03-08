# Brick Breaker Web

A polished single-page Breakout/brick-breaker game built with plain HTML, CSS, and JavaScript (no build step, no external assets).

## Features

- Paddle + bouncing ball physics
- Brick layout with collision and score tracking
- Lives system
- Start/restart flow
- Win and game-over states with overlay UI
- Keyboard controls (`Arrow Left/Right` or `A/D`, `Space` to launch/restart)
- Responsive layout for desktop and mobile
- Lightweight generated sound effects via Web Audio API

## Run Locally

1. Open the folder directly and launch `index.html` in a browser, or
2. Run a local server from this directory:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit:

```text
http://127.0.0.1:8000/
```
