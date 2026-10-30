export const CHECKERS_SIZE = 8

export function createCheckersBoard() {
  const board = Array(CHECKERS_SIZE * CHECKERS_SIZE).fill('')
  for (let row = 0; row < CHECKERS_SIZE; row += 1) {
    for (let col = 0; col < CHECKERS_SIZE; col += 1) {
      if ((row + col) % 2 !== 1) continue
      const index = row * CHECKERS_SIZE + col
      if (row < 3) board[index] = 'b'
      if (row > 4) board[index] = 'r'
    }
  }
  return board
}

export function checkerMoves(board, index) {
  const piece = board[index]
  if (!piece) return []
  const red = piece.toLowerCase() === 'r'
  const king = piece === piece.toUpperCase()
  const directions = king ? [-1, 1] : [red ? -1 : 1]
  const row = Math.floor(index / CHECKERS_SIZE)
  const col = index % CHECKERS_SIZE
  const moves = []

  for (const dy of directions) {
    for (const dx of [-1, 1]) {
      const nextRow = row + dy
      const nextCol = col + dx
      if (nextRow < 0 || nextRow >= CHECKERS_SIZE || nextCol < 0 || nextCol >= CHECKERS_SIZE) continue
      const nextIndex = nextRow * CHECKERS_SIZE + nextCol
      if (!board[nextIndex]) {
        moves.push({ from: index, to: nextIndex, captured: -1 })
        continue
      }

      const jumpRow = nextRow + dy
      const jumpCol = nextCol + dx
      if (jumpRow < 0 || jumpRow >= CHECKERS_SIZE || jumpCol < 0 || jumpCol >= CHECKERS_SIZE) continue
      const jumpIndex = jumpRow * CHECKERS_SIZE + jumpCol
      const targetIsRed = board[nextIndex].toLowerCase() === 'r'
      if (!board[jumpIndex] && targetIsRed !== red) {
        moves.push({ from: index, to: jumpIndex, captured: nextIndex })
      }
    }
  }
  return moves
}

export function checkerAllMoves(board, color) {
  const pieceColor = color === 'red' ? 'r' : color === 'black' ? 'b' : color
  const moves = board.flatMap((piece, index) => (
    piece && piece.toLowerCase() === pieceColor ? checkerMoves(board, index) : []
  ))
  const captures = moves.filter((move) => move.captured >= 0)
  return captures.length ? captures : moves
}

export function applyCheckerMove(board, move) {
  const next = board.slice()
  const piece = next[move.from]
  next[move.from] = ''
  if (move.captured >= 0) next[move.captured] = ''
  const row = Math.floor(move.to / CHECKERS_SIZE)
  let placed = piece
  if (piece === 'r' && row === 0) placed = 'R'
  if (piece === 'b' && row === CHECKERS_SIZE - 1) placed = 'B'
  next[move.to] = placed
  return { board: next, piece: placed }
}

export function chooseCheckerMove(board, forcedFrom = -1) {
  const moves = forcedFrom >= 0
    ? checkerMoves(board, forcedFrom).filter((move) => move.captured >= 0)
    : checkerAllMoves(board, 'black')
  if (!moves.length) return null
  return moves
    .map((move) => {
      const row = Math.floor(move.to / CHECKERS_SIZE)
      const promotion = row === CHECKERS_SIZE - 1 ? 12 : 0
      return { ...move, value: (move.captured >= 0 ? 35 : 0) + promotion + row }
    })
    .sort((a, b) => b.value - a.value)[0]
}
