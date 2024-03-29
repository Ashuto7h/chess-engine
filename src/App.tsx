import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import './App.css';
import { Board } from './classes/board';
import { GameBoard } from './components/game-board';

function App() {
  const board = new Board();

  return (
    <Container fluid>
      <GameBoard board={board} />
    </Container>
  );
}

export default App;
