export const REVERSI_SIZE = 8
export const REVERSI_DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]

export function createReversiBoard() {
  const board = Array(REVERSI_SIZE * REVERSI_SIZE).fill('')
  board[27] = 'white'
  board[28] = 'black'
  board[35] = 'black'
  board[36] = 'white'
  return board
}

export function reversiFlips(board, index, color) {
  if (board[index]) return []
  const opposite = color === 'black' ? 'white' : 'black'
  const row = Math.floor(index / REVERSI_SIZE)
  const col = index % REVERSI_SIZE
  const flips = []

  for (const [dy, dx] of REVERSI_DIRECTIONS) {
    const line = []
    let nextRow = row + dy
    let nextCol = col + dx
    while (
      nextRow >= 0 && nextRow < REVERSI_SIZE &&
      nextCol >= 0 && nextCol < REVERSI_SIZE &&
      board[nextRow * REVERSI_SIZE + nextCol] === opposite
    ) {
      line.push(nextRow * REVERSI_SIZE + nextCol)
      nextRow += dy
      nextCol += dx
    }
    if (
      line.length &&
      nextRow >= 0 && nextRow < REVERSI_SIZE &&
      nextCol >= 0 && nextCol < REVERSI_SIZE &&
      board[nextRow * REVERSI_SIZE + nextCol] === color
    ) {
      flips.push(...line)
    }
  }
  return flips
}

export function reversiMoves(board, color) {
  return board.flatMap((value, index) => {
    const flips = reversiFlips(board, index, color)
    return flips.length ? [{ index, flips }] : []
  })
}

export function reversiCount(board, color) {
  return board.filter((value) => value === color).length
}

export function applyReversiMove(board, move, color) {
  const next = board.slice()
  next[move.index] = color
  move.flips.forEach((index) => {
    next[index] = color
  })
  return next
}

export function chooseReversiMove(board) {
  const options = reversiMoves(board, 'white')
  if (!options.length) return null
  const corners = new Set([0, 7, 56, 63])
  return options
    .map((move) => {
      const row = Math.floor(move.index / REVERSI_SIZE)
      const col = move.index % REVERSI_SIZE
      const edge = row === 0 || row === 7 || col === 0 || col === 7 ? 3 : 0
      return { ...move, value: move.flips.length * 4 + (corners.has(move.index) ? 20 : 0) + edge }
    })
    .sort((a, b) => b.value - a.value)[0]
}
