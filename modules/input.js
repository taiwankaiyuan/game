// modules/input.js

let keydownCallback = null;

// Function to handle keydown events
function handleKeyDown(event) {
    // Check if the pressed key is Spacebar
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent default spacebar action (e.g., scrolling)

        // Trigger the registered callback if it exists
        if (keydownCallback) {
            keydownCallback(); // Let the game module decide what 'Space' means based on state
        }
    }
    // Add other key handlers here if needed (e.g., pause 'P')
}

/**
 * Sets up the keyboard input listener.
 * @param {function} callback - The function to call when the designated key (Space) is pressed.
 */
export function setupInputListener(callback) {
    if (typeof callback !== 'function') {
        console.error("setupInputListener requires a function callback.");
        return;
    }
    keydownCallback = callback; // Store the callback provided by the game module

    // Remove existing listener first to avoid duplicates if this function is called again
    document.removeEventListener('keydown', handleKeyDown);
    // Add the event listener to the document
    document.addEventListener('keydown', handleKeyDown);

    console.log("Input listener set up for Space key.");
}

/**
 * Removes the keyboard input listener.
 */
export function removeInputListener() {
    document.removeEventListener('keydown', handleKeyDown);
    keydownCallback = null;
    console.log("Input listener removed.");
}
