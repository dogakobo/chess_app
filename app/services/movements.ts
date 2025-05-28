import { mapGemeData } from '../utils/utils';
import moverules from '../data/moverules.json';

export const findCheck = (gameBoardData: any, player: number) => {
  let check
  mapGemeData(gameBoardData).filter((value: any) => value?.value?.piece && value?.value?.piece?.player == player).forEach((value: any) => {
    const place = checkPossibleMoves(value.value, gameBoardData, null, true, 0)
    place.forEach((place: any) => {
      if (place.piece?.type === 'king') {
        if (place.piece?.player != player) {
          check = true
        }
      }
    })
  })


  return check
}

export const verifyCheckMate = (gameBoardData: any, player: number, currentMovement: number) => {
  let moves: any = []
  let places: any = []
  const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
  mapGemeData(gameBoardData).filter((value: any) => value?.value?.piece && value?.value?.piece?.player === player).forEach((value: any) => {
    moves.push({
      moves: [...checkPossibleMoves(value.value, gameBoardData, null, false, 0)],
      originalPiece: value
    })
  })
  moves.forEach((value: any, index: number) => {
    value.moves.forEach((m: any) => {
      const asd = isThereCheck(gameBoardDataCopy, m, value.originalPiece.value, currentMovement)
        if (!asd) {
          places.push(value.moves[0])
        }
    })
  })
  return places.length === 0
}

export const validAllPossibleMoves = (gameBoardData: any, value: any, player: number, currentMovement: number) => {
  let places: any = []
  const new2 = gameBoardData
  const pieceCopy = value.originalPiece.piece
  const valuePieceCopy = value?.piece
  new2[value.originalPiece.y][value.originalPiece.x].piece = undefined
  new2[value.y][value.x].piece = valuePieceCopy

  mapGemeData(new2).filter((value: any) => value?.value?.piece && value?.value?.piece?.player != player).forEach((value: any) => {
    places.push(...checkPossibleMoves(value.value, new2, null, true, currentMovement))
  })
  let check
  const uniqueArray = Array.from(new Set(places.map((a: any) => a.position)))
  .map(id => {
    return places.find((a: any) => a.position === id)
  })
  uniqueArray.forEach((place: any) => {
    if (place.piece?.type === 'king') {
      if (place.piece?.player !== player) {
        check = place
      }
    }
  })
  new2[value.originalPiece.y][value.originalPiece.x].piece = pieceCopy
  new2[value.y][value.x].piece = valuePieceCopy
  return check
}

export const isThereCheck = (gameBoardData: any, value: any, originalPiece: any, currentMovement: number) => {
  let places: any = []
  const new2 = gameBoardData
  const pieceCopy = originalPiece.piece
  const valuePieceCopy = value?.piece
  new2[originalPiece.y][originalPiece.x].piece = undefined
  new2[value.y][value.x].piece = pieceCopy

  mapGemeData(new2).filter((value: any) => value?.value?.piece && value?.value?.piece?.player != pieceCopy.player).forEach((value: any) => {
    places.push(...checkPossibleMoves(value.value, new2, null, true, currentMovement))
  })
  let check
  const uniqueArray = Array.from(new Set(places.map((a: any) => a.position)))
  .map(id => {
    return places.find((a: any) => a.position === id)
  })
  uniqueArray.forEach((place: any) => {
    if (place.piece?.type === 'king') {
      if (place.piece?.player === pieceCopy.player) {
        check = place
      }
    }
  })
  new2[originalPiece.y][originalPiece.x].piece = pieceCopy
  new2[value.y][value.x].piece = valuePieceCopy
  return check
}

export const verifyChecks2 = (gameBoardData: any, moves: any, piece: any, currentMovement: number) => {
  let places: any = []

  const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
  moves.forEach((value: any, index: number) => {
    const asd = isThereCheck(gameBoardDataCopy, value, piece, currentMovement)
    if (!asd) {

      places.push(value)
    }

  })
  return places
}

export const checkPossibleMoves = (piece: any, gameBoardData: any, checks: any = null, secondary: boolean = false, currentMovement: number) => {
  let moves: any = []
  if (piece.piece.type === 'knight'){
    moves = knightRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'pawn'){
    moves =  pawnRules(piece, gameBoardData, currentMovement)
  }
  if (piece.piece.type === 'rook'){
    moves =  rookRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'bishop'){
    moves =  bishopRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'queen'){
    moves = [...rookRules(piece, gameBoardData), ...bishopRules(piece, gameBoardData)]
  }
  if (piece.piece.type === 'king'){
    moves =  kingRules(piece, gameBoardData, checks)
  }
  if (!secondary) {
    moves = verifyChecks2(gameBoardData, moves, piece, currentMovement)
  }
  return moves
}

const kingRules = (piece: any, gameBoardData: any, checks: any) => {
  const movementRules: any = new Object(moverules)
  const ordinaryMovments = movementRules[piece.piece.type].ordinaryMove
  const initialMovments = movementRules[piece.piece.type].initialMove
  const possibleMovements: any = []
  const sum = (pieceIndex: number, numberToSum: number) => {
    if (numberToSum < 0) {
      return pieceIndex + numberToSum
    }
    if (numberToSum > 0) {
      return pieceIndex + numberToSum
    }
    return pieceIndex
  }
  ordinaryMovments.map((movesValue: any) => {
    const valueObject: any = new Object(movesValue)
    let yy = sum(piece.y, valueObject.y ?? 0)
    let xx = sum(piece.x, valueObject.x ?? 0)
    try {
      const pieceToMove = gameBoardData[yy][xx]
      if (pieceToMove?.position) {
        if (pieceToMove?.piece?.player != piece?.piece.player) {
          // pieceToMove.originalPiece = piece
          pieceToMove.initialMove = true
          possibleMovements.push(pieceToMove)
        }
      
      }
    } catch (error) {
      
    }
  })
  if (!piece.initialMove)
  initialMovments.map((movesValue: any) => {
    const valueObject: any = new Object(movesValue)
    let yy = sum(piece.y, valueObject.y ?? 0)
    let xx = sum(piece.x, valueObject.x ?? 0)
    try {
      const pieceToMove = gameBoardData[yy][xx]
      if (pieceToMove?.position) {
        if (pieceToMove?.piece?.player != piece?.piece.player) {
          if (xx == 6) {
            if (gameBoardData[piece.y][piece.x + 1].piece) return 
            const rightCastle = gameBoardData[piece.y][piece.x + 3]
            if (rightCastle?.piece.initialMove) return
            pieceToMove.rightCastle = rightCastle
            possibleMovements.push(pieceToMove)
          }
          if (xx == 2) {
            if (gameBoardData[piece.y][piece.x - 1].piece) return 
            const leftCastle = gameBoardData[piece.y][piece.x - 4]
            if (leftCastle?.piece.initialMove) return
            pieceToMove.leftCastle = leftCastle
            possibleMovements.push(pieceToMove)
          }
          
        }
      
      }
    } catch (error) {
      
    }
  }) 
  return possibleMovements
}

const bishopRules = (piece: any, gameBoardData: any) => {
  const possibleMovements: any = []
    for (let y = 1; y <= 8; y++) {
      let yy = piece.y - y
      let xx = piece.x - y
      try {
        const pieceToMove = gameBoardData[yy][xx]
        if (pieceToMove?.piece) {
          // pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          // pieceToMove.originalPiece = piece
          possibleMovements.push(pieceToMove)
        }
      } catch (error) {
        
      }
    }
    for (let y = 1; y <= 8; y++) {
      let yy = piece.y - y
      let xx = piece.x + y
      try {
        const pieceToMove = gameBoardData[yy][xx]
        if (pieceToMove?.piece) {
          // pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          // pieceToMove.originalPiece = piece
          possibleMovements.push(pieceToMove)
        }
      } catch (error) {
        
      }
    }
    for (let y = 1; y <= 8; y++) {
      let yy = piece.y + y
      let xx = piece.x + y
      try {
        const pieceToMove = gameBoardData[yy][xx]
        if (pieceToMove?.piece) {
          // pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          // pieceToMove.originalPiece = piece
          possibleMovements.push(pieceToMove)
        }
      } catch (error) {
        
      }
    }
    for (let y = 1; y <= 8; y++) {
      let yy = piece.y + y
      let xx = piece.x - y
      try {
        const pieceToMove = gameBoardData[yy][xx]
        if (pieceToMove?.piece) {
          // pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          // pieceToMove.originalPiece = piece
          possibleMovements.push(pieceToMove)
        }
      } catch (error) {
        
      }
    }
  return possibleMovements
}

const rookRules = (piece: any, gameBoardData: any) => {
  const movementRules: any = new Object(moverules)
  const possibleMovements: any = []
  mapGemeData(gameBoardData).map((value: any) => {
    if (piece.position === value.value.position) {
      const ordinaryMovments = movementRules['rook'].ordinaryMove
      ordinaryMovments.map((movesValue: any) => {
        const valueObject: any = new Object(movesValue)
        const limitY = valueObject.y ?? 0
        const limitX = valueObject.x ?? 0
        for (let x = 0; x <= limitY; x++ ) {
          for (let y = 0; y <= limitX; y++) {
            let yy = value.y - y
            let xx = value.x - x
            try {
              const pieceToMove = gameBoardData[yy][xx]
              if (pieceToMove?.piece && (piece.position !== pieceToMove.position)) {
                if (pieceToMove?.piece.player != piece.piece.player) {
                  // pieceToMove.originalPiece = piece
                  possibleMovements.push(pieceToMove)
                }
                return
              }
              if (pieceToMove?.position && !pieceToMove?.piece) {
                // pieceToMove.originalPiece = piece
                possibleMovements.push(pieceToMove)
              }
            } catch (error) {
              
            }
          }
        }
      })
      ordinaryMovments.map((movesValue: any) => {
        const valueObject: any = new Object(movesValue)
        const limitY = valueObject.y ?? 0
        const limitX = valueObject.x ?? 0
        for (let x = 0; x <= limitY; x++ ) {
          for (let y = 0; y <= limitX; y++) {
            let yy = value.y + y
            let xx = value.x + x
            try {
              const pieceToMove = gameBoardData[yy][xx]
              if (pieceToMove?.piece && (piece.position !== pieceToMove.position)) {
                if (pieceToMove?.piece.player != piece.piece.player) {
                  // pieceToMove.originalPiece = piece
                  possibleMovements.push(pieceToMove)
                }
                return
              }
              if (pieceToMove?.position && pieceToMove?.piece?.player != piece.piece.player) {
                // pieceToMove.originalPiece = piece
                possibleMovements.push(pieceToMove)
              }
            } catch (error) {
              
            }
          }
        }
      })
    }
  })
  return possibleMovements
}

const pawnRules = (piece: any, gameBoardData: any, currentMovement: number) => {
  const movementRules: any = new Object(moverules)
  const possibleMovements: any = []
  mapGemeData(gameBoardData).map((value: any) => {
    if (piece.position === value.value.position) {
      const ordinaryMovments = movementRules[piece.piece.type].ordinaryMove
      const eatingMove = movementRules[piece.piece.type].eatingMove
      const initialMovments = movementRules[piece.piece.type].initialMove
      ordinaryMovments.map((movesValue: any) => {
        const valueObject: any = new Object(movesValue)
        let y = value.y - (valueObject.y)
        let x = value.x - (valueObject.x)
        if (piece.piece.player == 2) {
          x = value.x + (valueObject.x)
          y = value.y + (valueObject.y)
        }
        try {
          const pieceToMove = gameBoardData[y][x]
          if (pieceToMove?.position && !pieceToMove?.piece) {
            // pieceToMove.originalPiece = piece
            pieceToMove.specialPawnMove = false
            possibleMovements.push(pieceToMove)
          }
        } catch (error) {
          
        }
      })
      eatingMove.map((movesValue: any) => {
        const valueObject: any = new Object(movesValue)
        let y = value.y - (valueObject.y)
        let x = value.x - (valueObject.x)
        if (piece.piece.player == 2) {
          x = value.x + (valueObject.x)
          y = value.y + (valueObject.y)
        }
        if (gameBoardData[y][x]?.piece?.player && (gameBoardData[y][x]?.piece?.player != piece.piece.player)) {
          try {
            const pieceToMove = gameBoardData[y][x]
            // pieceToMove.originalPiece = piece
            pieceToMove.specialPawnMove = false
            possibleMovements.push(pieceToMove)
          } catch (error) {
            
          }
        }
        const rightPiece = gameBoardData[value.y][value.x + 1]
        const leftPiece = gameBoardData[value.y][value.x - 1]
        if (rightPiece?.specialPawnMove && rightPiece?.piece?.moveNumber === currentMovement - 1 && rightPiece?.piece?.type === 'pawn') {
          let pieceToMove = gameBoardData[value.y - 1][value.x + 1]
          if (piece.piece.player == 2) {
            pieceToMove = gameBoardData[value.y + 1][value.x + 1]
          }
          pieceToMove.specialMove = 'specialPawnEat'
          possibleMovements.push(pieceToMove)
        }
        if (leftPiece?.specialPawnMove && leftPiece?.piece?.moveNumber === currentMovement - 1 && leftPiece?.piece?.type === 'pawn') {
          let pieceToMove = gameBoardData[value.y - 1][value.x - 1]
          if (piece.piece.player == 2) {
            pieceToMove = gameBoardData[value.y + 1][value.x - 1]
          }
          pieceToMove.specialMove = 'specialPawnEat'
          possibleMovements.push(pieceToMove)
        }
      })
      if (value.value.piece.player == 1) {
        if (gameBoardData[value.y - 1][value.x].piece){
          return
        }
      } else {
        if (gameBoardData[value.y + 1][value.x].piece){
          return
        }
      }
      !piece.piece.initialMove &&
      initialMovments.map((movesValue: any, index: number) => {
        try {
          const valueObject: any = new Object(movesValue)
          let y = value.y - (valueObject.y)
          let x = value.x - (valueObject.x)
          if (piece.piece.player == 2) {
            x = value.x + (valueObject.x)
            y = value.y + (valueObject.y)
          }
          const pieceToMove = gameBoardData[y][x]
          if (pieceToMove?.position && !pieceToMove?.piece) {
            // pieceToMove.originalPiece = piece
            pieceToMove.specialPawnMove = true
            possibleMovements.push(pieceToMove)
          }
        } catch (error) {
          
        }
        
      })
    }
  })
  possibleMovements.map((movement: any, index: number) => {
    if (piece.piece.player ===  1 && movement.y === 0) {
      possibleMovements[index].specialMove = 'promotion'
    }
    if (piece.piece.player ===  2 && movement.y === 7) {
      possibleMovements[index].specialMove = 'promotion'
    }
  }) 
  return possibleMovements
}

const knightRules = (piece: any, gameBoardData: any) => {
  const movementRules: any = new Object(moverules)
  const possibleMovements: any = []
  mapGemeData(gameBoardData).map((value: any) => {
    if (piece.position === value.value.position) {
      const ordinaryMovments = movementRules[piece.piece.type].ordinaryMove
      ordinaryMovments.map((movesValue: any) => {
        const valueObject: any = new Object(movesValue)
        try {
          const pieceToMove = gameBoardData[value.y - (valueObject.y)][value.x - (valueObject.x)]
          if (pieceToMove?.position && (pieceToMove?.piece?.player !== piece.piece.player)) {
            possibleMovements.push(pieceToMove)
            // pieceToMove.originalPiece = piece
          }
        } catch (error) {
          
        }
      })
    }
  })
  return possibleMovements
}