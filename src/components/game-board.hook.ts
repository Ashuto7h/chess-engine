import { useState, useEffect, useCallback } from 'react';
import { Piece } from '../classes/piece';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from '../classes/board';

export const useGameBoard = (board: Board) => {
  const [highlightMoves, setHighlightMoves] = useState<Move[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<null | Position>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debug, setDebug] = useState(false);
  const selectedPiece = selectedPosition
    ? board.state[selectedPosition.x][selectedPosition.y]
    : null;

  const playAsAI = useCallback(() => {
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

      moves.sort((a, b) => b.score - a.score);
      console.log('bestMoves: ', moves.slice(0, 3));
      await board.move(moves[0]);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (!board.isAITurn) {
      return;
    }

    if (!debug) {
      setIsLoading(true);
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

  return { isLoading, debug, handleClick, handleOnDebugChange, highlightMoves, selectedPiece };
};
