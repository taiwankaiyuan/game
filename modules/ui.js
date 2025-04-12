// modules/ui.js
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants.js";
import { startScreenImage } from "./assets.js"; // Import the start screen image

// --- Draw Score ---
export function drawScore(ctx, score) {
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.textAlign = "left"; // Align score to the left
  ctx.fillText("Score: " + score, 10, 30); // Position score at top-left
}

// --- Draw Start Screen ---
export function drawStartScreen(ctx) {
    // Ensure the start screen image is loaded (ideally checked before calling this)
    if (!startScreenImage || !startScreenImage.complete || startScreenImage.naturalWidth === 0) {
        // Fallback or loading indicator if image not ready
        ctx.fillStyle = "grey";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Loading Assets...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        console.warn("Attempted to draw start screen before image was ready.");
        return;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw start screen background image stretched to fit canvas
    ctx.drawImage(startScreenImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw semi-transparent overlay for better text visibility
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)"; // Slightly darker overlay
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Start Screen message
    ctx.font = "30px 'Arial Black', Gadget, sans-serif"; // Bolder font
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.shadowColor = "black"; // Add shadow for depth
    ctx.shadowBlur = 5;
    ctx.fillText("Press Space to Start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.shadowColor = "transparent"; // Reset shadow
    ctx.shadowBlur = 0;

    // Optional: Add instructions
    ctx.font = "16px Arial";
    ctx.fillText("Press SPACE to Jump", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
}

// --- Draw Game Over Screen ---
export function drawGameOverScreen(ctx, score) {
  // Dark semi-transparent overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Game Over text
  ctx.font = "48px 'Arial Black', Gadget, sans-serif";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.shadowColor = "black";
  ctx.shadowBlur = 7;
  ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

  // Final Score
  ctx.font = "24px Arial";
  ctx.fillStyle = "white";
   ctx.shadowColor = "black";
   ctx.shadowBlur = 5;
  ctx.fillText("Final Score: " + score, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

  // Restart prompt
  ctx.font = "20px Arial";
  ctx.fillStyle = "yellow"; // Make restart prompt stand out
  ctx.fillText("Press Space to Restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

  ctx.shadowColor = "transparent"; // Reset shadow
  ctx.shadowBlur = 0;
}

// --- Draw Loading Screen ---
export function drawLoadingScreen(ctx, loadedCount, totalCount) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Black background
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Loading Assets... (${loadedCount}/${totalCount})`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2
    );

    // Optional: Add a simple progress bar
    const barWidth = CANVAS_WIDTH * 0.6;
    const barHeight = 20;
    const barX = (CANVAS_WIDTH - barWidth) / 2;
    const barY = CANVAS_HEIGHT / 2 + 30;
    const progress = totalCount > 0 ? loadedCount / totalCount : 0;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight); // Outline

    ctx.fillStyle = "lightblue";
    ctx.fillRect(barX, barY, barWidth * progress, barHeight); // Filled part
}

// --- Draw Error Screen ---
export function drawErrorScreen(ctx, message) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.font = "20px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(`Error: ${message}`, ctx.canvas.width / 2, ctx.canvas.height / 2 - 20);
    ctx.fillText("Please refresh the page or check the console.", ctx.canvas.width / 2, ctx.canvas.height / 2 + 20);
}

// --- Fullscreen Button Setup ---
export function setupFullscreenButton() {
    const fullscreenButton = document.getElementById('fullscreen-btn');
    const canvasElement = document.getElementById('gameCanvas'); // Get the canvas element
    if (!canvasElement) { // Add check for canvas existence
        console.error("Canvas element 'gameCanvas' not found!");
        if (fullscreenButton) fullscreenButton.style.display = 'none'; // Hide button if canvas missing
        return;
    }
    // const elementToFullscreen = document.documentElement; // Original incorrect line
    const elementToFullscreen = canvasElement; // Target the canvas for fullscreen

    if (!fullscreenButton) {
        console.warn("Fullscreen button not found."); // Should not happen if index.html is correct
        return;
    }

    // Check if Fullscreen API is supported
    if (!elementToFullscreen.requestFullscreen) {
        console.warn("Fullscreen API is not supported by this browser or element.");
        fullscreenButton.style.display = 'none'; // Hide the button if not supported
        return;
    }

    fullscreenButton.addEventListener('click', () => {
        // Check fullscreen status using document.fullscreenElement
        if (document.fullscreenElement === elementToFullscreen) { // Check if THIS element is fullscreen
            // If already in fullscreen, exit fullscreen
            document.exitFullscreen().catch(err => {
                console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
            });
        } else if (!document.fullscreenElement) { // Only request if nothing is fullscreen
            // If not in fullscreen, request fullscreen for the canvas
            elementToFullscreen.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
             console.log("Another element is already in fullscreen."); // Handle case where another element is fullscreen
        }
    });

    // Optional: Change button text based on fullscreen state
    document.addEventListener('fullscreenchange', () => {
        // Check if our canvas is the element in fullscreen
        if (document.fullscreenElement === elementToFullscreen) {
            fullscreenButton.textContent = '離開全螢幕';
        } else {
            fullscreenButton.textContent = '全螢幕';
        }
    });

    console.log("Fullscreen button set up to target canvas.");
}
