import {
  applyCheckerMove,
  checkerAllMoves,
  checkerMoves,
  chooseCheckerMove,
  createCheckersBoard
} from '../src/games/checkers.js'
import {
  applyReversiMove,
  createReversiBoard,
  reversiCount,
  reversiMoves
} from '../src/games/reversi.js'

let failures = 0

function log(name, ok, detail = '') {
  if (!ok) failures += 1
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ` :: ${detail}` : ''}`)
}

const checkers = createCheckersBoard()
const redOpening = checkerAllMoves(checkers, 'red')
const blackOpening = checkerAllMoves(checkers, 'black')
log('西洋跳棋双方开局均有 7 步合法走法', redOpening.length === 7 && blackOpening.length === 7, `${redOpening.length}/${blackOpening.length}`)

const afterPlayer = applyCheckerMove(checkers, redOpening[0]).board
const aiMove = chooseCheckerMove(afterPlayer)
const afterAi = aiMove ? applyCheckerMove(afterPlayer, aiMove).board : afterPlayer
log(
  '西洋跳棋电脑可响应玩家走法',
  Boolean(aiMove) &&
    afterAi.filter((piece) => piece?.toLowerCase() === 'r').length === 12 &&
    afterAi.filter((piece) => piece?.toLowerCase() === 'b').length === 12,
  JSON.stringify(aiMove)
)

const captureBoard = Array(64).fill('')
captureBoard[33] = 'r'
captureBoard[26] = 'b'
captureBoard[49] = 'r'
const captureMoves = checkerAllMoves(captureBoard, 'red')
const capture = captureMoves[0]
const captured = capture ? applyCheckerMove(captureBoard, capture).board : captureBoard
log(
  '西洋跳棋强制吃子并移除被吃棋子',
  captureMoves.length === 1 &&
    capture.from === 33 &&
    capture.to === 19 &&
    capture.captured === 26 &&
    !captured[26] &&
    captured[33] === '',
  JSON.stringify(capture)
)

const promotionBoard = Array(64).fill('')
promotionBoard[8] = 'r'
const promotion = applyCheckerMove(promotionBoard, { from: 8, to: 1, captured: -1 })
log('西洋跳棋红线升王', promotion.board[1] === 'R', promotion.piece)

const kingBoard = Array(64).fill('')
kingBoard[27] = 'R'
const kingMoves = checkerMoves(kingBoard, 27)
log(
  '西洋跳棋升王后可双向移动',
  kingMoves.some((move) => move.to < 27) && kingMoves.some((move) => move.to > 27),
  `${kingMoves.length} moves`
)

const reversi = createReversiBoard()
const blackOpeningReversi = reversiMoves(reversi, 'black')
const whiteOpeningReversi = reversiMoves(reversi, 'white')
const blackMove = blackOpeningReversi[0]
const afterBlack = blackMove ? applyReversiMove(reversi, blackMove, 'black') : reversi
log(
  '黑白棋双方开局均有 4 个合法位置',
  blackOpeningReversi.length === 4 && whiteOpeningReversi.length === 4,
  `${blackOpeningReversi.length}/${whiteOpeningReversi.length}`
)
log(
  '黑白棋落子会翻转夹住的棋子',
  blackMove?.flips.length === 1 &&
    reversiCount(afterBlack, 'black') === 4 &&
    reversiCount(afterBlack, 'white') === 1,
  JSON.stringify(blackMove)
)

console.log(failures ? `\n${failures} failed` : '\nENGINE CHECK PASSED')
process.exitCode = failures ? 1 : 0
