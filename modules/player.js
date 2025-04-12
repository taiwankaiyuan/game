// modules/player.js
import {
  CANVAS_HEIGHT,
  GROUND_OFFSET,
  PLAYER_INITIAL_X,
  PLAYER_VISUAL_X,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  JUMP_VELOCITY,
  GRAVITY,
  MAX_JUMP_HEIGHT, // Might not be strictly needed if ground check works well, but keep for now
  PLAYER_FRAME_DELAY,
  PLAYER_TOTAL_FRAMES,
  PLAYER_FRAME_WIDTH,
  PLAYER_FRAME_HEIGHT,
  PLAYER_HITBOX_OFFSET_X,
  PLAYER_HITBOX_OFFSET_Y,
  PLAYER_HITBOX_WIDTH,
  PLAYER_HITBOX_HEIGHT,
  JUMP_COOLDOWN_FRAMES,
  INITIAL_GAME_SPEED, // <-- Import INITIAL_GAME_SPEED
} from "./constants.js";
import { playerImage, jumpSound } from "./assets.js";

// --- Player State ---
let player = {
  x: PLAYER_INITIAL_X, // Logical X for collision/positioning relative to game world
  visualX: PLAYER_VISUAL_X, // Fixed X position on screen where player is drawn
  y: 0, // Initial y will be set based on groundY
  width: PLAYER_WIDTH,
  height: PLAYER_HEIGHT,
  velocityY: 0,
  isJumping: false,
  isOnGround: true, // Start on the ground
  currentFrame: 0, // For animation
  frameCounter: 0, // For animation timing
  jumpCooldownTimer: 0, // Timer for jump cooldown
  // Hitbox (calculated dynamically)
  hitbox: {
    x: 0,
    y: 0,
    width: PLAYER_HITBOX_WIDTH,
    height: PLAYER_HITBOX_HEIGHT,
  },
};

let groundY = CANVAS_HEIGHT - PLAYER_HEIGHT - GROUND_OFFSET; // Initial ground calculation

// Function to update the ground position if needed (e.g., canvas resize)
export function updateGroundY() {
    groundY = CANVAS_HEIGHT - player.height - GROUND_OFFSET;
}

// Function to reset player state
export function resetPlayer() {
  player.x = PLAYER_INITIAL_X;
  // visualX remains the same
  player.y = groundY;
  player.velocityY = 0;
  player.isJumping = false;
  player.isOnGround = true;
  player.currentFrame = 0;
  player.frameCounter = 0;
  player.jumpCooldownTimer = 0;
  updatePlayerHitbox(); // Ensure hitbox is correct on reset
}

// Function to initiate a jump
export function jump() {
  if (player.isOnGround && player.jumpCooldownTimer <= 0) {
    player.velocityY = JUMP_VELOCITY;
    player.isJumping = true;
    player.isOnGround = false;
    player.jumpCooldownTimer = JUMP_COOLDOWN_FRAMES; // Start cooldown
    player.currentFrame = 0; // Set to fixed jump frame (frame 0)
    // Play jump sound
    jumpSound.currentTime = 0; // Rewind sound if it's already playing
    jumpSound.play().catch(e => console.error("Error playing jump sound:", e));
    console.log("Jump initiated");
  }
}

// --- Update Player ---
// Handles physics, animation, and state updates for the player
export function updatePlayer(currentSpeed) { // <-- Add currentSpeed parameter
    // --- Cooldown Timer ---
    if (player.jumpCooldownTimer > 0) {
        player.jumpCooldownTimer--;
    }

  // --- Apply Gravity ---
  if (!player.isOnGround) {
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    // console.log(`Updating Y: ${player.y}, VelocityY: ${player.velocityY}`);
  }

  // --- Ground Collision ---
  if (player.y >= groundY) {
    player.y = groundY;
    player.velocityY = 0;
    if (!player.isOnGround) { // Only reset jump state if we just landed
        // console.log("Landed on ground");
        player.isJumping = false;
        player.isOnGround = true;
    }
  } else {
    player.isOnGround = false; // If not on groundY, cannot be on ground
  }

  // --- Animation ---
  if (player.isOnGround) { // Only animate run/walk when on the ground
    // Calculate adjusted frame delay based on game speed
    const baseDelay = PLAYER_FRAME_DELAY;
    // Ensure currentSpeed is not zero to avoid division by zero
    const speedRatio = currentSpeed > 0 ? INITIAL_GAME_SPEED / currentSpeed : 1;
    // Calculate adjusted delay, ensuring it's at least 1 frame
    const adjustedPlayerFrameDelay = Math.max(1, Math.round(baseDelay * speedRatio));

    player.frameCounter++;
    // Use the adjusted delay for animation timing
    if (player.frameCounter >= adjustedPlayerFrameDelay) { // <-- Use adjusted delay
      // Ensure frame 0 (jump frame) isn't part of the walk cycle if it looks weird
      // Example: If frame 0 is jump, start walk cycle from frame 1
      // player.currentFrame = (player.currentFrame % (PLAYER_TOTAL_FRAMES -1)) + 1;
      player.currentFrame = (player.currentFrame + 1) % PLAYER_TOTAL_FRAMES;
      player.frameCounter = 0;
    }
  } else {
    // While in the air, keep the jump frame (already set in jump())
    // Reset frameCounter so animation timing is correct upon landing
    player.frameCounter = 0;
  }

  // --- Update Hitbox Position ---
  updatePlayerHitbox();
}

// Helper to update hitbox position based on player's visual position
function updatePlayerHitbox() {
    player.hitbox.x = player.visualX + PLAYER_HITBOX_OFFSET_X;
    player.hitbox.y = player.y + PLAYER_HITBOX_OFFSET_Y;
    // Width and height are constant, but set them here in case they become dynamic later
    player.hitbox.width = PLAYER_HITBOX_WIDTH;
    player.hitbox.height = PLAYER_HITBOX_HEIGHT;
}


// --- Draw Player ---
// Draws the player sprite frame on the canvas
export function drawPlayer(ctx) {
  // Calculate the source X position on the sprite sheet
  const sourceX = player.currentFrame * PLAYER_FRAME_WIDTH;

  // Draw the current frame
  ctx.drawImage(
    playerImage,
    sourceX, // Source X
    0, // Source Y (top edge of the sheet)
    PLAYER_FRAME_WIDTH, // Source Width
    PLAYER_FRAME_HEIGHT, // Source Height
    player.visualX, // Destination X on canvas
    player.y, // Destination Y on canvas
    PLAYER_WIDTH, // Destination Width
    PLAYER_HEIGHT // Destination Height
  );
  
  // --- Draw Hitbox for Debugging ---
  /* ctx.strokeStyle = "red";
  ctx.lineWidth = 1;
  ctx.strokeRect(
    player.hitbox.x,
    player.hitbox.y,
    player.hitbox.width,
    player.hitbox.height
  ); */
}

// --- Get Player State ---
// Exporting the player object directly can lead to unintended modifications.
// Provide getter functions for necessary properties if external access is needed,
// or pass the necessary parts of the state to other modules.
// For simplicity now, we might need player's hitbox elsewhere.
export function getPlayerHitbox() {
  // Return a copy to prevent external modification
  return { ...player.hitbox };
}

// Getter for player's vertical velocity
export function getPlayerVelocityY() {
  return player.velocityY;
}

// Setter for player's vertical velocity
export function setPlayerVelocityY(newVelocity) {
  player.velocityY = newVelocity;
}

// Setter for player's Y position
export function setPlayerY(newY) {
  player.y = newY;
  // Important: After manually setting Y, we might need to re-evaluate isOnGround
  // or other states, but let's keep it simple for now. Collision logic should handle it.
  // Also update hitbox immediately after changing position.
  updatePlayerHitbox(); 
}

// Set initial ground Y and player Y position
updateGroundY();
resetPlayer(); // Set initial state correctly based on groundY
