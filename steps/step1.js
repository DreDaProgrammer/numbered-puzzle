// steps/step1.js

/**
 * Takes the current puzzle state and moves tile 1 and tile 2
 * into their correct spots (top-left corner).
 *
 * @param {number[]} tiles - the current puzzle array (length 16, 0 = empty)
 * @returns {number[]} the updated puzzle state after placing 1 and 2
 */
export function doStep1(tiles) {
  const newTiles = tiles.slice(); // copy so we don’t mutate directly

  // ✅ 1 should be at index 0, 2 should be at index 1
  const index1 = newTiles.indexOf(1);
  const index2 = newTiles.indexOf(2);

  // Move tile 1 into position 0 if it’s not already there
  if (index1 !== 0) {
    [newTiles[index1], newTiles[0]] = [newTiles[0], newTiles[index1]];
  }

  // Move tile 2 into position 1 if it’s not already there
  const index2Now = newTiles.indexOf(2);
  if (index2Now !== 1) {
    [newTiles[index2Now], newTiles[1]] = [newTiles[1], newTiles[index2Now]];
  }

  return newTiles;
}
