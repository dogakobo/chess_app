'use client'
import React, { useRef, useEffect, useState } from 'react'

export default function Board () {
  const boardRef = useRef<any>()
  const [height, setSqHeight] = useState('0')
  const [width, setSqWdith] = useState('0')

  const abc = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

  useEffect(() => {
    setSqHeight(boardRef.current.offsetHeight / 8 + 'px' )
    setSqWdith(boardRef.current.offsetWidth / 8 + 'px')
    function handleResize() {
      console.log('resized to: ', window.innerWidth, 'x', window.innerHeight)
    
    }
    window.addEventListener('resize', () => {
      setSqHeight(boardRef.current.offsetHeight / 8 + 'px' )
      setSqWdith(boardRef.current.offsetWidth / 8 + 'px')
    })
  }, [])
  const boardValues = abc.map((letter: string) => Array.from(Array(8).keys()).map((value: number , index: number) => `${letter} ${index + 1}`))
  return (
    <div id='board' ref={boardRef} className='w-full h-screen absolute z-0 top-0 left-0 max-w-screen max-h-screen origin-center'>
      {
       boardValues.map((value: any, index1: number) => <div className='bg-emerald-500 flex w-max'>
        {
          value.map((data: any, index2: number) => {
          const color = (index1 % 2 - ( index2 % 2 === 0 ? 1 : 0 ) === 0) ? ' rgb(115,149,82)' : 'rgb(235, 236, 208)'
          const colorText = (index1 % 2 - ( index2 % 2 === 0 ? 1 : 0 ) === 0) ? 'rgb(235, 236, 208)' : ' rgb(115,149,82)'
          return <div style={{ width: height, height, backgroundColor: color }} className='rotate-90 origin-center' >
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
