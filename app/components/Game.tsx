/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useState, useEffect, useRef } from 'react'
import pieces from '../data/pieces_copy.json'
import { checkPossibleMoves, findCheck, verifyCheckMate } from '../services/movements'
import { socket } from "@/app/services/socket"
import { useSearchParams } from 'next/navigation'
import { MdTripOrigin, MdContentCopy } from "react-icons/md"
import { Poppins } from 'next/font/google'
import { usePathname, useRouter } from 'next/navigation'
// import { Suspense } from 'react'

const PoppinsFont = Poppins({ weight: ['400', '500'], subsets: ['latin'] })
const NunitoFont = Poppins({ weight: ['400', '500'], subsets: ['latin'] })

function makeid(length: number) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const selectedPlayer = Math.floor(Math.random() * 2) + 1

export default function Game() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const boardRef = useRef<any>()
  const chatBoxRef = useRef<any>()
  const movementsBoxRef = useRef<any>()
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'].reverse()
  const pathname = usePathname()
  
  const [height, setSqHeight] = useState(0)
  const [width, setSqWdith] = useState(0)
  const [fullWidth, setFullWidth] = useState(0)
  const [gameBoardData, updateGameBoardData] = useState<any>([])
  const [turn, changeTurn] = useState<number>(1)
  const [player, selectPlayer] = useState<number>(3)
  const [selectPiece, setSelectPiece] = useState<any>({})
  const [possibleMoves, setPossibleMoves] = useState<any>([])
  const [check, setCheck] = useState<any>(false)
  const [checkPlayer, setCheckPlayer] = useState<any>(0)
  const [debugSquare, setSquare] = useState()
  const [countMovements, setCountMovements] = useState(0)
  const [promotionPiece, setPromotionPiece] = useState<any>(null)
  const [checkMate, setCheckMate] = useState<any>(false)
  const [match, setMatch] = useState(makeid(6))
  const [matchStarted, setMatchStarted] = useState(false)
  const [chatText, setChatText] = useState('')
  const [chatHistory, setChathistory] = useState([{}])
  const [movesHistory, setMoveshistory] = useState([{}])

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const sendMessage = (ev: any) => {
      ev.preventDefault()
      if (!chatText) return
      socket.emit('message', chatText, match, player)
      setChatText('')
  }

  const initialGameStart = () => {
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
    return initialGameBoardData
    
  }

  useEffect(() => {
    updateGameBoardData(initialGameStart())
  }, [])

  useEffect(() => {
    setSqHeight(boardRef.current.offsetHeight / 8)
    setSqWdith(boardRef.current.offsetWidth / 8)
    setFullWidth(window.innerWidth)
    window.addEventListener('resize', () => {
      setSqHeight(boardRef.current.offsetHeight / 8)
      setSqWdith(boardRef.current.offsetWidth / 8)
      setFullWidth(window.innerWidth)
    })
  })

  useEffect(() => {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
 
      socket.io.engine.on("upgrade", (transport: any) => {
        setTransport(transport.name);
      });
      socket.on('move', (data: any) => {
        if (data.board.player !== player) {
          verifyGameChecks(data.board.player, data.board.gameBoardData)
          updateGameBoardData(data.board.gameBoardData)
          changeTurn(player)
        }
        setMoveshistory([...movesHistory, { from: data.board.from, to: data.board.to, turn: countMovements }])
        setTimeout(() => {
          if (movementsBoxRef?.current?.scrollTop)
            movementsBoxRef.current.scrollTop = movementsBoxRef?.current?.scrollHeight
        }, 1)
        if (data.board.player === player) {
          socket.emit('move_history', match, { from: data.board.from, to: data.board.to, turn: countMovements })
        }
        setCountMovements(countMovements + 1)
      })
      socket.on('move_promotion', (data: any) => {
        if (data.board.player !== player) {
          gameBoardData[data.board.from.y][data.board.from.x].specialMove = null
          moveMatch(data.board.from, data.board.to)
        }
        socket.emit('move_history', match, { from: data.board.from, to: data.board.to, turn: countMovements })
        setMoveshistory([...movesHistory, { from: data.board.from, to: data.board.to, turn: countMovements }])
        setTimeout(() => {
          if (movementsBoxRef?.current?.scrollTop)
            movementsBoxRef.current.scrollTop = movementsBoxRef?.current?.scrollHeight
        }, 1)
        setCountMovements(countMovements + 1)
      })
      
  })

  useEffect(() => {
    socket.on('message', (data: any) => {
        setChathistory([...chatHistory, { player: data.player, message: data.message }])
        setTimeout(() => {
          if (chatBoxRef?.current?.scrollTop)
            chatBoxRef.current.scrollTop = chatBoxRef?.current?.scrollHeight
        }, 1)
    })
    socket.on('match_started', (data: any) => {
      updateGameBoardData(initialGameStart())
      setMatchStarted(true)
    })
    socket.on('match_reanude', (data: any) => {
      if (matchStarted) return
      const getPlayer = Number(localStorage.getItem(data?.room))
      changeTurn(data.turn)
      setChathistory(data.messages)
      updateGameBoardData(data.board)
      setCheck(Boolean(data.check.isCheck))
      setCheckPlayer(data.check.by ?? 0)
      setCheckMate(Boolean(data.finished.winBy))
      selectPlayer(getPlayer)
      setMoveshistory(data.movesRecord)
      setMatchStarted(true)
        if (getPlayer === 2) {
          boardRef.current.style.transform = 'rotate(180deg)'
        }
    })
  }, [chatHistory, player])

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }
    
    
    function onConnect() {
      const search = searchParams.get('match')
      if (!search) {
        const newPath = `/?match=${match}`
        router.replace(newPath)
        // window.history.replaceState(null, '', newPath)
        socket.emit('create_match', match)
        socket.on('match_created', (data: any) => {
          localStorage.setItem(data?.room, data.player.toString())
          selectPlayer(data.player)
          if (data.player === 2)
          boardRef.current.style.transform = 'rotate(180deg)'
        })
      } else {
        const getPlayer = Number(localStorage.getItem(search)) || selectedPlayer
        socket.emit('start_match', search, initialGameStart(), selectedPlayer === 1 ? 2 : 1)
        selectPlayer(getPlayer)
        localStorage.setItem(search, getPlayer.toString())
        if (getPlayer === 2)
        boardRef.current.style.transform = 'rotate(180deg)'
        setMatch(search)

      }
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
  }, [])

  const cancelMovement = () => {
    setSelectPiece({})
    setPossibleMoves([])
  }

  const selectSquare = (piece: any) => {
    if (!piece.piece?.player || (piece.piece?.player !== turn) || (player !== turn && matchStarted)) return
    setSelectPiece(piece)
    const movements = checkPossibleMoves(piece, Array.from(gameBoardData), check, false, countMovements)
    setPossibleMoves(movements)
  }

  const specialMove = (move: any, selectPiece: any) => {
    switch (move.specialMove) {
      case 'specialPawnEat':
        if (player === 1) {
          gameBoardData[move.y + 1][move.x].piece = undefined
        } else {
          gameBoardData[move.y - 1][move.x].piece = undefined
        }
        updateGameBoardData(gameBoardData)
        movePiece(move, selectPiece)
        break;
        case 'promotion':
          setPromotionPiece(move)
        break;
    }
  }

  const verifyGameChecks = async (turn2: number, gameData: any) => {
    const check = findCheck(gameData, turn2)
    setCheck(Boolean(check))
    if (check) {
      socket.emit('check', match, { isCheck: check, by: turn2 === 1 ? 2 : 1 })
      setCheckPlayer(turn2 === 1 ? 2 : 1)
      if (await verifyCheckMate(gameData, turn2 === 1 ? 2 : 1, countMovements)) {
        socket.emit('checkmate', match, { winBy: turn2 })
        setCheckMate(true)
      }
    } else {
      socket.emit('check', match, { isCheck: false, by: null })
      setCheckPlayer(0)
    }
  }
  
  const moveMatch = (move: any, selectPiece: any) => {
    if (!gameBoardData.length) return
    if (move.rightCastle && selectPiece.piece.type === 'king') {
      const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
      const to = gameBoardDataCopy[move.y][move.x - 1]
      moveExternalPiece(move.rightCastle, to)
    }
    if (move.leftCastle && selectPiece.piece.type === 'king' ) {
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
      if (piece.specialMove) {
        specialMove(move, selectPiece)
      } else {
        moveMatch(move, selectPiece)
      }
      // cancelMovement()
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
    socket.emit('movement', match, { from: from, to: to, gameBoardData: deletePieceToGameBoardData, player, countMovements }, turn === 1 ? 2 : 1)
    cancelMovement()
    updateGameBoardData(deletePieceToGameBoardData)
    verifyGameChecks(player, deletePieceToGameBoardData)
    changeTurn(turn === 1 ? 2 : 1)
  }

  const crown = (typePice: string, image: string) => {
    gameBoardData[selectPiece.y][selectPiece.x].piece.type = typePice
    gameBoardData[selectPiece.y][selectPiece.x].piece.image = image
    gameBoardData[promotionPiece.y][promotionPiece.x].specialMove = null
    updateGameBoardData(gameBoardData)
    setPromotionPiece(null)
    // socket.emit('movement_promotion', match, { from: promotionPiece, to: gameBoardData[selectPiece.y][selectPiece.x], gameBoardData: gameBoardData, player, countMovements }, turn === 1 ? 2 : 1)
    movePiece(promotionPiece, selectPiece)
  }

  return (
    <div className='flex absolute w-screen'>

        {
          (promotionPiece !== null) &&
          <div style={{ width: height * 8 }} className='absolute h-screen top-0 z-40 bg-gray-600/10'>
            <div className='grid place-content-center h-full '>
              <section className='flex bg-white border border-gray-400 rounded-lg'>
                <img onClick={() => crown('knight', `/pieces-images/knight-player${player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/knight-player${player}.png`} />
                <img onClick={() => crown('queen', `/pieces-images/queen-player${player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/queen-player${player}.png`} />
                <img onClick={() => crown('rook', `/pieces-images/rook-player${player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/rook-player${player}.png`} />
                <img onClick={() => crown('bishop', `/pieces-images/bishop-player${player}.png`)} className='hover:bg-gray-300 rounded-lg cursor-pointer' width={boardRef.current?.offsetHeight / 8}  height={boardRef.current?.offsetHeight / 8} src={`/pieces-images/bishop-player${player}.png`} />
              </section>
            </div>
          </div>
        }
        {
          checkMate &&
          <div style={{ width: height * 8 }} className='absolute h-screen top-0 z-40 bg-stone-800/30'>
            <div className='grid place-content-center h-full '>
              <section className='flex bg-white border border-gray-400 rounded-lg'>
                <p className='px-8 py-4 text-xl '>
                  {turn === 2 ? 'White ' : 'Black '} 
                  Wins
                </p>
              </section>
            </div>
          </div>
        }
      <div ref={boardRef} style={{ width: height * 8 }} className='h-screen max-h-screen relative z-20 bg-transparent origin-center'>
        <div className='grid grid-cols-8 relative z-10'>
          {
            gameBoardData.map((value: any, index1: number) => {
              return value.map((piece: any, index2: number) => {
                const colorText = (index2 % 2 - ( index1 % 2 === 0 ? 1 : 0 ) === 0) ? 'rgb(235, 236, 208)' : ' rgb(115,149,82)'
                const checkClassname = (piece?.piece?.type === 'king' && check && piece?.piece?.player === checkPlayer)
                return <div
                  onMouseUp={() => !selectPiece?.piece?.player ? selectSquare(piece) : checkMovement(piece)}
                  onMouseDown={() => !selectPiece?.piece?.player ? selectSquare(piece) : checkMovement(piece)}
                  style={{
                    // top: piece.coords.y + 'px',
                    // left: piece.coords.x + 'px',
                    width: boardRef.current.offsetHeight / 8 + 'px',
                    height: boardRef.current.offsetHeight / 8 + 'px',
                    background: checkClassname ? 'oklch(64.5% 0.246 16.439': '',
                    transform: `rotate(${player === 2 ? '180deg' : '0deg'})`
                  }}
                  className='' key={piece.position}>
                  {
                    piece?.piece?.image && <span>
                      <img src={piece?.piece?.image} width={width}  height={height} className={`z-10 absolute`} style={{ transform: `rotate(${player === 2 ? '0deg' : '0deg'})`}} />
                    </span>
                  }
                  
                  {
                    possibleMoves.map((possibleMovePiece: any, index: number) => possibleMovePiece.position === piece.position &&
                    <div className='w-full h-full grid place-content-center relative z-20' key={index}>
                      <p className='text-[60px]'>
                        <MdTripOrigin style={{ color: colorText}}/>
                      </p>
                    </div>
                  ) 
                  }
                  <p style={{ color: colorText}} className='absolute top-0 left-0 z-50 pl-1' onClick={() => setSquare(piece)}>.
                    {piece.position}
                  </p>
                </div>
              }
            )
            })
          }
        </div>
      </div>
      <div style={{ width: (fullWidth - (height * 8)) }} className='h-screen max-h-screen relative z-20 p-4 bg-stone-800'>
        <div className='flex justify-between w-full'>
          <div>
            <p style={NunitoFont.style} className='text-sm py-1 px-2 bg-stone-500 rounded-t-lg w-max text-stone-100'>
              Share this link to find oponent:
            </p>
            <div className='bg-stone-600 text-stone-50 p-4 rounded-b-lg rounded-tr-lg flex justify-between space-x-8 cursor-pointer w-max'>
              <p style={PoppinsFont.style} className=''>
                {process.env.NEXT_PUBLIC_URL}/?match={match}
              </p>
              <MdContentCopy className='self-center text-2xl' />
            </div>
          </div>
          
        </div>
        {
          !matchStarted ? <div style={{ height:  (height * 8) - ((fullWidth - (height * 8)) / 2) - 150  }} className='px-4 text-stone-400 w-full grid place-content-center'>
            <div className='h-max w-max grid justify-items-center'>
              <span className='lg:w-[100px] lg:h-[100px] w-[50px] h-[50px] bg-transparent border-[10px] rounded-full border-stone-700 border-b-stone-500 inline-block animate-spin'>
              </span>
              <p style={NunitoFont.style} className='pt-4'> 
                Waiting for oponent . . .
              </p>
            </div>
          </div>
          : 
          <div className='mt-3 relative flex justify-between w-full'>
            <div className='w-max'>
              <div style={PoppinsFont.style} className='flex space-x-6 bg-stone-600 px-5 py-2 rounded-lg'>
                <div className='self-center text-stone-100'>You play with </div>
                {
                  player === 1
                  ? <div className='w-10 h-10 bg-stone-200 rounded-sm shadow-lg' />
                  : <div className='w-10 h-10 bg-stone-700 rounded-sm shadow-lg' />
                }
                
              </div>
              {
                turn === player && <p style={PoppinsFont.style} className='text-stone-100 bg-stone-500 mt-2 px-2 py-0.5 rounded-md'>You turn!</p>
              }
            </div>
            <div style={{ height:  (height * 8) - ((fullWidth - (height * 8)) / 2) - 150, width: fullWidth / 3  }}>
                <div className='bg-stone-600 p-4 rounded-md h-full flex flex-col justify-start'>
                  <div style={PoppinsFont.style} ref={movementsBoxRef} id='chat-box' className='pb-4 overflow-y-scroll grid grid-cols-2'>
                    {
                      movesHistory.map((movement: any, index: number) => {
                        const classnames = movement.player === 1 ? 'text-stone-800 bg-stone-100' : 'bg-stone-800 text-stone-100'
                        if (movement?.from)
                        return <div className='text-stone-200 flex justify-start mb-2 w-max' key={index}>
                          <p className='pr-4 self-center text-xl font-medium'>{movement.turn + 1}.- </p>
                          <div className='flex space-x-1 bg-stone-500 px-4 rounded-md shadow-sm w-[90px]'>
                            <img className='self-center -ml-2' width={40} src={movement.from.piece.image} alt="" />
                            <p style={PoppinsFont.style} className='self-center text-lg'>{movement.from.position}</p>
                          </div>
                        </div>
                        }
                      )
                    }
                  </div>
                </div>
              </div>
          </div>
        }
        <form onSubmit={(ev: any) => sendMessage(ev)} style={{ height: (fullWidth - (height * 8)) / 2, ...PoppinsFont.style }} className='w-full left-0 bottom-4 absolute'>
          <div className='bg-stone-600 mx-4 p-4 rounded-md h-full flex flex-col justify-end'>
            <div ref={chatBoxRef} id='chat-box' className='pb-4 overflow-y-scroll'>
              {
                chatHistory.map((message: any, index: number) => {
                  const classnames = message.player === 1 ? 'text-stone-800 bg-stone-100' : 'bg-stone-800 text-stone-100'
                  return <div key={index}>
                    {
                      message.message &&
                      <div className='flex space-x-1 mb-2'>
                        <p className={'font-medium w-max self-center px-2 py-1 rounded-md text-sm ' + classnames}>Player {message.player}</p>
                        <p className='self-center text-lg text-stone-100'>: {message.message}</p>
                      </div>
                    }
                  </div>
                  }
                )
              }

            </div>
            <div className='flex w-full bg-stone-700 rounded-lg'>
              <input onChange={(ev: any) => setChatText(ev.target.value)} value={chatText} type="text" className='bg-stone-700 focus:outline-none text-stone-50 px-4 py-2 rounded-lg w-full placeholder:text-stone-400' placeholder='Chat here' />
              <button type='submit' className='bg-stone-100 text-stone-800 rounded px-3 py-1 w-[200px] hover:bg-stone-800 hover:text-stone-200 transition-colors duration-[100ms] ease-in-out'>
                Send message
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
