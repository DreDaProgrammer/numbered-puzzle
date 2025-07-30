// puzzle.js
import { find1and2 } from "./steps/find1and2.js";

window.addEventListener("DOMContentLoaded", () => {
  const gridSize = 4; // 4×4 puzzle
  const tileSize = 100; // each tile is 100px
  let tiles = [];
  let imageList = [];
  let currentImageIdx = 0;
  let currentImage = "";

  const puzzleEl = document.getElementById("puzzle");
  const autoBtn = document.getElementById("autoBtn");
  const nextBtn = document.getElementById("nextBtn");
  const randomBtn = document.getElementById("randomBtn");
  const messageEl = document.getElementById("message");

  // Utility: "american-goldfinch.jpg" → "American Goldfinch!"
  function formatName(filename) {
    const base = filename.replace(/\.[^/.]+$/, "");
    return (
      base
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ") + "!"
    );
  }

  // 1) Load manifest & pick a random start image
  fetch("assets/puzzle-images/manifest.json")
    .then((res) => res.json())
    .then((list) => {
      imageList = list.filter((n) => /\.(png|jpe?g)$/i.test(n));
      if (!imageList.length) {
        console.error("No images found in manifest.json");
        return;
      }
      currentImageIdx = Math.floor(Math.random() * imageList.length);
      currentImage = imageList[currentImageIdx];
      initPuzzle();
    })
    .catch((err) => console.error("Failed to load images:", err));

  // 2) Wire up buttons and start first round
  function initPuzzle() {
    autoBtn.addEventListener("click", autoComplete);
    nextBtn.addEventListener("click", () => {
      currentImageIdx = (currentImageIdx + 1) % imageList.length;
      currentImage = imageList[currentImageIdx];
      startRound();
    });
    randomBtn.addEventListener("click", () => {
      currentImageIdx = Math.floor(Math.random() * imageList.length);
      currentImage = imageList[currentImageIdx];
      startRound();
    });
    startRound();
    const findBtn = document.getElementById("findBtn");

    findBtn.addEventListener("click", () => {
      const message = find1and2(tiles);
      alert(message); // ✅ shows exact positions in a pop-up
    });
  }

  // 3) Start or reset a round (shuffled)
  function startRound() {
    messageEl.textContent = "";
    tiles = [...Array(gridSize * gridSize - 1).keys()]
      .map((n) => n + 1)
      .concat(0);
    shuffleTiles();
    render();
  }

  // 4) Fisher–Yates shuffle
  function shuffleTiles() {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
  }

  // 5) Render grid
  function render() {
    puzzleEl.innerHTML = "";
    tiles.forEach((num, idx) => {
      const cell = document.createElement("div");
      if (num === 0) {
        cell.className = "tile empty";
      } else {
        cell.className = "tile";
        cell.style.backgroundImage = `url("assets/puzzle-images/${currentImage}")`;
        const row = Math.floor((num - 1) / gridSize);
        const col = (num - 1) % gridSize;
        cell.style.backgroundPosition = `-${col * tileSize}px -${
          row * tileSize
        }px`;
        cell.textContent = num;
        cell.addEventListener("click", () => tryMove(idx));
      }
      puzzleEl.appendChild(cell);
    });
    checkWin();
  }

  // 6) Handle manual moves
  function tryMove(index) {
    const emptyIndex = tiles.indexOf(0);
    const r0 = Math.floor(emptyIndex / gridSize),
      c0 = emptyIndex % gridSize;
    const r1 = Math.floor(index / gridSize),
      c1 = index % gridSize;
    if (Math.abs(r0 - r1) + Math.abs(c0 - c1) === 1) {
      [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
      render();
    }
  }

  const positions = find1and2(tiles);
  console.log("Tile 1 is at:", positions.tile1);
  console.log("Tile 2 is at:", positions.tile2);

  // 7) On solve → show name and auto‑advance
  function checkWin() {
    const solved = tiles.every(
      (val, i) => val === (i < tiles.length - 1 ? i + 1 : 0)
    );
    if (solved) {
      messageEl.textContent = formatName(currentImage);
      setTimeout(() => {
        currentImageIdx = (currentImageIdx + 1) % imageList.length;
        currentImage = imageList[currentImageIdx];
        startRound();
      }, 1000);
    }
  }

  // 8) Auto‑complete: fill in solved state
  function autoComplete() {
    tiles = [...Array(gridSize * gridSize - 1).keys()]
      .map((n) => n + 1)
      .concat(0);
    render();
    // optional: show the name immediately
    messageEl.textContent = formatName(currentImage);
  }
});
