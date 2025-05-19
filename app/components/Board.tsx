'use client'
import React, { useRef, useEffect, useState } from 'react'

export default function Board () {
  const boardRef = useRef<any>()
  const [height, setSqHeight] = useState('0')
  const [width, setSqWdith] = useState('0')

  const abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  useEffect(() => {
    setSqHeight(boardRef.current.offsetHeight / 8 +'px' )
    setSqWdith(boardRef.current.offsetWidth / 8 + 'px')
  }, [])
  const boardValues = abc.map((letter: string) => Array.from(Array(8).keys()).map((value: number , index: number) => `${letter} ${index + 1}`))
  return (
    <div ref={boardRef} className='w-max h-full absolute z-0 top-0 max-w-screen max-h-screen -rotate-90 origin-center '>
      {
       boardValues.map((value: any, index1: number) => <div className='bg-emerald-500 flex w-max'>
        {
          value.map((data: any, index2: number) => {
          const color = (index1 % 2 - ( index2 % 2 === 0 ? 0 : 1 ) === 0) ? ' rgb(34 197 94)' : 'white'
          const colorText = (index1 % 2 - ( index2 % 2 === 0 ? 0 : 1 ) === 0) ? 'white' : ' rgb(34 197 94)'
          return <div style={{ width: height, height, backgroundColor: color }} className='rotate-90 origin-center' >
            <p className='text-white'>
              {(index1 % 2 - ( index2 % 2 === 0 ? 0 : 1 ) === 0) }
            </p>
            <p style={{ color: colorText}}>
              {/* {data} */}
            </p>
          </div>
          }
        )
        }
       </div>)
      }
    </div>
  )
}
