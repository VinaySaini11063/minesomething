# Valentine's Day Proposal Website 💕

A beautiful, interactive single-page website to propose to your partner. It includes a love quiz, heart-shaped puzzle, memory jar, and a romantic proposal pop-up with "Yes" / "No" buttons.

## Features

- **Home** – Welcoming hero with floating hearts
- **Love Quiz** – Customizable questions about your relationship with instant feedback
- **Picture Puzzle** – 3×3 drag-and-drop puzzle using your own image; completing it reveals "Will you marry me?"
- **Proposal** – Button that opens a pop-up with the big question
- **Memory Jar** – Clickable notes you can fill with your own memories (and optional photos)
- **Interactive cursor** – Heart/sparkle effects and tooltips on desktop
- **Audio** – Mute button, volume slider, and sound effects (chimes on correct quiz, puzzle place, etc.)
- **Responsive** – Works on desktop, tablet, and mobile (touch-friendly; cursor effects disabled on touch devices)

## How to Run

1. Open `index.html` in a modern browser, or
2. Serve the folder with a local server (e.g. `npx serve .` or `python -m http.server`) if you add background music or images from files.

## Customization

### Quiz questions

Edit the `quizData` array in `js/app.js`:

```javascript
const quizData = [
  {
    question: 'Where was our first date?',
    options: ['Coffee shop', 'Restaurant', 'Park', 'Movies'],
    correct: 0,  // index of the correct option (0–3)
  },
  // Add more questions...
];
```

### Memory Jar

Edit the `memoryData` array in `js/app.js`:

```javascript
const memoryData = [
  { icon: '💕', title: 'First Date', text: 'Your description here.', photo: null },
  // For a photo: photo: 'images/our-photo.jpg'
];
```

Add your own images in an `images` folder and set `photo: 'images/filename.jpg'` for any memory.

### Puzzle image

1. Add your puzzle picture as **`images/puzzle.jpg`** (or another path).
2. In `js/app.js`, set `puzzleImageUrl` to that path (e.g. `'images/puzzle.jpg'` or `'images/our-photo.jpg'`).
3. A square image (e.g. 600×600 px) works best so the 3×3 pieces look even.

### Background music

In `js/app.js`, uncomment and set the music URL:

```javascript
const bgMusicUrl = 'path/to/romantic-music.mp3';
const bgAudio = new Audio(bgMusicUrl);
bgAudio.loop = true;
bgAudio.volume = state.volume;
document.querySelector('.start-btn')?.addEventListener('click', () => { bgAudio.play().catch(() => {}); });
```

Then call `bgAudio.play()` where you want the music to start (e.g. on "Start the Journey" or when the page loads, depending on autoplay rules).

### Tooltips

Add or change `data-tooltip="Your message"` on any button or element in `index.html` to show a message when the user hovers (desktop only).

## Tech

- **GSAP** (CDN) – Animations and transitions
- **Vanilla JS** – No framework; one `app.js` file
- **CSS** – Variables, gradients, clip-path for the heart puzzle, responsive layout

## Browser support

Works in modern Chrome, Firefox, Safari, and Edge. For best experience use a recent browser (e.g. last 2 versions).

---

Made with love for your Valentine's Day proposal. 💕
