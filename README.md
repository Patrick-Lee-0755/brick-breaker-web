# Brick Breaker Web

A clean, polished browser version of the classic brick-breaker / Breakout formula, built with plain **HTML, CSS, and JavaScript**.

No framework, no build step, no external assets — just open it and play.

## Demo

Repository: <https://github.com/Patrick-Lee-0755/brick-breaker-web>

If you want, this can also be deployed directly with GitHub Pages.

## Features

- Smooth paddle-and-ball gameplay
- Brick collision, scoring, and win detection
- Lives system
- Start / restart flow
- Game over and victory overlays
- Keyboard controls:
  - `←` / `→`
  - `A` / `D`
  - `Space` to launch or restart
- Responsive layout for desktop and mobile
- Lightweight generated sound effects via the Web Audio API
- Zero dependencies

## Project Structure

```text
.
├── index.html   # Game layout
├── styles.css   # Visual design and responsive styles
├── script.js    # Game loop, physics, collisions, audio, UI state
└── README.md
```

## Run Locally

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Run a local server

From the project directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://YOUR-IPV4-ADDRESS:8000/
```

For example, on the same machine you can also use:

```text
http://127.0.0.1:8000/
```

## Gameplay

- Move the paddle to keep the ball in play
- Break all bricks to win
- Missing the ball costs one life
- Lose all lives and the game ends
- Press `Space` to launch the ball and to restart after win/lose

## Why this project is nice

- Easy to read
- Easy to modify
- Good small example of canvas-free browser game logic using standard DOM/CSS/JS
- Suitable as a beginner front-end game project or interview/demo portfolio piece

## Ideas for future improvements

- Multiple levels
- Power-ups
- Combo scoring
- Touch controls optimization
- High-score persistence with localStorage
- Particle effects and screen shake
- Pause menu and difficulty modes

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
