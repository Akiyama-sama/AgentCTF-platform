import { useState, useEffect } from 'react'
import { descriptions } from '../data/data'


export default function ProjectDescription() {
    const [currentDescription, setCurrentDescription] = useState(descriptions[0])
    const [key, setKey] = useState(0)
  
    useEffect(() => {
      const interval = setInterval(() => {
        setKey(prevKey => prevKey + 1)
        setCurrentDescription(
          descriptions[Math.floor(Math.random() * descriptions.length)]
        )
      }, 3000)
      return () => clearInterval(interval)
    }, [key])
  
    return (
      <div
        key={key}
        className='animate-fade-in text-center text-xl font-semibold'
      >
        {currentDescription}
      </div>
    )
  }