// modules/background.js
import { CANVAS_WIDTH, CANVAS_HEIGHT, BG_IMAGE_WIDTH, BG_LAYER_SPEED_FACTORS } from "./constants.js";
import { bgImages } from "./assets.js"; // Import the loaded background image objects

// --- Background Layer State ---
let backgroundLayers = [];

// Initialize background layers once assets are potentially loaded (or structure exists)
export function initializeBackgroundLayers() {
    // Prevent re-initialization if layers already exist and have images
    if (backgroundLayers.length > 0 && backgroundLayers[0].img) {
        return;
    }
    console.log("Initializing background layers...");
    backgroundLayers = bgImages.map((img, index) => {
        if (!img) {
            console.error(`Background image at index ${index} is not loaded.`);
            return null; // Or handle appropriately
        }
        return {
            img: img,
            x: 0,
            // Use speed factors defined in constants.js
            speedFactor: BG_LAYER_SPEED_FACTORS[index] !== undefined ? BG_LAYER_SPEED_FACTORS[index] : 0.1
        };
    }).filter(layer => layer !== null); // Remove any null entries if images failed to load
}

// --- Reset Background ---
export function resetBackground() {
    console.log("Resetting background positions.");
    backgroundLayers.forEach(layer => {
        layer.x = 0;
    });
}

// --- Update Background ---
// Updates the x position of each background layer for parallax effect
// Updates the x position of each background layer based on the current game speed
export function updateBackground(currentSpeed) { // Accept currentSpeed parameter
  if (!backgroundLayers || backgroundLayers.length === 0) {
    console.warn("Attempted to update background before layers were initialized.");
    return;
  }
  backgroundLayers.forEach(layer => {
    // Calculate the movement speed for this layer based on game speed and its speed factor
    // Calculate the movement speed for this layer based on current game speed and its speed factor
    const layerSpeed = currentSpeed * layer.speedFactor;
    layer.x -= layerSpeed;

    // If the first image scrolls completely off-screen to the left, reset its position
    // by moving it to the right, immediately after the second image.
    // This assumes BG_IMAGE_WIDTH is the width of a single background tile.
    // Check if the image needs to loop
    // BG_IMAGE_WIDTH should be the width of one tile of the background image
    if (layer.x <= -BG_IMAGE_WIDTH) {
      // Resetting x by adding the width effectively moves it to the end.
      // A small adjustment might be needed depending on exact looping logic.
      // Using modulo might be cleaner if the total movement allows it.
      // Let's stick to the original logic's apparent intent for now.
      // Reset position by adding the width * number of tiles off screen
      // For seamless looping with two images, just add BG_IMAGE_WIDTH
      // If layer.x can become very negative quickly, use modulo
      // layer.x = layer.x % BG_IMAGE_WIDTH; // This might be simpler if BG_IMAGE_WIDTH is correct
      layer.x += BG_IMAGE_WIDTH; // Simple reset for tiling effect
       // Add a small buffer to prevent potential gaps if speed causes overshoot
       if(layer.x < -BG_IMAGE_WIDTH) {
           layer.x = 0; // Fallback reset
       }
    }
  });
}

// --- Draw Background ---
// Draws the background layers onto the canvas
export function drawBackground(ctx) {
    if (!backgroundLayers || backgroundLayers.length === 0) {
       // console.warn("Attempted to draw background before layers were initialized.");
       // Maybe draw a default background color?
       ctx.fillStyle = '#87CEEB'; // Light Sky Blue
       ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
       return;
    }
    backgroundLayers.forEach(layer => {
        if (!layer.img || !layer.img.complete || layer.img.naturalHeight === 0) {
           // console.warn("Skipping drawing for an incomplete or invalid background layer image.");
           return; // Skip drawing if image is invalid
        }
        // Draw the first image
        ctx.drawImage(layer.img, layer.x, 0, BG_IMAGE_WIDTH, CANVAS_HEIGHT);
        // Draw the second image immediately following the first one for seamless looping
        ctx.drawImage(layer.img, layer.x + BG_IMAGE_WIDTH, 0, BG_IMAGE_WIDTH, CANVAS_HEIGHT);
        // Draw a third image if necessary to cover edge cases with high speeds? Usually two is enough.
        if (layer.x + BG_IMAGE_WIDTH < CANVAS_WIDTH) {
             ctx.drawImage(layer.img, layer.x + (2 * BG_IMAGE_WIDTH), 0, BG_IMAGE_WIDTH, CANVAS_HEIGHT);
        }
    });
}
