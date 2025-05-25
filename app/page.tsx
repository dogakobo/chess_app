import Image from "next/image";
import Board from './components/Board';
import Game from './components/Game';

export default function Home() {

  return (
    <div className="h-screen w-screen bg-yellow-100">
      <div className="h-screen w-[50vh] relative origin-right">
        <Game />
        <Board />
      </div>
    </div>
  )
}
