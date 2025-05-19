import Image from "next/image";
import Board from './components/Board';
import Game from './components/Game';

export default function Home() {

  return (
    <div className="h-screen w-screen bg-yellow-100">
      <Game />
      <Board />
    </div>
  )
}
