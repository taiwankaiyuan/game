// modules/assets.js
import {
  PLAYER_IMAGE_PATH,
  OBSTACLE1_IMAGE_PATH,
  START_SCREEN_IMAGE_PATH,
  BG_IMAGE_PATHS,
  START_SOUND_PATH,
  JUMP_SOUND_PATH,
  HIT_SOUND_PATH,
  GAME_OVER_SOUND_PATH,
  OBSTACLE_PASSED_SOUND_PATH,
  LEVEL_UP_SOUND_PATH,
} from "./constants.js";

// --- Image Objects ---
export const playerImage = new Image();
export const obstacleImage1 = new Image();
export const startScreenImage = new Image();
export const bgImages = BG_IMAGE_PATHS.map(() => new Image()); // Create an array of Image objects

// --- Sound Objects ---
export const startSound = new Audio(START_SOUND_PATH);
export const jumpSound = new Audio(JUMP_SOUND_PATH);
export const hitSound = new Audio(HIT_SOUND_PATH);
export const gameOverSound = new Audio(GAME_OVER_SOUND_PATH);
export const obstaclePassedSound = new Audio(OBSTACLE_PASSED_SOUND_PATH);
export const levelUpSound = new Audio(LEVEL_UP_SOUND_PATH);

// --- Loading State ---
let imagesToLoad = 2 + bgImages.length + 1; // Player, Obstacle1, Backgrounds, StartScreen
let imagesLoaded = 0;
let loadError = false;

// --- Asset Loading Promise ---
// Returns a promise that resolves when all images are loaded, or rejects if any fail.
export const loadAssets = () => {
  return new Promise((resolve, reject) => {
    const onImageLoad = (img) => {
      console.log(`Image loaded: ${img.src}`);
      imagesLoaded++;
      if (!loadError && imagesLoaded === imagesToLoad) {
        console.log("All images loaded successfully!");
        resolve(); // Resolve the promise when all images are loaded
      }
    };

    const onImageError = (img, event) => {
      console.error(`Failed to load image: ${img.src}`, event);
      loadError = true;
      reject(`Failed to load image: ${img.src}`); // Reject the promise on error
    };

    // Assign event handlers and src for each image
    playerImage.onload = () => onImageLoad(playerImage);
    playerImage.onerror = (e) => onImageError(playerImage, e);
    playerImage.src = PLAYER_IMAGE_PATH;

    obstacleImage1.onload = () => onImageLoad(obstacleImage1);
    obstacleImage1.onerror = (e) => onImageError(obstacleImage1, e);
    obstacleImage1.src = OBSTACLE1_IMAGE_PATH;

    startScreenImage.onload = () => onImageLoad(startScreenImage);
    startScreenImage.onerror = (e) => onImageError(startScreenImage, e);
    startScreenImage.src = START_SCREEN_IMAGE_PATH;

    bgImages.forEach((img, index) => {
      img.onload = () => onImageLoad(img);
      img.onerror = (e) => onImageError(img, e);
      img.src = BG_IMAGE_PATHS[index];
    });

    // Optional: Preload sounds (browsers often do this lazily)
    // You might want to add logic to ensure sounds are ready if needed.
    // startSound.load(); // Example, but often not necessary
  });
};

// Helper function (could be used internally or exported if needed elsewhere)
export function checkAllImagesLoaded() {
  return !loadError && imagesLoaded === imagesToLoad;
}
