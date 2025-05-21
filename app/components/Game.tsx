'use client'
import React, { useState, useEffect, useRef } from 'react'
import pieces from '../data/pieces_copy.json'
import moverules from '../data/moverules.json'
import { mapGemeData } from '../utils/utils';
import { checkPossibleMoves, findCheck, verifyCheckMate } from '../services/movements';

export default function Game() {
  const boardRef = useRef<any>()
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'].reverse()
  
  const [gameBoardData, updateGameBoardData] = useState<any>([])
  const [turn, changeTurn] = useState<number>(1)
  const [selectPiece, setSelectPiece] = useState<any>({})
  const [possibleMoves, setPossibleMoves] = useState<any>([])
  const [check, setCheck] = useState<any>(false)
  const [debugSquare, setSquare] = useState()
  const [countMovements, setCountMovements] = useState(0)
  const [promotionPiece, setPromotionPiece] = useState<any>(null)

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

  const cancelMovement = () => {
    setSelectPiece({})
    setPossibleMoves([])
  }

  const selectSquare = (piece: any) => {
    if (!piece.piece?.player || piece.piece?.player !== turn) return
    setSelectPiece(piece)
    const movements = checkPossibleMoves(piece, Array.from(gameBoardData), check, false, countMovements)
    setPossibleMoves(movements)

  }

  const specialMove = (move: any) => {
    console.log(move);
    switch (move.specialMove) {
      case 'specialPawnEat':
        if (turn === 1) {
          gameBoardData[move.y + 1][move.x].piece = undefined
        } else {
          gameBoardData[move.y - 1][move.x].piece = undefined
        }
        movePiece(move)
        break;
        case 'promotion':
          setPromotionPiece(move)
        break;
    }
  }

  const verifyGameChecks = async () => {
    const check = findCheck(gameBoardData, turn)
    console.log(check);
    if (check) {
      setCheck(check)
      if (await verifyCheckMate(gameBoardData, turn === 1 ? 2 : 1, countMovements))
        alert('checkmate')
    }
  }

  const checkMovement = (piece: any) => {
    const move = possibleMoves.find((movement: any) => movement.position === piece.position)
    console.log(move);
    if (move) {
      if (move.rightCastle && move.piece.type === 'king') {
        const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
        const to = gameBoardDataCopy[piece.y][piece.x - 1]
        moveExternalPiece(move.rightCastle, to)
      }
      if (move.leftCastle && move.piece.type === 'king' ) {
        const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
        const to = gameBoardDataCopy[piece.y][piece.x + 1]
        moveExternalPiece(move.leftCastle, to)
      }

      if (move.specialMove) {
        specialMove(move)
      } else {
        movePiece(piece)
      }
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
        piece.piece.initialMove = true
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

  const movePiece = (square: any) => {
    console.log(square);
    const AddedNewPiceToGameBoardData = gameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === square.position) {
        piece.piece = selectPiece.piece
        piece.piece.initialMove = true
        piece.piece.moveNumber = countMovements
      }
      return piece
    }))
    const deletePieceToGameBoardData = AddedNewPiceToGameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === selectPiece.position) {
        square2.piece = undefined
      }
      return piece
    }))
    cancelMovement()
    updateGameBoardData(deletePieceToGameBoardData)
    // verifyGameChecks()
    changeTurn(turn === 1 ? 2 : 1)
    setCountMovements(countMovements + 1)
  }

  const crown = (typePice: string, image: string) => {
    gameBoardData[selectPiece.y][selectPiece.x].piece.type = typePice
    gameBoardData[selectPiece.y][selectPiece.x].piece.image = image
    gameBoardData[promotionPiece.y][promotionPiece.x].specialMove = null
    setPromotionPiece(null)
    movePiece(promotionPiece)
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
        gameBoardData.map((value: any) => {
          return value.map((piece: any) => <div onMouseUp={() => !selectPiece?.piece?.player ? selectSquare(piece) : checkMovement(piece)} onMouseDown={() => !selectPiece?.piece?.player ? selectSquare(piece) : checkMovement(piece)} style={{ top: piece.coords.y + 'px', left: piece.coords.x + 'px', width: boardRef.current.offsetHeight / 8 + 'px', height: boardRef.current.offsetHeight / 8 + 'px' }} className='absolute z-20 left-0 top-0' key={piece.position}>
          {
            piece?.piece?.image &&
            <img src={piece?.piece?.image} width={boardRef.current.offsetHeight / 8}  height={boardRef.current.offsetHeight / 8} className='z-20 absolute' />
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
      {
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
        <div className='absolute right-[500px] top-[500px] max-w-[300px]'>
          {
            JSON.stringify(debugSquare)
          }
        </div>
    </div>
  )
}
