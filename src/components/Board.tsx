'use client'
import React, { useRef, useEffect, useState } from 'react'

const abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
export default function Board () {
  const boardRef = useRef<HTMLDivElement>(null)
  const [height, setSqHeight] = useState('0')

  useEffect(() => {
    if (boardRef?.current) {
      setSqHeight(boardRef?.current?.offsetHeight / 8 + 'px' )
    }
    window.addEventListener('resize', () => {
      if (boardRef?.current) {
        setSqHeight(boardRef.current.offsetHeight / 8 + 'px' )
      }
    })
  }, [])
  const boardValues = abc.map((letter: string) => Array.from(Array(8).keys()).map((value: number , index: number) => `${letter} ${index + 1}`))
  return (
    <div id='board' ref={boardRef} className='w-full h-screen absolute z-0 top-0 left-0 max-w-screen max-h-screen origin-center'>
      {
       boardValues.map((value: unknown[], index1: number) => <div className='bg-emerald-500 flex w-max' key={index1}>
        {
          value.map((data: unknown, index2: number) => {
          const color = (index1 % 2 - ( index2 % 2 === 0 ? 1 : 0 ) === 0) ? ' rgb(115,149,82)' : 'rgb(235, 236, 208)'
          const colorText = (index1 % 2 - ( index2 % 2 === 0 ? 1 : 0 ) === 0) ? 'rgb(235, 236, 208)' : ' rgb(115,149,82)'
          return <div style={{ width: height, height, backgroundColor: color }} className='rotate-90 origin-center' key={index2}>
            <p className='text-white'>
              {(index1 % 2 - ( index2 % 2 === 0 ? 0 : 1 ) === 0) }
            </p>
            <p style={{ color: colorText}} className='rotate-180 w-max h-max'>
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
