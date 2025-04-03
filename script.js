// 1. Get Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- Image Loading ---
const playerImage = new Image();
playerImage.src = 'sprite/girl.png'; // Path to your player sprite sheet
let isPlayerImageLoaded = false; // Renamed for clarity

// Add obstacle image loading
const obstacleImage1 = new Image();
obstacleImage1.src = 'sprite/robot1.png'; // Path to your first obstacle sprite sheet
let isObstacleImage1Loaded = false;

// --- Background Image Loading ---
const bgImage1 = new Image();
bgImage1.src = 'backround/city1/1.png';
let isBgImage1Loaded = false;
const bgImage2 = new Image();
bgImage2.src = 'backround/city1/2.png';
let isBgImage2Loaded = false;
const bgImage3 = new Image();
bgImage3.src = 'backround/city1/3.png';
let isBgImage3Loaded = false;
const bgImage4 = new Image();
bgImage4.src = 'backround/city1/4.png';
let isBgImage4Loaded = false;
const bgImage5 = new Image();
bgImage5.src = 'backround/city1/5.png';
let isBgImage5Loaded = false;

// Helper function to check if all necessary images are loaded
function checkAllImagesLoaded() {
    return isPlayerImageLoaded && isObstacleImage1Loaded &&
           isBgImage1Loaded && isBgImage2Loaded && isBgImage3Loaded &&
           isBgImage4Loaded && isBgImage5Loaded;
}

// --- Player Sprite Sheet Details ---
const playerSpriteWidth = 1536; // Total width of the sprite sheet
const playerSpriteHeight = 128; // Total height of the sprite sheet
const playerTotalFrames = 12;  // Number of frames in the sheet
const playerFrameWidth = playerSpriteWidth / playerTotalFrames; // Width of a single frame (128)
const playerFrameHeight = playerSpriteHeight; // Height of a single frame (128)

// --- Obstacle Sprite Sheet Details (Robot 1) ---
const obstacle1SpriteWidth = 1024; // Total width for robot1.png
const obstacle1SpriteHeight = 128; // Total height for robot1.png
const obstacle1TotalFrames = 8;   // Number of frames (1024 / 128 = 8)
const obstacle1FrameWidth = obstacle1SpriteWidth / obstacle1TotalFrames; // Width of a single frame (128)
const obstacle1FrameHeight = obstacle1SpriteHeight; // Height of a single frame (128)

// Animation Timing
let playerCurrentFrame = 0;
let frameCounter = 0;
const frameDelay = 3; // Change frame every 5 game loop ticks (adjust for speed)

// --- Obstacle Frame Delay ---
const obstacleFrameDelay = 5; // Similar to player animation speed

// --- Background Layer Configuration ---
const BG_IMAGE_WIDTH = 2133; // Width of background images
const backgroundLayers = [
    { img: bgImage1, x: 0, speedFactor: 0.05 }, // Slowest, slight movement
    { img: bgImage2, x: 0, speedFactor: 0.1 },
    { img: bgImage3, x: 0, speedFactor: 0.3 },
    { img: bgImage4, x: 0, speedFactor: 0.5 },
    { img: bgImage5, x: 0, speedFactor: 0.8 }, // Fastest
];

// --- Player Hitbox Adjustment ---
// These values might need tweaking based on the actual sprite graphic
const playerHitboxOffsetX = 50; // Offset from left edge of the 128x128 frame
const playerHitboxOffsetY = 60; // Offset from top edge of the 128x128 frame
const playerHitboxWidth = 20;   // Actual collision width of the character
const playerHitboxHeight = 60; // Actual collision height of the character

// --- Obstacle Hitbox Adjustment (Robot 1 - Initial Estimates) ---
// These values WILL likely need tweaking based on the robot1.png visual
const obstacle1HitboxOffsetX = 50; // Estimate: Offset from left edge of the frame
const obstacle1HitboxOffsetY = 55; // Estimate: Offset from top edge of the frame
const obstacle1HitboxWidth = 20;   // Estimate: Actual collision width
const obstacle1HitboxHeight = 70;  // Estimate: Actual collision height

// 2. Set Canvas Dimensions
canvas.width = 800;
canvas.height = 400;

// --- Ground Position Offset ---
const groundOffset = 25; // Pixels to raise the ground from the bottom edge

// 3. Define Player Properties & Physics
const player = {
	x: -5, // Fixed X position, slightly off-screen left as per memory (internal logic)
	visualX: 50, // The X position where the player is actually drawn
	y: 0, // Initial y will be set by groundY after image loads
	width: playerFrameWidth,   // Use frame width for collision etc.
	height: playerFrameHeight, // Use frame height
	// color: 'orange', // No longer needed, using image
	velocityY: 0,
	isJumping: false
};

const gravity = 0.5;
const jumpForce = 12;
// groundY will be calculated after image loads, dependent on player height
let groundY;

// --- Game State & Score ---
let score = 0;
let isGameOver = false;
let isGameStarted = false; // New flag for game start state
let animationFrameId = null; // To store the request ID

// --- Obstacle Properties ---
const initialObstacleSpeed = 3; // Initial speed
const obstacles = []; // Array to hold all obstacles
let obstacleSpeed = initialObstacleSpeed; // How fast obstacles move left (adjust as needed)
let lastSpeedIncreaseScore = 0; // Track score at last speed increase
let nextSpeedIncrement = 0.1; // The amount to add for the *next* speed increase
let obstacleTimer = 0; // Timer to spawn next obstacle
const minObstacleInterval = 90; // Minimum frames between obstacles
const maxObstacleInterval = 200; // Maximum frames between obstacles

// Function to get random interval
function getRandomInterval() {
    return Math.floor(Math.random() * (maxObstacleInterval - minObstacleInterval + 1)) + minObstacleInterval;
}

// Function to spawn a new obstacle
function spawnObstacle() {
    // Check if the required obstacle image is loaded
    if (!isObstacleImage1Loaded) {
        console.warn("Obstacle image 1 not loaded yet, skipping spawn.");
        return;
    }

    // TODO: Later, randomly select which obstacle type to spawn
    // For now, always spawn robot1
    const frameWidth = obstacle1FrameWidth;
    const frameHeight = obstacle1FrameHeight;

    const obstacle = {
        x: canvas.width, // Start off-screen right
        y: groundY + player.height - frameHeight, // Align bottom with ground
        width: frameWidth, // Use image frame width
        height: frameHeight, // Use image frame height
        // color: 'red', // No longer needed
        image: obstacleImage1, // Reference to the image
        spriteWidth: obstacle1SpriteWidth,
        frameWidth: obstacle1FrameWidth, // Added for clarity in drawImage
        frameHeight: obstacle1FrameHeight, // Added for clarity
        totalFrames: obstacle1TotalFrames,
        currentFrame: 0, // Start at frame 0
        frameCounter: 0, // Initialize frame counter for animation
        frameDelay: obstacleFrameDelay, // Use the defined delay
        passed: false, // Flag to track if player passed this obstacle
        // Add hitbox properties for this obstacle type
        hitboxOffsetX: obstacle1HitboxOffsetX,
        hitboxOffsetY: obstacle1HitboxOffsetY,
        hitboxWidth: obstacle1HitboxWidth,
        hitboxHeight: obstacle1HitboxHeight
    };
    obstacles.push(obstacle);
    obstacleTimer = getRandomInterval(); // Reset timer for next spawn
}

// --- Draw Score ---
function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + Math.floor(score), 10, 30);
}

// --- Reset Game ---
function resetGame() {
    score = 0;
    // Ensure groundY is set before resetting player position
    if (typeof groundY !== 'undefined') {
        player.y = groundY;
    } else {
        // Fallback or error, groundY should be set by image load
        console.error("Cannot reset player Y: groundY is not defined.");
        // Assign a default or handle appropriately
        // For now, we assume groundY is calculated correctly during image load
    }
    player.velocityY = 0;
    player.isJumping = false;

	playerCurrentFrame = 0; // Reset animation frame
	frameCounter = 0;

    obstacles.length = 0; // Clear existing obstacles
    obstacleTimer = getRandomInterval(); // Reset obstacle spawn timer
    obstacleSpeed = initialObstacleSpeed; // Reset speed to initial value
    lastSpeedIncreaseScore = 0; // Reset the score tracker for speed increase
    nextSpeedIncrement = 0.1; // Reset the increment amount for the next speed boost

    isGameOver = false;
    // Ensure player and obstacle images are loaded before starting/restarting game loop
    if (isPlayerImageLoaded && isObstacleImage1Loaded) {
        player.y = groundY; // Ensure player is on the ground
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Restart the game loop if it was stopped
    // If the loop might still be requested, cancel just in case
    // and request a new one. This handles edge cases.
    cancelAnimationFrame(animationFrameId); // Cancel previous frame if any
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Collision Detection ---
// Use the passed rectangle's properties directly
function checkCollision(rect1, rect2) {
    // rect1 is the playerHitbox, rect2 is the obstacle
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// 4. Create function to draw the player
function drawPlayer() {
	if (!isPlayerImageLoaded) return; // Don't draw if image not loaded

	// Calculate source x based on current frame
	const sourceX = playerCurrentFrame * playerFrameWidth;

	// Draw the current frame of the player sprite sheet
	ctx.drawImage(
		playerImage,        // The image object
		sourceX,            // Source X (which frame horizontally)
		0,                  // Source Y (top edge of the sheet)
		playerFrameWidth,   // Source Width (width of one frame)
		playerFrameHeight,  // Source Height (height of one frame)
		player.visualX,     // Destination X (where to draw on canvas)
		player.y,           // Destination Y
		player.width,       // Destination Width (drawn size)
		player.height       // Destination Height (drawn size)
	);
}

// --- Draw Obstacles ---
function drawObstacles() {
    obstacles.forEach(obs => {
        if (!isObstacleImage1Loaded) return; // Don't draw if image not loaded

        // Calculate source x based on obstacle's current frame
        const sourceX = obs.currentFrame * obstacle1FrameWidth;

        // Draw the current frame of the obstacle sprite sheet
        ctx.drawImage(
            obstacleImage1,    // The image object
            sourceX,           // Source X (which frame horizontally)
            0,                 // Source Y (top edge of the sheet)
            obstacle1FrameWidth, // Source Width (width of one frame)
            obstacle1FrameHeight,// Source Height (height of one frame)
            obs.x,             // Destination X
            obs.y,             // Destination Y
            obs.width,         // Destination Width (drawn size)
            obs.height         // Destination Height (drawn size)
        );
    });
}

// --- Update Obstacles ---
function updateObstacles() {
    // Spawn new obstacles based on timer
    obstacleTimer--;
    if (obstacleTimer <= 0) {
        spawnObstacle();
    }

    // Move and update existing obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= obstacleSpeed; // Use the potentially increased speed

        // Update obstacle animation frame
        obs.frameCounter++;
        if (obs.frameCounter >= obs.frameDelay) {
            obs.currentFrame = (obs.currentFrame + 1) % obstacle1TotalFrames;
            obs.frameCounter = 0;
        }

        // --- Score Increment (moved from gameLoop) ---
        // Now only increment score if the obstacle is fully passed
        // Check if the right edge of the obstacle has passed the player's fixed visual X position
        if (!obs.passed && obs.x + obs.width < player.visualX) {
           score += 100; // Add 100 points for passing an obstacle
            obs.passed = true;
            console.log("Obstacle Passed! Score:", score); // Debug log
        }

        // Remove obstacles that are off-screen
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }
}

// --- Update Player ---
function updatePlayer() {
    // Apply gravity
    if (player.isJumping || player.y < groundY) {
        player.velocityY += gravity;
        player.y += player.velocityY;
    }

    // Prevent falling through the ground
    if (player.y > groundY) {
        player.y = groundY;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Update player animation frame
    // Only animate if not jumping (or maybe always animate?)
    // if (!player.isJumping) { // Let's try always animating
        frameCounter++;
        if (frameCounter >= frameDelay) {
            playerCurrentFrame = (playerCurrentFrame + 1) % playerTotalFrames;
            frameCounter = 0;
        }
    // }
}

// --- Game Loop ---
function gameLoop() {
	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw Backgrounds (Order: Furthest to Nearest) ---
    backgroundLayers.forEach(layer => {
        // Calculate speed for this frame based on current obstacleSpeed
        const currentLayerSpeed = obstacleSpeed * layer.speedFactor;
        // Update position
        layer.x -= currentLayerSpeed;
        // Draw image twice for seamless loop
        // Use BG_IMAGE_WIDTH for source and destination width
        ctx.drawImage(layer.img, layer.x, 0, BG_IMAGE_WIDTH, canvas.height);
        // Draw the second image starting from the end of the first one
        ctx.drawImage(layer.img, layer.x + BG_IMAGE_WIDTH, 0, BG_IMAGE_WIDTH, canvas.height);
        // If the first image has moved completely off-screen, reset its position
        if (layer.x <= -BG_IMAGE_WIDTH) {
            layer.x = 0;
        }
    });

	// --- Update Game Elements ---
	updatePlayer();
    updateObstacles(); // Update includes moving and spawning

    // --- Speed Increase Logic ---
    const scoreThreshold = 1000;
    // const speedIncrement = 0.1; // No longer fixed increment

    // Calculate the next score threshold for speed increase
    const nextThreshold = Math.floor(lastSpeedIncreaseScore / scoreThreshold + 1) * scoreThreshold;

    if (score >= nextThreshold) {
        obstacleSpeed += nextSpeedIncrement; // Add the current increment amount
        lastSpeedIncreaseScore = score; // Record the score at which speed was last increased
        console.log(`Score reached ${nextThreshold.toFixed(0)}. Speed increased by ${nextSpeedIncrement.toFixed(2)} to ${obstacleSpeed.toFixed(2)}`);
        nextSpeedIncrement *= 2; // Double the increment for the next time
    }

	// --- Draw Game Elements ---
	drawPlayer();
    drawObstacles();
    drawScore();

    // --- Collision Check ---
    for (let obs of obstacles) {
        // 1. Calculate Player's Precise Hitbox for this frame
        const playerHitbox = {
            x: player.visualX + playerHitboxOffsetX,
            y: player.y + playerHitboxOffsetY,
            width: playerHitboxWidth,
            height: playerHitboxHeight
        };

        // 2. Calculate Obstacle's Precise Hitbox for this frame
        const obstacleHitbox = {
            x: obs.x + obs.hitboxOffsetX,
            y: obs.y + obs.hitboxOffsetY,
            width: obs.hitboxWidth,
            height: obs.hitboxHeight
        };

        // Optional: Draw hitboxes for debugging
       /* ctx.strokeStyle = 'lime'; // Player hitbox color
        ctx.strokeRect(playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height);
        ctx.strokeStyle = 'cyan'; // Obstacle hitbox color
        ctx.strokeRect(obstacleHitbox.x, obstacleHitbox.y, obstacleHitbox.width, obstacleHitbox.height); */

        // --- Check for Collision ---
        // Use the calculated precise hitboxes for collision check
        if (checkCollision(playerHitbox, obstacleHitbox)) {
            // Collision detected!
            isGameOver = true;
            cancelAnimationFrame(animationFrameId); // Stop the game loop
            // Display Game Over message
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = "40px Arial";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);
            ctx.font = "20px Arial";
            ctx.fillText("Score: " + Math.floor(score), canvas.width / 2, canvas.height / 2);
            ctx.fillText("Press Space or Enter to Restart", canvas.width / 2, canvas.height / 2 + 40);
            return; // Exit gameLoop function
        }
    }

    // --- Request Next Frame ---
    // Only request if game is not over
    if (!isGameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// --- Event Listener for Jumping ---
function handleKeyDown(event) {
    // Prevent actions before ALL necessary images load
    if (!isPlayerImageLoaded || !isObstacleImage1Loaded) return;

    if (!isGameStarted && event.code === 'Space') {
        // Start the game
        isGameStarted = true;
        resetGame(); // Initialize game state and start the loop
    } else if (isGameStarted && isGameOver) {
        // Restart game on Space or Enter when game is over
        if (event.code === 'Space' || event.code === 'Enter') {
            resetGame();
        }
    } else if (isGameStarted && !isGameOver) {
        // Handle jump only if game is not over
        if ((event.code === 'Space' || event.code === 'ArrowUp') && !player.isJumping) {
            player.velocityY = -jumpForce; // Apply upward force
            player.isJumping = true;
        }
    }
}

document.addEventListener('keydown', handleKeyDown);

// --- Initial Setup ---
function drawInitialScreen() {
    // Wait for ALL images
    if (!checkAllImagesLoaded()) { // Use the helper function
        // Optionally draw a "Loading..." message
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        // More detailed loading text (optional)
        let loadedCount = [isPlayerImageLoaded, isObstacleImage1Loaded, isBgImage1Loaded, isBgImage2Loaded, isBgImage3Loaded, isBgImage4Loaded, isBgImage5Loaded].filter(Boolean).length;
        let totalImages = 7; // Update if more images are added
        ctx.fillText(`Loading Assets... (${loadedCount}/${totalImages})`, canvas.width / 2, canvas.height / 2);
        return;
    }
    // Set initial player Y now that we have the height and offset
    groundY = canvas.height - player.height - groundOffset; // Adjust ground Y calculation
    player.y = groundY; // Set initial player Y position
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer(); // Draw the player statically (first frame)
    // Draw Start Screen message overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Press Space to Start", canvas.width / 2, canvas.height / 2);
}

// --- Start Loading Image ---
playerImage.onload = () => {
    console.log("Player image loaded successfully!");
    isPlayerImageLoaded = true;
    // Calculate groundY only after player image is loaded (height is known)
    groundY = canvas.height - player.height - groundOffset; // Adjust ground Y calculation
    player.y = groundY; // Set initial player Y position
    if (checkAllImagesLoaded()) { // Check all images
        drawInitialScreen();
    }
};

playerImage.onerror = () => {
    console.error("Failed to load player image at " + playerImage.src);
    // Handle error, maybe draw placeholder or show error message
    // For now, might just draw the old rectangle as fallback?
    // Or display an error on canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Error loading player image!", canvas.width / 2, canvas.height / 2);
};

// Add onload/onerror for the obstacle image
obstacleImage1.onload = () => {
    console.log("Obstacle image 1 loaded successfully!");
    isObstacleImage1Loaded = true;
    if (checkAllImagesLoaded()) { // Check all images
        drawInitialScreen();
    }
};

obstacleImage1.onerror = () => {
    console.error("Failed to load obstacle image 1 at " + obstacleImage1.src);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Error loading obstacle image!", canvas.width / 2, canvas.height / 2);
};

// --- Background Image Load Handlers ---
bgImage1.onload = () => { console.log("BG 1 loaded."); isBgImage1Loaded = true; if (checkAllImagesLoaded()) drawInitialScreen(); };
bgImage1.onerror = () => console.error("Failed to load background image 1!");
bgImage2.onload = () => { console.log("BG 2 loaded."); isBgImage2Loaded = true; if (checkAllImagesLoaded()) drawInitialScreen(); };
bgImage2.onerror = () => console.error("Failed to load background image 2!");
bgImage3.onload = () => { console.log("BG 3 loaded."); isBgImage3Loaded = true; if (checkAllImagesLoaded()) drawInitialScreen(); };
bgImage3.onerror = () => console.error("Failed to load background image 3!");
bgImage4.onload = () => { console.log("BG 4 loaded."); isBgImage4Loaded = true; if (checkAllImagesLoaded()) drawInitialScreen(); };
bgImage4.onerror = () => console.error("Failed to load background image 4!");
bgImage5.onload = () => { console.log("BG 5 loaded."); isBgImage5Loaded = true; if (checkAllImagesLoaded()) drawInitialScreen(); };
bgImage5.onerror = () => console.error("Failed to load background image 5!");
