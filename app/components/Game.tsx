'use client'
import React, { useState, useEffect, useRef } from 'react'
import pieces from '../data/pieces_copy.json'
import { checkPossibleMoves, findCheck, verifyCheckMate } from '../services/movements';
import { socket } from "@/app/services/socket";
import { useSearchParams } from 'next/navigation'

function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export default function Game() {
  const searchParams = useSearchParams()
  const boardRef = useRef<any>()
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'].reverse()
  
  const [gameBoardData, updateGameBoardData] = useState<any>([])
  const [turn, changeTurn] = useState<number>(1)
  const [player, selectPlayer] = useState<number>(1)
  const [selectPiece, setSelectPiece] = useState<any>({})
  const [possibleMoves, setPossibleMoves] = useState<any>([])
  const [check, setCheck] = useState<any>(false)
  const [debugSquare, setSquare] = useState()
  const [countMovements, setCountMovements] = useState(0)
  const [promotionPiece, setPromotionPiece] = useState<any>(null)
  const [checkMate, setCheckMate] = useState<any>(false)
  const [match, setMatch] = useState('123abc')

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  useEffect(() => {
    const initialGameBoardData = numbers.map((number: string, numberIndex: number) => letters.map((letter: string, letterIndex: number) => {
      const pieceName: any = `${letter}${number}`
      const piecesObject: any = new Object(pieces)
      const piece: any = piecesObject[pieceName]
      const y = (boardRef.current.offsetHeight / 8) * (numberIndex)
      const x = (boardRef.current.offsetHeight / 8) * (letterIndex)
      const data: any = {
        position:  pieceName,
        coords: {
          x,
          y
        },
        y: numberIndex,
        x: letterIndex,
        canMove: false,
        piece
      }
      return data
    }))
    updateGameBoardData(initialGameBoardData)
  }, [])

  useEffect(() => {
    console.log(socket);
    if (socket.connected) {
      console.log('connected');
      onConnect();
    }

    function onConnect() {
      const search = searchParams.get('match')
      if (!search) {
        socket.emit('create_match', match)
        socket.on('match_created', (data: any) => {
        })
        selectPlayer(1)
      } else {
        socket.emit('start_match', search)
        setMatch(search)
        selectPlayer(2)
        const boardSelector: any = document.querySelector('#board')
        if (boardSelector?.style) {
          boardSelector.style.transform = 'rotate(180deg)'
        }
        
      }

      socket.on('match_started', (data: any) => {
        console.log('connected_match');
      })

      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport: any) => {
        setTransport(transport.name);
      });
      socket.on('move', (data: any) => {
        moveMatch(data.board.from, data.board.to)
      })

    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("on", (data: any) => {
        moveMatch(data.board.from, data.board.to)
      });
    }
  })

  const cancelMovement = () => {
    setSelectPiece({})
    setPossibleMoves([])
  }

  const selectSquare = (piece: any) => {
    if (!piece.piece?.player || (piece.piece?.player !== turn) || player !== turn) return
    setSelectPiece(piece)
    const movements = checkPossibleMoves(piece, Array.from(gameBoardData), check, false, countMovements)
    setPossibleMoves(movements)

  }

  const specialMove = (move: any, selectPiece: any) => {
    switch (move.specialMove) {
      case 'specialPawnEat':
        if (turn === 1) {
          console.log(gameBoardData);
          console.log(gameBoardData[2][2]);
          gameBoardData[move.y + 1][move.x].piece = undefined
        } else {
          gameBoardData[move.y - 1][move.x].piece = undefined
        }
        movePiece(move, selectPiece)
        break;
        case 'promotion':
          setPromotionPiece(move)
        break;
    }
  }

  const verifyGameChecks = async () => {
    const check = findCheck(gameBoardData, turn)
    if (check) {
      setCheck(check)
      if (await verifyCheckMate(gameBoardData, turn === 1 ? 2 : 1, countMovements))
        setCheckMate(true)
    }
  }

  const moveMatch = (move: any, selectPiece: any) => {
    if (!gameBoardData.length) return
    if (move.rightCastle && selectPiece.piece.type === 'king') {
      const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
      const to = gameBoardDataCopy[move.y][move.x - 1]
      moveExternalPiece(move.rightCastle, to)
    }
    if (move.leftCastle && move.piece.type === 'king' ) {
      const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
      const to = gameBoardDataCopy[move.y][move.x + 1]
      moveExternalPiece(move.leftCastle, to)
    }

    if (move.specialMove) {
      specialMove(move, selectPiece)
    } else {
      movePiece(move, selectPiece)
    }
  }

  const checkMovement = (piece: any) => {
    const move = possibleMoves.find((movement: any) => movement.position === piece.position)
    if (move) {
      socket.emit('movement', match, { from: piece, to: selectPiece })
      // moveMatch(piece, selectPiece)
    } else {
      cancelMovement()
      selectSquare(piece)
    }
  }

  const moveExternalPiece = (from: any, to: any) => {
    const AddedNewPiceToGameBoardData = gameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === to.position) {
        piece.piece = from.piece
        if (piece?.piece?.initialMove) {
          piece.piece.initialMove = true
        }
         
      }
      return piece
    }))
    const deletePieceToGameBoardData = AddedNewPiceToGameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === from.position) {
        square2.piece = undefined
      }
      return piece
    }))
    updateGameBoardData(deletePieceToGameBoardData)
  }

  const movePiece = (from: any, to: any) => {
    const AddedNewPiceToGameBoardData = gameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === from.position) {
        piece.piece = to.piece
        piece.piece.initialMove = true
        piece.piece.moveNumber = countMovements
      }
      return piece
    }))
    const deletePieceToGameBoardData = AddedNewPiceToGameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === to.position) {
        square2.piece = undefined
      }
      return piece
    }))
    cancelMovement()
    updateGameBoardData(deletePieceToGameBoardData)
    verifyGameChecks()
    changeTurn(turn === 1 ? 2 : 1)
    setCountMovements(countMovements + 1)
  }

  const crown = (typePice: string, image: string) => {
    gameBoardData[selectPiece.y][selectPiece.x].piece.type = typePice
    gameBoardData[selectPiece.y][selectPiece.x].piece.image = image
    gameBoardData[promotionPiece.y][promotionPiece.x].specialMove = null
    setPromotionPiece(null)
    // movePiece(promotionPiece)
  }

  return (
    <div ref={boardRef} className='w-max h-full max-w-screen max-h-screen relatvie z-20 bg-red-500'>
      {
        promotionPiece !== null &&
        <div className='absolute w-screen h-screen left-0 top-0 z-40 bg-gray-600/10'>
          <div className='grid place-content-center h-full '>
            <section className='flex bg-white border border-gray-400 rounded-lg'>
              <img onClick={() => crown('knight', `/pieces-images/knight-player${selectPiece.piece.player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/knight-player${selectPiece.piece.player}.png`} />
              <img onClick={() => crown('queen', `/pieces-images/queen-player${selectPiece.piece.player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/queen-player${selectPiece.piece.player}.png`} />
              <img onClick={() => crown('rook', `/pieces-images/rook-player${selectPiece.piece.player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/rook-player${selectPiece.piece.player}.png`} />
              <img onClick={() => crown('bishop', `/pieces-images/bishop-player${selectPiece.piece.player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/bishop-player${selectPiece.piece.player}.png`} />
            </section>
          </div>
        </div>
      }
      {
        checkMate &&
        <div className='absolute w-screen h-screen left-0 top-0 z-40 bg-gray-600/10'>
          <div className='grid place-content-center h-full '>
            <section className='flex bg-white border border-gray-400 rounded-lg'>
              <p className='px-8 py-4 text-xl '>Ganan
                {turn === 2 ? ' Blancas' : ' Negras'} 
              </p>
            </section>
          </div>
        </div>
      }
      {
        gameBoardData.map((value: any) => {
          return value.map((piece: any) => <div onMouseUp={() => !selectPiece?.piece?.player ? selectSquare(piece) : checkMovement(piece)} onMouseDown={() => !selectPiece?.piece?.player ? selectSquare(piece) : checkMovement(piece)} style={{ top: piece.coords.y + 'px', left: piece.coords.x + 'px', width: boardRef.current.offsetHeight / 8 + 'px', height: boardRef.current.offsetHeight / 8 + 'px', transform: `rotate(${player === 2 ? '180deg' : '0deg'})` }} className='absolute z-20 left-0 top-0' key={piece.position}>
          {
            piece?.piece?.image &&
            <img src={piece?.piece?.image} width={boardRef.current.offsetHeight / 8}  height={boardRef.current.offsetHeight / 8} className='z-20 absolute' style={{ transform: `rotate(${player === 2 ? '0deg' : '0deg'})`}} />
          }
          
          {
            possibleMoves.map((possibleMovePiece: any) => possibleMovePiece.position === piece.position &&
            <p className='text-3xl'>
              *
            </p>
          ) 
          }
          <p className='absolute opacity-40 top-0 left-0 z-50' onClick={() => setSquare(piece)}>
            {piece.position}
          </p>
        </div>)
        })
      }
      {/* {
        selectPiece.piece?.player &&
        <div className='absolute right-0'>
          Selected Piece:
          <p>
            {
              selectPiece?.piece.player
            }
          </p>
          <p>
            {
              selectPiece?.piece.type
            }
          </p>
          <p>
            {
              selectPiece?.piece.position
            }
          </p>
        </div>
      }
        <div className='absolute right-0 top-[400px]'>
          {
            JSON.stringify(check)
          }
        </div>
        <div className='absolute right-0 top-[200px]'>
          {
            JSON.stringify(player)
          }
        </div>
        <div className='absolute right-[500px] top-[500px] max-w-[300px]'>
          {
            JSON.stringify(debugSquare)
          }
        </div> */}
    </div>
  )
}
