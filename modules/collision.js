// modules/collision.js

/**
 * Checks for collision between two rectangles.
 * Assumes rectangles have { x, y, width, height } properties.
 * @param {object} rect1 - The first rectangle.
 * @param {object} rect2 - The second rectangle.
 * @returns {boolean} - True if the rectangles collide, false otherwise.
 */
export function checkCollision(rect1, rect2) {
  // Check for overlap on the X axis
  const xOverlap = rect1.x < rect2.x + rect2.width && rect1.x + rect1.width > rect2.x;
  // Check for overlap on the Y axis
  const yOverlap = rect1.y < rect2.y + rect2.height && rect1.y + rect1.height > rect2.y;
  // Collision occurs if there is overlap on both axes
  return xOverlap && yOverlap;
}
