import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import './App.css';
import { GameBoard } from './components/game-board';
import { Board } from './classes/board';

function App() {
  const board = new Board();
  return (
    <Container fluid>
      <GameBoard board={board} />
    </Container>
  );
}

export default App;
