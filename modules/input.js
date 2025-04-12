// modules/input.js

let keydownCallback = null;
let touchCallback = null; // 新增：用於觸控事件的回呼

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

// 新增：處理觸控開始事件的函式
function handleTouchStart(event) {
	// 新增：檢查觸控目標是否為全螢幕按鈕
	if (event.target && event.target.id === 'fullscreen-btn') {
		// 如果是全螢幕按鈕，則不觸發遊戲開始邏輯，讓按鈕的點擊事件正常處理
		return;
	}

	// 簡單地將任何觸控視為輸入，類似按下空白鍵
	event.preventDefault(); // 防止觸控可能引起的預設行為 (如縮放、捲動)

	// 觸發已註冊的回呼函式 (如果存在)
	if (touchCallback) {
		touchCallback(); // 讓遊戲模組根據狀態決定觸控的意義
	}
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
 * 新增：設定觸控輸入監聽器
 * @param {function} callback - 觸控開始時要呼叫的函式
 */
export function setupTouchListener(callback) {
	if (typeof callback !== 'function') {
		console.error("setupTouchListener requires a function callback.");
		return;
	}
	touchCallback = callback; // 儲存遊戲模組提供的回呼

	// 先移除現有的監聽器以避免重複
	document.removeEventListener('touchstart', handleTouchStart);
	// 將事件監聽器添加到 document
	document.addEventListener('touchstart', handleTouchStart, { passive: false }); // passive: false 允許 preventDefault

	console.log("Touch input listener set up.");
}

/**
 * Removes the keyboard input listener.
 */
export function removeInputListener() {
	document.removeEventListener('keydown', handleKeyDown);
	keydownCallback = null;
	console.log("Keyboard input listener removed."); // 修改 log 訊息使其更清晰
}

/**
 * 新增：移除觸控輸入監聽器
 */
export function removeTouchListener() {
	document.removeEventListener('touchstart', handleTouchStart);
	touchCallback = null;
	console.log("Touch input listener removed.");
}
