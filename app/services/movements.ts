import { mapGemeData } from '../utils/utils';
import moverules from '../data/moverules.json';

export const checkTargetPlaces = (gameBoardData: any, player: number) => {
  let places: any = []
  mapGemeData(gameBoardData).filter((value: any) => value?.value?.piece?.type).map((value: any) => {
    if (value?.value?.piece) {
      if (value.value.piece.player !== player)
      places.push(...checkPossibleMoves(value.value, gameBoardData, null, true))
    }
  })
  return places
}

export const verifyChecks = (gameBoardData: any, player: number, index?: number) => {
  let places: any = []
  console.log(mapGemeData(gameBoardData).find((p: any) => p.value.position === 'e8'), 'map');
  mapGemeData(gameBoardData).filter((value: any) => value?.value?.piece && value?.value?.piece?.player != player).forEach((value: any) => {
    // if (value?.value?.piece?.type && value?.value?.piece?.player == player) {
    // }
    console.log(value.value, index);
    places.push(...checkPossibleMoves(value.value, gameBoardData, null, true))
  })
  let check
  console.log(places.find((p: any) => p.position === 'd7'), 'places find')
  console.log(places, 'places')
  const uniqueArray = Array.from(new Set(places.map((a: any) => a.position)))
  .map(id => {
    return places.find((a: any) => a.position === id)
  })
  console.log(uniqueArray, 'not repited', index)
  uniqueArray.forEach((place: any) => {
    if (place.piece?.type === 'king') {
      if (place.piece?.player == player) {
        console.log(place, 'check');
        check = place
      }
    }
  })
  console.log(check, 'check');
  return check
}

export const verifyChecks3 = (array: any, value: any, originalPiece: any) => {
  let places: any = array
  let check
  console.log(originalPiece, 'orirignal');
  console.log(value, 'orirignal');
  const uniqueArray = Array.from(new Set(places.map((a: any) => a.position)))
  .map(id => {
    return places.find((a: any) => a.position === id)
  })
  console.log(uniqueArray);
  const new2 = uniqueArray.filter((place: any) => place.position !== originalPiece.position)
  const index = new2.findIndex((a: any) => a.position === value.position)
  console.log(new2.length)
  console.log(new2)
  console.log(index)
  console.log(new2[index])
  new2[index] = value
  new2.forEach((place: any) => {
    // if (originalPiece.position !== place.position)
    if (place.piece?.type === 'king' ) {
      // if (place.piece?.player != originalPiece.piece.player) {
      console.log('pega');
      // if (place.position === value.position) {
        // if (place.piece?.player == value.piece.player) {
          console.log(place, 'check');
          check = place
        // }
      // }
    }
  })
  // console.log(check, 'check');
  return check
}

export const verifyChecks2 = (gameBoardData: any, moves: any, piece: any) => {
  let places2: any = []
  let places: any = []
  // console.log(moves);
  // console.log(moves.length);
  mapGemeData(gameBoardData).filter((value: any) => value?.value?.piece && value?.value?.piece?.player != piece.piece.player).forEach((value: any) => {
    // if (value?.value?.piece?.type && value?.value?.piece?.player == player) {
    // }
    places2.push(...checkPossibleMoves(value.value, gameBoardData, null, true))
  })
  moves.forEach((value: any, index: number) => {
    const gameBoardDataCopy = Array.from(new Array([...gameBoardData])[0])
    const valuePieceCopy = value?.piece
    const pieceCopy = piece.piece
    // pieceCopy.copy = true
    // console.log(piece);
    // console.log(gameBoardDataCopy[piece.y][piece.x], 'piece not removed');
    // console.log(gameBoardDataCopy[value.y][value.x], 'value');
    // gameBoardDataCopy[piece.y][piece.x].piece = undefined
    // gameBoardDataCopy[value.y][value.x].piece = pieceCopy
    // console.log(gameBoardDataCopy[piece.y][piece.x], 'piece removed');
    // const asd = verifyChecks(gameBoardDataCopy, pieceCopy.player, index)
    const asd = verifyChecks3(places2, value, piece)
    // const asd = verifyChecks3(places2, pieceCopy.player, index)
    console.log(asd, 'asd');
    if (!asd) {
      // console.log(value);
      places.push(value)
    }
    // pieceCopy.copy = false
    // gameBoardDataCopy[piece.y][piece.x].piece = pieceCopy
    // gameBoardDataCopy[value.y][value.x].piece = valuePieceCopy
  })
  return places
}

export const checkPossibleMoves = (piece: any, gameBoardData: any, checks: any = null, secondary: boolean = false) => {
  let moves: any = []
  if (piece.piece.type === 'knight'){
    moves = knightRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'pawn'){
    moves =  pawnRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'rook'){
    moves =  rookRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'bishop'){
    moves =  bishopRules(piece, gameBoardData)
  }
  if (piece.piece.type === 'queen'){
    const rules = [...rookRules(piece, gameBoardData), ...bishopRules(piece, gameBoardData)]
    moves =  rules
  }
  if (piece.piece.type === 'king'){
    moves =  kingRules(piece, gameBoardData, checks)
  }
  /* console.log(mapGemeData(gameBoardData).find(p => p.value.position === 'd7').value.piece) */
  
  if (!secondary) {
    // console.log(moves);
    moves = verifyChecks2(gameBoardData, moves, piece)
  }
  
  // let movesCopy: any = []
  // if (!secondary) {
  //   const targetPlaces = checkTargetPlaces(gameBoardData, piece.piece.player)
  //   moves.map((value: any) => {
  //     console.log(targetPlaces);
  //     console.log(value);
  //     const isTargered = targetPlaces.find((target: any) => value.position === target.position)
  //     console.log(isTargered);
  //     if (!isTargered) {
  //       movesCopy.push(value)
  //     }
  //   })
  //   moves = movesCopy
  // }
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
          pieceToMove.originalPiece = piece
          possibleMovements.push(pieceToMove)
        }
      
      }
    } catch (error) {
      
    }
  })
  console.log(possibleMovements)
/* initialMovments.map((movesValue: any) => {
  const valueObject: any = new Object(movesValue)
  let yy = sum(piece.y, valueObject.y ?? 0)
  let xx = sum(piece.x, valueObject.x ?? 0)
  try {
    const pieceToMove = gameBoardData[yy][xx]
    if (pieceToMove?.position) {
      if (pieceToMove?.piece?.player != piece?.piece.player) {
        possibleMovements.push(pieceToMove)
      }
    
    }
  } catch (error) {
    
  }
}) */
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
          pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          pieceToMove.originalPiece = piece
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
          pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          pieceToMove.originalPiece = piece
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
          pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          pieceToMove.originalPiece = piece
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
          pieceToMove.originalPiece = piece
          if (pieceToMove?.piece.player != piece.piece.player) possibleMovements.push(pieceToMove)
            
          break
        } 
        if (piece.position !== pieceToMove.position) {
          pieceToMove.originalPiece = piece
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
      const ordinaryMovments = movementRules[piece.piece.type].ordinaryMove
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
                  pieceToMove.originalPiece = piece
                  possibleMovements.push(pieceToMove)
                }
                return
              }
              if (pieceToMove?.position && !pieceToMove?.piece) {
                pieceToMove.originalPiece = piece
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
                  pieceToMove.originalPiece = piece
                  possibleMovements.push(pieceToMove)
                }
                return
              }
              if (pieceToMove?.position && pieceToMove?.piece?.player != piece.piece.player) {
                pieceToMove.originalPiece = piece
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

const pawnRules = (piece: any, gameBoardData: any) => {
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
            pieceToMove.originalPiece = piece
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
            pieceToMove.originalPiece = piece
            possibleMovements.push(pieceToMove)
          } catch (error) {
            
          }
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
      initialMovments.map((movesValue: any) => {
        const valueObject: any = new Object(movesValue)
        let y = value.y - (valueObject.y)
        let x = value.x - (valueObject.x)
        if (piece.piece.player == 2) {
          x = value.x + (valueObject.x)
          y = value.y + (valueObject.y)
        }
        const pieceToMove = gameBoardData[y][x]
        if (pieceToMove?.position && !pieceToMove?.piece) {
          pieceToMove.originalPiece = piece
          possibleMovements.push(pieceToMove)
        }
      })
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
            pieceToMove.originalPiece = piece
          }
        } catch (error) {
          
        }
      })
    }
  })
  return possibleMovements
}