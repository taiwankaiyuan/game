// modules/constants.js

// --- Canvas ---
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;
export const GROUND_OFFSET = 20; // How high obstacles spawn from the bottom

// --- Player Sprite Sheet Details ---
export const PLAYER_SPRITE_WIDTH = 1536; // Total width of the sprite sheet
export const PLAYER_SPRITE_HEIGHT = 128; // Total height of the sprite sheet
export const PLAYER_TOTAL_FRAMES = 12; // Number of frames in the sheet
export const PLAYER_FRAME_WIDTH = PLAYER_SPRITE_WIDTH / PLAYER_TOTAL_FRAMES; // Width of a single frame (128)
export const PLAYER_FRAME_HEIGHT = PLAYER_SPRITE_HEIGHT; // Height of a single frame (128)

// --- Obstacle Sprite Sheet Details (Robot 1) ---
export const OBSTACLE1_SPRITE_WIDTH = 1024; // Total width for robot1.png
export const OBSTACLE1_SPRITE_HEIGHT = 128; // Total height for robot1.png
export const OBSTACLE1_TOTAL_FRAMES = 8; // Number of frames (1024 / 128 = 8)
export const OBSTACLE1_FRAME_WIDTH = OBSTACLE1_SPRITE_WIDTH / OBSTACLE1_TOTAL_FRAMES; // Width of a single frame (128)
export const OBSTACLE1_FRAME_HEIGHT = OBSTACLE1_SPRITE_HEIGHT; // Height of a single frame (128)

// --- Animation Timing ---
export const PLAYER_FRAME_DELAY = 2; // Change player frame every N game loop ticks
export const OBSTACLE_FRAME_DELAY = 10; // Change obstacle frame every N game loop ticks

// --- Background Layer Configuration ---
export const BG_IMAGE_WIDTH = 2133; // Width of background images
export const BG_LAYER_SPEED_FACTORS = [0.05, 0.1, 0.3, 0.5, 0.8]; // Speed factors for each layer

// --- Player Hitbox Adjustment ---
export const PLAYER_HITBOX_OFFSET_X = 50; // Offset from left edge of the frame
export const PLAYER_HITBOX_OFFSET_Y = 60; // Offset from top edge of the frame
export const PLAYER_HITBOX_WIDTH = 20; // Actual collision width
export const PLAYER_HITBOX_HEIGHT = 60; // Actual collision height

// --- Obstacle Hitbox Adjustment (Robot 1 - Initial Estimates) ---
export const OBSTACLE1_HITBOX_OFFSET_X = 50; // Estimate: Offset from left edge
export const OBSTACLE1_HITBOX_OFFSET_Y = 55; // Estimate: Offset from top edge
export const OBSTACLE1_HITBOX_WIDTH = 20; // Estimate: Actual collision width
export const OBSTACLE1_HITBOX_HEIGHT = 70; // Estimate: Actual collision height

// --- Player Physics ---
export const PLAYER_INITIAL_X = -5; // Slightly off-screen left
export const PLAYER_VISUAL_X = 50; // Drawing position
export const PLAYER_WIDTH = PLAYER_FRAME_WIDTH; // Use frame width for initial size
export const PLAYER_HEIGHT = PLAYER_FRAME_HEIGHT; // Use frame height for initial size
export const JUMP_VELOCITY = -12; // Initial upward velocity on jump
export const GRAVITY = 0.5 // Acceleration due to gravity
export const BOUNCE_VELOCITY = 10; // Upward velocity when bouncing on obstacle
export const MAX_JUMP_HEIGHT = 150; // Limit jump height
export const JUMP_COOLDOWN_FRAMES = 5; // Prevent immediate re-jump

// --- Game Speed ---
// Game Speed (Original - will be replaced by dynamic speed)
// export const GAME_SPEED = 5; // REMOVED - Now managed dynamically in game.js

// --- New Game Speed Constants ---
export const INITIAL_GAME_SPEED = 5; // Initial speed
export const GAME_SPEED_INCREMENT = 0.5; // How much speed increases each time
export const SCORE_THRESHOLD_FOR_SPEED_INCREASE = 500; // Increase speed every X points
export const MAX_GAME_SPEED = 15; // Maximum game speed

// --- Obstacle Spawning ---
export const MIN_OBSTACLE_INTERVAL = 90; // Minimum frames between obstacles
export const MAX_OBSTACLE_INTERVAL = 200; // Maximum frames between obstacles

// --- Image Paths ---
export const PLAYER_IMAGE_PATH = "sprite/girl.png";
export const OBSTACLE1_IMAGE_PATH = "sprite/robot1.png";
export const START_SCREEN_IMAGE_PATH = "backround/start-screen.png";
export const BG_IMAGE_PATHS = [
  "backround/city1/1.png",
  "backround/city1/2.png",
  "backround/city1/3.png",
  "backround/city1/4.png",
  "backround/city1/5.png",
];

// --- Sound Paths ---
export const START_SOUND_PATH = "sound/game-start-6104.mp3";
export const JUMP_SOUND_PATH = "sound/cartoon-jump-6462.mp3";
export const HIT_SOUND_PATH = "sound/cartoon-jump-6462.mp3";
export const GAME_OVER_SOUND_PATH = "sound/game-over-arcade-6435.mp3";
export const OBSTACLE_PASSED_SOUND_PATH = "sound/game-bonus-2-294436.mp3";
export const LEVEL_UP_SOUND_PATH = "sound/brass-new-level-151765.mp3";

// --- Game Mechanics ---
export const GAME_SPEED_START = 3;
