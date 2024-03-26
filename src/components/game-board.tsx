import clsx from 'clsx';
import { Col, Row } from 'react-bootstrap';
import { Board } from '../classes/board';
import { PIECE_ICON_MAP } from '../constants/piece-icon-map';
import { useGameBoard } from './game-board.hook';
import './game-board.scss';
interface GameBoardProps {
  board: Board;
}
export function GameBoard({ board }: GameBoardProps) {
  const { debug, handleOnDebugChange, isLoading, handleClick, highlightMoves, selectedPiece } =
    useGameBoard(board);

  return (
    <div>
      <div>
        debug: <input type="checkbox" checked={debug} onChange={handleOnDebugChange} />
      </div>{' '}
      {board.isAITurn ? 'AI TURN' : 'YOUR TURN'} {isLoading && '| LOADING...'}
      {Array.from({ length: 8 }).map((_, i) => (
        <Row key={i + (board.isAITurn ? 'true' : 'false')}>
          {Array.from({ length: 8 }).map((_, j) => {
            const piece = board.state[i][j].piece;
            const icon = piece ? PIECE_ICON_MAP[piece.color][piece.type] : '';
            const highlight = highlightMoves.find(
              ({ movePosition }) => movePosition.x === i && movePosition.y === j,
            );

            return (
              <Col
                className={clsx('cell', highlight && 'pad')}
                sm={1}
                key={i + j + (piece?.id ?? '')}>
                <div
                  className={clsx(
                    (i + j) % 2 ? 'black' : 'white',
                    icon && piece?.color === 'white' && 'pointer',
                    highlight && 'highlight',
                    piece && selectedPiece && piece.id === selectedPiece.id && 'selected',
                  )}
                  onClick={() => handleClick(piece, { x: i, y: j })}>
                  <span className="piece-icon">{icon}</span>
                  {<span className="coordinate">{debug ? `${i}${j}:` : ''}</span>}
                  {debug && highlight && <span className="score">{highlight.score}</span>}
                  <span className="piece-id">{debug ? piece?.id : ''}</span>
                </div>
              </Col>
            );
          })}
        </Row>
      ))}
    </div>
  );
}
