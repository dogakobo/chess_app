import Board from '../components/Board'
import Game from '../components/Game'
import '../global.css';
import { Suspense } from 'react'


export default function getStaticProps() {
  return (
    <div className="h-screen w-screen bg-yellow-100">
      <div className="h-screen w-[50vh] relative origin-right">
        <Suspense fallback={<></>}>
          <Game />
          <Board />
        </Suspense>
      </div>
    </div>
  )
}
