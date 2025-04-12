// main.js
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./modules/constants.js";
import { loadAssets } from "./modules/assets.js";
import { initGame, handleSpacePress } from "./modules/game.js";
import { setupInputListener, setupTouchListener, removeInputListener, removeTouchListener } from "./modules/input.js";
import { drawLoadingScreen, drawErrorScreen, setupFullscreenButton } from "./modules/ui.js"; // Import UI functions and fullscreen setup

// --- Get Canvas and Context ---
const canvas = document.getElementById("gameCanvas");
if (!canvas) {
  console.error("Failed to find canvas element with id 'gameCanvas'");
  // Optionally display an error message to the user in the HTML body
}
const ctx = canvas.getContext("2d");
if (!ctx) {
   console.error("Failed to get 2D rendering context for canvas.");
   // Optionally display an error message
}

// --- Set Canvas Dimensions ---
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// --- Application Initialization ---
async function initializeApp() {
    if (!ctx) return; // Don't proceed without context

    console.log("Initializing application...");

    // Show initial loading screen (optional, can be simple)
    // Note: The asset loader itself might update progress, but this is for the very start.
    // We might need a way to get progress updates from assets.js if we want a dynamic bar here.
    // For now, let's just show a basic "Loading..." before the promise starts.
    drawLoadingScreen(ctx, 0, 1); // Show loading with 0 progress initially

    try {
        console.log("Loading assets...");
        // Await the promise from loadAssets
        await loadAssets();
        console.log("Assets loaded successfully.");

        // Assets are loaded, initialize the game
        initGame(ctx);

        // Setup input listener, passing the game's handler function
        setupInputListener(handleSpacePress);
        // Setup touch listener, passing the game's handler function
        setupTouchListener(handleSpacePress);

        // Setup the fullscreen button
        setupFullscreenButton();

    } catch (error) {
        // Handle asset loading errors
        console.error("Asset loading failed:", error);
        // Draw an error screen on the canvas
        // Ensure error is a string for drawing
        const errorMessage = typeof error === 'string' ? error : (error.message || "Unknown loading error");
        drawErrorScreen(ctx, errorMessage);
        // Optionally, display a more user-friendly message in the HTML body
    }
}

// --- Start the Application ---
initializeApp();
