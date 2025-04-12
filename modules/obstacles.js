// modules/obstacles.js
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_OFFSET,
  OBSTACLE1_FRAME_WIDTH,
  OBSTACLE1_FRAME_HEIGHT,
  OBSTACLE1_TOTAL_FRAMES,
  OBSTACLE_FRAME_DELAY,
  OBSTACLE1_HITBOX_OFFSET_X,
  OBSTACLE1_HITBOX_OFFSET_Y,
  OBSTACLE1_HITBOX_WIDTH,
  OBSTACLE1_HITBOX_HEIGHT,
  MIN_OBSTACLE_INTERVAL,
  MAX_OBSTACLE_INTERVAL,
  INITIAL_GAME_SPEED,
} from "./constants.js";
import { obstacleImage1 } from "./assets.js";

let obstacles = []; // Array to hold active obstacles
let obstacleTimer = 0; // Timer to count frames until next spawn
let nextObstacleInterval = getRandomInterval(); // Initial interval

// Function to get random interval for spawning
function getRandomInterval() {
  return (
    Math.floor(
      Math.random() * (MAX_OBSTACLE_INTERVAL - MIN_OBSTACLE_INTERVAL + 1)
    ) + MIN_OBSTACLE_INTERVAL
  );
}

// Function to spawn a new obstacle
function spawnObstacle() {
  // Calculate Y position based on ground (can be adjusted if obstacles can fly)
  const obstacleY = CANVAS_HEIGHT - OBSTACLE1_FRAME_HEIGHT - GROUND_OFFSET;

  const newObstacle = {
    x: CANVAS_WIDTH, // Start off-screen right
    y: obstacleY,
    width: OBSTACLE1_FRAME_WIDTH,
    height: OBSTACLE1_FRAME_HEIGHT,
    type: "robot1", // Identifier if you add more obstacle types
    currentFrame: 0,
    frameCounter: 0,
    // Hitbox calculation based on constants
    hitbox: {
      x: 0, // Will be updated in updateObstacles
      y: 0, // Will be updated in updateObstacles
      width: OBSTACLE1_HITBOX_WIDTH,
      height: OBSTACLE1_HITBOX_HEIGHT,
    },
    passed: false, // Flag to track if the player has passed this obstacle for scoring
  };

  // Calculate initial hitbox position
  updateObstacleHitbox(newObstacle);

  obstacles.push(newObstacle);
  // console.log("Spawned obstacle:", newObstacle);
}

// Helper to update obstacle hitbox position
function updateObstacleHitbox(obstacle) {
  obstacle.hitbox.x = obstacle.x + OBSTACLE1_HITBOX_OFFSET_X;
  obstacle.hitbox.y = obstacle.y + OBSTACLE1_HITBOX_OFFSET_Y;
}

// --- Update Obstacles ---
// Moves obstacles, handles animation, spawning, and removal
export function updateObstacles(currentSpeed, playerVisualX, onObstaclePassed) {
  // --- Spawning ---
  obstacleTimer++;
  if (obstacleTimer >= nextObstacleInterval) {
    spawnObstacle();
    obstacleTimer = 0; // Reset timer
    nextObstacleInterval = getRandomInterval(); // Get next random interval
  }

  // --- Update Existing Obstacles ---
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obstacle = obstacles[i];

    // Move obstacle left
    obstacle.x -= currentSpeed;

    // Update animation frame
    // Calculate adjusted frame delay based on game speed
    const baseDelay = OBSTACLE_FRAME_DELAY;
    // Ensure currentSpeed is not zero to avoid division by zero
    const speedRatio = currentSpeed > 0 ? INITIAL_GAME_SPEED / currentSpeed : 1;
    // Calculate adjusted delay, ensuring it's at least 1 frame
    const adjustedObstacleFrameDelay = Math.max(1, Math.round(baseDelay * speedRatio));

    obstacle.frameCounter++;
    // Use the adjusted delay for animation timing
    if (obstacle.frameCounter >= adjustedObstacleFrameDelay) {
      obstacle.currentFrame = (obstacle.currentFrame + 1) % OBSTACLE1_TOTAL_FRAMES;
      obstacle.frameCounter = 0;
    }

    // Update hitbox position
    updateObstacleHitbox(obstacle);

    // --- Scoring Check ---
    // Check if the obstacle's right edge has passed the player's fixed visual X position
    // and hasn't been counted yet.
    if (!obstacle.passed && obstacle.x + obstacle.width < playerVisualX) {
      obstacle.passed = true;
      if (onObstaclePassed) {
        onObstaclePassed(); // Call the score increment callback
      }
      // console.log("Obstacle passed by player");
    }

    // Remove obstacle if it goes off-screen left
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(i, 1);
      // console.log("Removed obstacle");
    }
  }
}

// --- Draw Obstacles ---
// Draws all active obstacles on the canvas
export function drawObstacles(ctx) {
  obstacles.forEach((obstacle) => {
    // Calculate source X on the sprite sheet based on the current frame
    const sourceX = obstacle.currentFrame * OBSTACLE1_FRAME_WIDTH;

    ctx.drawImage(
      obstacleImage1, // The image source (robot1 sprite sheet)
      sourceX, // Source X from sprite sheet
      0, // Source Y (top edge of the sheet)
      OBSTACLE1_FRAME_WIDTH, // Source Width (single frame)
      OBSTACLE1_FRAME_HEIGHT, // Source Height (single frame)
      obstacle.x, // Destination X on canvas
      obstacle.y, // Destination Y on canvas
      obstacle.width, // Destination Width
      obstacle.height // Destination Height
    );

    // --- Draw Hitbox for Debugging ---
    /* ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      obstacle.hitbox.x,
      obstacle.hitbox.y,
      obstacle.hitbox.width,
      obstacle.hitbox.height
    ); */
  });
}

// --- Reset Obstacles ---
// Clears all obstacles and resets the spawn timer
export function resetObstacles() {
  obstacles = [];
  obstacleTimer = 0;
  nextObstacleInterval = getRandomInterval(); // Get a new interval for the fresh start
}

// --- Get Obstacles ---
// Returns a copy of the obstacles array for collision detection etc.
export function getObstacles() {
  // Return shallow copy - the objects inside are still mutable if needed,
  // but adding/removing from the returned array won't affect the original.
  return [...obstacles];
}
