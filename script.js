// 1. Get Canvas and Context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 2. Set Canvas Dimensions
canvas.width = 600;
canvas.height = 150;

// 3. Define Player Properties & Physics
const player = {
	// x: 50, // Player x position is fixed based on T-Rex game style
	x: -5, // Fixed X position, slightly off-screen left as per memory
	y: 0, // Initial y will be set by groundY
	width: 20,
	height: 20,
	color: 'orange',
	velocityY: 0,
	isJumping: false
};

const gravity = 0.4; // How fast player falls
const jumpForce = 8; // Adjusted based on memory 'low jump height' preference (tweak as needed)
const groundY = canvas.height - player.height; // Y position of the ground

// --- Game State & Score ---
let score = 0;
let isGameOver = false;
let isGameStarted = false; // New flag for game start state
let animationFrameId = null; // To store the request ID

// --- Obstacle Properties ---
const initialObstacleSpeed = 3; // Initial speed
const obstacles = []; // Array to hold all obstacles
let obstacleSpeed = initialObstacleSpeed; // How fast obstacles move left (adjust as needed)
let obstacleTimer = 0; // Timer to spawn next obstacle
const minObstacleInterval = 60; // Minimum frames between obstacles
const maxObstacleInterval = 120; // Maximum frames between obstacles

// Function to get random interval
function getRandomInterval() {
    return Math.floor(Math.random() * (maxObstacleInterval - minObstacleInterval + 1)) + minObstacleInterval;
}

// Function to spawn a new obstacle
function spawnObstacle() {
    const obstacleHeight = 30; // Example height
    const obstacleWidth = 15; // Example width
    const obstacle = {
        x: canvas.width, // Start off-screen right
        y: groundY + player.height - obstacleHeight, // Align bottom with player bottom
        width: obstacleWidth,
        height: obstacleHeight,
        color: 'red',
        passed: false // Flag to track if player passed this obstacle
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
    player.y = groundY;
    player.velocityY = 0;
    player.isJumping = false;
    obstacles.length = 0; // Clear obstacles array
    obstacleTimer = getRandomInterval(); // Reset obstacle timer
    obstacleSpeed = initialObstacleSpeed; // Reset speed
    isGameOver = false;
    // Don't reset isGameStarted here, resetGame is for RESTARTING

    // Restart the game loop if it was stopped
    // If the loop might still be requested, cancel just in case
    // and request a new one. This handles edge cases.
    cancelAnimationFrame(animationFrameId); // Cancel previous frame if any
    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Collision Detection ---
function checkCollision(rect1, rect2) {
    // Need to check collision based on the VISUAL position of the player (x=50)
    return (
        50 < rect2.x + rect2.width &&
        50 + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.height + rect1.y > rect2.y
    );
}

// 4. Create function to draw the player
function drawPlayer() {
	ctx.fillStyle = player.color;
	// Draw player at the fixed X position, adjust y based on physics
	ctx.fillRect(50, player.y, player.width, player.height); // Always draw at x=50
}

// --- Game Loop ---
function gameLoop() {
	// Clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	if (isGameStarted && !isGameOver) {
		// --- Update Player ---
		// Apply gravity
		if (player.isJumping) {
			player.velocityY += gravity;
			player.y += player.velocityY;
		}

		// Check for ground collision
		if (player.y >= groundY) {
			player.y = groundY;
			player.velocityY = 0;
			player.isJumping = false;
		}

		// --- Update and Draw Obstacles ---
		obstacleTimer--;
		if (obstacleTimer <= 0) {
			spawnObstacle();
		}

		// Move and draw each obstacle
		ctx.fillStyle = 'red'; // Set color for obstacles
		for (let i = obstacles.length - 1; i >= 0; i--) {
			let obs = obstacles[i];
			obs.x -= obstacleSpeed;
			ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

			// Remove obstacles that are off-screen
			if (obs.x + obs.width < 0) {
				obstacles.splice(i, 1);
			}

			// --- Check if obstacle passed player --- 
			if (!obs.passed && obs.x + obs.width < 50) { // 50 is player visual x
				const oldScore = score;
				obs.passed = true;
				score += 100;
				console.log("Score:", score);

				// Check for speed increase threshold
				if (Math.floor(score / 1000) > Math.floor(oldScore / 1000)) {
					obstacleSpeed += 0.2; // Increase speed slightly
					console.log("Speed Increased:", obstacleSpeed);
				}
			}

			// --- Check for Collision ---
			// Use the visual x=50 for player collision check
			const playerVisualRect = { ...player, x: 50 };
			if (!isGameOver && checkCollision(playerVisualRect, obs)) {
				// Collision detected! Set game over flag
				console.log("Game Over!");
				isGameOver = true;
				// Don't stop the loop here, let it continue to draw the score and game over message
			}
		}
	}

	// --- Draw everything --- 
	// Draw obstacles that might still be on screen even if game is over
	ctx.fillStyle = 'red';
	for (const obs of obstacles) {
		ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
	}
	drawPlayer();
	drawScore();

	// Display Game Over message if applicable
	if (isGameOver) {
		ctx.fillStyle = "rgba(0, 0, 0, 0.7)"; // Darker overlay
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = "30px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 20);
		ctx.font = "16px Arial";
		ctx.fillText("(Press Space or Enter to Restart)", canvas.width / 2, canvas.height / 2 + 20);
	} else if (!isGameStarted) {
		// Draw Start Screen message
		ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.font = "24px Arial";
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText("Press Space to Start", canvas.width / 2, canvas.height / 2);
	}

	// Request next frame (only if not game over, or handled by reset)
	// Keep requesting frames even on start screen to allow starting the game
	if (!isGameOver || !isGameStarted) { // Continue loop if game running OR on start screen
		animationFrameId = requestAnimationFrame(gameLoop);
	}
}

// --- Event Listener for Jumping ---
function handleKeyDown(event) {
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
	// Set initial player Y for drawing before game starts
	player.y = groundY; 
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawPlayer(); // Draw the player statically
	// Draw Start Screen message overlay
	ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = "24px Arial";
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.fillText("Press Space to Start", canvas.width / 2, canvas.height / 2);
}

drawInitialScreen();
