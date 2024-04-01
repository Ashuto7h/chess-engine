import { useState, useEffect, useCallback, useRef } from 'react';
import { Piece } from '../classes/piece';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from '../classes/board';
import { KeyboardEventHandler } from 'react';

export const useGameBoard = (board: Board) => {
  const [highlightMoves, setHighlightMoves] = useState<Move[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<null | Position>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState(false);
  const selectedPiece = selectedPosition
    ? board.state[selectedPosition.x][selectedPosition.y]
    : null;
  const isMounted = useRef(false);

  const playAsAI = useCallback(() => {
    setIsLoading(true);
    setTimeout(async () => {
      const moves: Move[] = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board.state[i][j];
          if (piece && piece.color === 'black') {
            moves.push(...piece.getValidMoves({ x: i, y: j }, board));
          }
        }
      }
      if (!moves.length) {
        alert('CheckMate. You won!');
        setIsLoading(false);
        return;
      }
      const bestMove = moves.reduce((a, b) => (a.score > b.score ? a : b));
      await board.move(bestMove);
      setIsLoading(false);
    }, 1000);
  }, [board]);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      const initBoard = async () => {
        setIsLoading(true);
        await board.initBoardState();
        setIsLoading(false);
      };
      initBoard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!board.isAITurn) {
      const moves = [];
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          const piece = board.state[i][j];
          if (piece && piece.color === 'white') {
            moves.push(...piece.getValidMoves({ x: i, y: j }, board));
            break;
          }
        }
        if (moves.length) {
          break;
        }
      }
      if (!moves.length) {
        alert('CheckMate. You Lose!');
      }
      return;
    }

    if (!debug) {
      playAsAI();
    }
  }, [board, board.isAITurn, debug, playAsAI]);

  const showPossibleMoves = (piece: Piece, position: Position) => {
    setSelectedPosition(position);
    const moves = piece.getValidMoves(position, board);
    setHighlightMoves(moves);
  };

  const movePiece = async (move: Move) => {
    await board.move(move);
    setSelectedPosition(null);
    setHighlightMoves([]);
  };

  const handleClick = async (clickedPiece: Piece | null, clickPosition: Position) => {
    if (isLoading) {
      return;
    }

    const clickedMove = highlightMoves.find(
      ({ movePosition }) =>
        movePosition.x === clickPosition.x && movePosition.y === clickPosition.y,
    );

    if (clickedMove) {
      await movePiece(clickedMove);
      return;
    }
    if (clickedPiece) {
      if (!debug && clickedPiece.color === 'black') {
        return;
      }
      showPossibleMoves(clickedPiece, clickPosition);
    }
  };

  const handleOnDebugChange = () => {
    setDebug(!debug);
    setSelectedPosition(null);
    setHighlightMoves([]);
  };

  const handleUndoClick: KeyboardEventHandler<HTMLDivElement> = async (event) => {
    if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
      await board.undoLastMove();
      await board.undoLastMove();
      setSelectedPosition(null);
      setHighlightMoves([]);
    }
  };

  const startNewGame = async () => {
    setIsLoading(true);
    await board.newGame();
    setIsLoading(false);
    setSelectedPosition(null);
    setHighlightMoves([]);
  };

  return {
    isLoading,
    debug,
    handleClick,
    handleOnDebugChange,
    highlightMoves,
    selectedPiece,
    handleUndoClick,
    startNewGame,
  };
};
