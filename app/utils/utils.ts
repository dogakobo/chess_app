export const mapGemeData = (gameData: any[]) => {
  let data: any = []
  gameData.map((value: any, index1: number) => value.map((square: any, index2: number) => {
    data.push({
      value: square,
      x: index2,
      y: index1
    })
  }))
  return data
}