import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import Posenet from './Components/Posenet'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='block w-screen h-screen'>
        <Posenet />
      </div>
    </>
  )
}

export default App
