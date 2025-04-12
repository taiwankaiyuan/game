// modules/game.js
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_VISUAL_X,
  INITIAL_GAME_SPEED,
  GAME_SPEED_INCREMENT,
  SCORE_THRESHOLD_FOR_SPEED_INCREASE,
  MAX_GAME_SPEED,
  BOUNCE_VELOCITY, // Import new constant
  PLAYER_HITBOX_OFFSET_Y, // Needed to calculate visual Y from hitbox Y
  PLAYER_HEIGHT, // Needed to calculate visual Y from hitbox Y
} from "./constants.js";
import { checkCollision } from "./collision.js";
import {
  startSound,
  hitSound, // <<< 重新加入此行
  gameOverSound,
  obstaclePassedSound,
  levelUpSound,
} from "./assets.js";
import {
  resetPlayer,
  updatePlayer,
  drawPlayer,
  jump,
  getPlayerHitbox,
  getPlayerVelocityY, // Import new getter
  setPlayerVelocityY, // Import new setter
  setPlayerY,         // Import new setter
} from "./player.js";
import {
  resetObstacles,
  updateObstacles,
  drawObstacles,
  getObstacles,
} from "./obstacles.js";
import {
  initializeBackgroundLayers,
  resetBackground,
  updateBackground,
  drawBackground,
} from "./background.js";
import { drawScore, drawStartScreen, drawGameOverScreen } from "./ui.js";

// --- Game State ---
const GameState = {
  LOADING: "loading", // Maybe managed by main.js now
  START_SCREEN: "start_screen",
  PLAYING: "playing",
  GAME_OVER: "game_over",
};

let currentState = GameState.START_SCREEN; // Initial state after loading
let score = 0;
let gameLoopId = null; // To store the requestAnimationFrame ID
let ctx = null; // Canvas context, will be set during initialization
let currentSpeed = INITIAL_GAME_SPEED; // Add currentSpeed variable

// --- Initialization ---
export function initGame(canvasContext) {
  if (!canvasContext) {
    console.error("Canvas context is required for game initialization.");
    return;
  }
  ctx = canvasContext;
  currentState = GameState.START_SCREEN;
  score = 0;
  currentSpeed = INITIAL_GAME_SPEED; // Initialize speed
  initializeBackgroundLayers();
  resetGame(); // Resets player, obstacles, score, and now speed
  console.log("Game initialized. State:", currentState, "Initial Speed:", currentSpeed);
  requestAnimationFrame(gameLoop);
}

// --- Reset Game ---
function resetGame() {
  console.log("Resetting game...");
  score = 0;
  currentSpeed = INITIAL_GAME_SPEED; // Reset speed here as well
  console.log("Game speed reset to:", currentSpeed);
  resetPlayer();
  resetObstacles();
  resetBackground();
  // If resetting because of game over, transition to start screen
  if (currentState === GameState.GAME_OVER) {
      currentState = GameState.START_SCREEN;
  }
  // No need to manage the loop here, it continues running
}

// --- Start Game ---
function startGame() {
  if (currentState === GameState.START_SCREEN) {
    console.log("Starting game...");
    currentState = GameState.PLAYING;
    resetGame(); // Reset includes resetting speed now
    startSound.currentTime = 0;
    startSound.play().catch((e) => console.error("Error playing start sound:", e));
    // The game loop is already running, it will switch to PLAYING logic
  }
}

// --- Game Over ---
function triggerGameOver() {
  if (currentState === GameState.PLAYING) { // Only trigger if currently playing
    console.log("Game Over!");
    currentState = GameState.GAME_OVER;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch((e) => console.error("Error playing game over sound:", e));
    // The game loop will now draw the game over screen
  }
}

// --- Score Increment Callback & Speed Increase ---
function handleObstaclePassed() {
  score += 100; // Change score increment to 100
  obstaclePassedSound.currentTime = 0; // 加入這行
  obstaclePassedSound.play().catch((e) => console.error("Error playing obstacle passed sound:", e)); // 加入這行

  // Check if score reached a threshold for speed increase
  if (score > 0 && score % SCORE_THRESHOLD_FOR_SPEED_INCREASE === 0) {
    if (currentSpeed < MAX_GAME_SPEED) {
      currentSpeed += GAME_SPEED_INCREMENT;
      // Clamp speed to the maximum value
      currentSpeed = Math.min(currentSpeed, MAX_GAME_SPEED);
      console.log(
        `Score reached ${score}, speed increased to: ${currentSpeed.toFixed(2)}`
      );
      // --- Play Level Up Sound --- <<< 新增音效播放
      levelUpSound.currentTime = 0; // Reset sound playback
      levelUpSound.play().catch((e) => console.error("Error playing level up sound:", e));
      // ---------------------------
    }
  }
}

// --- Game Loop ---
function gameLoop(timestamp) { // timestamp is provided by requestAnimationFrame
  if (!ctx) {
    console.error("Game loop running without canvas context.");
    return;
  }

  // --- Clear Canvas ---
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // --- State-Based Logic ---
  switch (currentState) {
    case GameState.START_SCREEN:
      // Only draw elements for the start screen
      initializeBackgroundLayers();
      // Draw background without speed parameter
      drawBackground(ctx);
      drawPlayer(ctx);
      drawStartScreen(ctx);
      break;

    case GameState.PLAYING:
      // --- Updates ---
      updateBackground(currentSpeed); // Pass currentSpeed
      updatePlayer(currentSpeed); // Pass currentSpeed here
      updateObstacles(currentSpeed, PLAYER_VISUAL_X, handleObstaclePassed); // Pass currentSpeed

      // --- Collision Detection ---
      const playerHitbox = getPlayerHitbox();
      const currentObstacles = getObstacles();
      for (const obstacle of currentObstacles) {
        // Ensure obstacle has a valid hitbox before checking collision
        if (obstacle.hitbox && checkCollision(playerHitbox, obstacle.hitbox)) {
            const playerVelocityY = getPlayerVelocityY();
            const playerBottom = playerHitbox.y + playerHitbox.height;
            const obstacleTop = obstacle.hitbox.y;
            const bounceTolerance = 5; // Allow slight overlap

            // Check if player is falling and hitting the top of the obstacle
            if (playerVelocityY > 0 && playerBottom <= obstacleTop + bounceTolerance) {
                // --- Bounce Logic ---
                console.log("Bounce!");
                // Adjust player Y position to be exactly on top of the obstacle
                // We need the *visual* Y, so calculate from hitbox Y
                const newPlayerVisualY = obstacleTop - PLAYER_HEIGHT;
                setPlayerY(newPlayerVisualY);
                // Apply bounce velocity
                setPlayerVelocityY(-BOUNCE_VELOCITY);
                // Play a sound? Increase score? (Optional)
                // Maybe reset jump state slightly differently? For now, let updatePlayer handle ground state.
                hitSound.currentTime = 0; // <<< 新增此行，重設音效
                hitSound.play().catch(e => console.error("Error playing hit sound on bounce:", e)); // <<< 新增此行，播放碰撞音效

            } else {
                // --- Game Over Logic (Side or Bottom Collision) ---
                console.log("Collision type: Other (Side/Bottom/Top-Up)");
                triggerGameOver(); // Game over collision still triggers game over logic
                               // but won't play hit sound from within triggerGameOver anymore.
                break; // Exit obstacle loop once collision occurs
            }
        }
      }

      // --- Drawing --- (Only if still playing after collision check)
      if (currentState === GameState.PLAYING) {
        // Draw background without speed parameter
        drawBackground(ctx);
        drawObstacles(ctx);
        drawPlayer(ctx);
        drawScore(ctx, score);
      } else if (currentState === GameState.GAME_OVER) {
        // If collision happened *this frame*, immediately draw Game Over
        // Draw background without speed parameter
        drawBackground(ctx);
        drawObstacles(ctx);
        drawPlayer(ctx);
        drawGameOverScreen(ctx, score);
      }
      break;

    case GameState.GAME_OVER:
      // Draw the final scene elements and the game over overlay
      // Draw background without speed parameter
      drawBackground(ctx);
      drawObstacles(ctx);
      drawPlayer(ctx);
      drawGameOverScreen(ctx, score);
      break;
  }

  // Request the next frame
  // Store the ID so we can cancel it if needed (though not strictly necessary with state machine)
  gameLoopId = requestAnimationFrame(gameLoop);
}

// --- Input Handling ---
// This function will be passed to the input module
export function handleSpacePress() {
  // Action depends on the current game state
  switch (currentState) {
    case GameState.START_SCREEN:
      startGame();
      break;
    case GameState.PLAYING:
      jump(); // Player jumps
      break;
    case GameState.GAME_OVER:
      resetGame(); // Reset includes speed and sets state to START_SCREEN
      // The loop continues running, no need to restart it.
      break;
  }
}

// Function to potentially stop the game loop if needed elsewhere
export function stopGameLoop() {
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
    gameLoopId = null;
    console.log("Game loop stopped.");
  }
}
