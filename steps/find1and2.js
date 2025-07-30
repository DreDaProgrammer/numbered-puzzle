// steps/find1and2.js

/**
 * Finds the row/col positions of tiles 1 and 2.
 * @param {number[]} tiles - The 16-number puzzle array (0 = empty)
 * @returns {string} - A human readable message with positions of 1 and 2.
 */
export function find1and2(tiles) {
  const gridSize = 4;

  const index1 = tiles.indexOf(1);
  const index2 = tiles.indexOf(2);

  const tile1Row = Math.floor(index1 / gridSize);
  const tile1Col = index1 % gridSize;

  const tile2Row = Math.floor(index2 / gridSize);
  const tile2Col = index2 % gridSize;

  return `Tile 1 is at row ${tile1Row}, col ${tile1Col}\nTile 2 is at row ${tile2Row}, col ${tile2Col}`;
}
