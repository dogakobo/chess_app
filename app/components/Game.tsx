'use client'
import React, { useState, useEffect, useRef } from 'react'
import pieces from '../data/pieces_copy.json'
import moverules from '../data/moverules.json'
import { mapGemeData } from '../utils/utils';
import { checkPossibleMoves, verifyChecks } from '../services/movements';

export default function Game() {
  const boardRef = useRef<any>()
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8'].reverse()
  
  const [gameBoardData, updateGameBoardData] = useState<any>([])
  const [turn, changeTurn] = useState<number>(1)
  const [selectPiece, setSelectPiece] = useState<any>({})
  const [possibleMoves, setPossibleMoves] = useState<any>([])
  const [check, setCheck] = useState<any>({})

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
    setPossibleMoves(checkPossibleMoves(piece, Array.from(gameBoardData), check))

  }

  const verifyGameChecks = (turn: any) => {
    // const check = verifyChecks(gameBoardData, turn)
    // console.log(check)
    // if (check) {
    //   setCheck(check)
    // }
  }

  const checkMovement = (piece: any) => {
    const move = possibleMoves.find((movement: any) => movement.position === piece.position)
    if (move) {
      movePiece(piece)
      if (move.rightRook) {
        const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
        console.log(move.rightRook);
        selectSquare(move.rightRook)
        // const from = gameBoardDataCopy[piece.y][piece.x + 1]
        const to = gameBoardDataCopy[piece.y][piece.x - 1]
        // console.log(from);
        movePiece(to)
        // console.log(piece);
        // const rook = gameBoardDataCopy[piece.y][piece.x + 1]
        // console.log(gameBoardDataCopy[piece.y][piece.x - 1]);
        // console.log(rook);
        // gameBoardDataCopy[piece.y][piece.x + 1].piece = undefined
        // gameBoardDataCopy[piece.y][piece.x - 1].piece = rook.piece
        // updateGameBoardData(gameBoardDataCopy)
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
        piece.piece = selectPiece.piece
        // piece.piece.initialMove = true
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
    setCheck({})
  }

  const movePiece = (square: any) => {
    const AddedNewPiceToGameBoardData = gameBoardData.map((value: any) => value.map((square2: any) => {
      let piece = square2
      if (square2.position === square.position) {
        piece.piece = selectPiece.piece
        if (piece.piece?.initialMove)
        piece.piece.initialMove = true
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
    verifyGameChecks(turn)
    changeTurn(turn === 1 ? 2 : 1)
    setCheck({})
  }

  return (
    <div ref={boardRef} className='w-max h-full max-w-screen max-h-screen relatvie z-20 bg-red-500'>
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
          <p className='absolute opacity-40 top-0 left-0'>
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
    </div>
  )
}
