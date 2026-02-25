# PG29Vinicius_RapidPrototyping_A2_Proto2

A deck building screen prototype built with React + Vite.

---

## Prerequisites

Make sure you have the following installed on your machine:

- **Node.js** (version 18 or higher) → [nodejs.org](https://nodejs.org)
- **npm** (comes bundled with Node)

---

## Expected Project Structure

Create (or use) a Vite + React project folder. The structure should look like this:

```
deck-builder/
├── public/
├── src/
│   ├── App.jsx        ← replace with the deck-builder.jsx file
│   ├── main.jsx
│   └── index.css      ← replace with the index.css file
├── index.html
├── package.json
└── vite.config.js
```

---

## Step-by-Step Setup

### 1. Create the project

Open a terminal in the folder where you want to create the project and run:

```bash
npm create vite@latest deck-builder -- --template react
```

When prompted for a framework, select **React**. When prompted for a variant, select **JavaScript** (not TypeScript).

Then navigate into the project folder:

```bash
cd deck-builder
```

---

### 2. Install dependencies

Inside the `deck-builder` folder, run:

```bash
npm install
```

This will download all required dependencies (React, Vite, etc.).

---

### 3. Replace the source files

Copy the two provided files into the `src/` folder:

- `deck-builder.jsx` → save as `src/App.jsx` (replaces the existing file)
- `index.css` → save as `src/index.css` (replaces the existing file)

**Important:** the file must be named exactly `App.jsx`, not `deck-builder.jsx`.

---

### 4. Run the project

With everything in place, run:

```bash
npm run dev
```

The terminal will display something like:

```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and go to **http://localhost:5173**. The prototype will load.

---

## Features

### Navigation
- **Main Menu** → starting screen with access to Deck Builder, Options, and battle
- **Options** → mockup settings screen (audio, display, language)
- **Play** → mockup battle screen with a battlefield and a hand of cards

### Deck Builder
| Action | How to do it |
|--------|--------------|
| Add a card to the deck | Drag it from the inventory to the carousel, or double-click the card and press "Add to Deck" |
| Remove a card from the deck | Double-click the card in the carousel, or drag it back to the inventory panel |
| Reorder cards in the deck | Drag a card in the carousel and drop it on top of another slot to swap them |
| Search for cards | Use the search bar above the inventory |
| Filter by category | Click the "Filter" button next to the search bar |
| Switch decks | Use the Deck 1 / 2 / 3 / 4 buttons in the top bar |
| Rename a deck | Click the ✏️ icon next to the deck name |
| Save the deck | Click "Save Deck" in the top-right corner |
| Fuse cards | Click "✦ Fuse Cards", then click two compatible cards |

### Deck Rules
- Maximum of **10 cards** per deck
- Maximum of **2 copies** of the same card per deck
- The player has **3 copies** of each base card (45 cards total)
- Adding a card to a deck does **not** remove it from the collection — each deck is independent

### Fusion System
- Activate fusion mode by clicking **"✦ Fuse Cards"**
- Click a card to select it as the first ingredient (purple highlight)
- Click a second compatible card
- If a fusion recipe exists, a modal appears showing the resulting card and its calculated stats
- Confirm to add the fused card to your collection
- The same fused card can be obtained from different card combinations, resulting in different stats each time

---

## Stopping the Server

To stop the development server, go back to the terminal and press `Ctrl + C`.

---

## Common Issues

**The screen appears cropped or doesn't fill the window**
→ Make sure `index.css` was replaced correctly. Vite's default file includes `display: flex; place-items: center` on the `body`, which breaks the layout.

**`Module not found` or similar error**
→ Run `npm install` again inside the project folder.

**Port 5173 is already in use**
→ Vite will automatically try the next available port (5174, 5175...). Check the terminal output for the actual URL.

**Blank screen with a console error**
→ Make sure the file was saved as `App.jsx` with a capital A, not `app.jsx`.