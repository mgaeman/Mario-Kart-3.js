import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { WebGPUCanvas } from './WebGPUCanvas.jsx'
import { MobileControls } from './mobile/MobileControls.jsx'
import { LoadingScreen } from './LoadingScreen.jsx'
import { Header } from './components/Header.jsx'

createRoot(document.getElementById('root')).render(

    <div className='canvas-container'>
      <Header />
      <MobileControls/>
      <Suspense fallback={false}>
      <WebGPUCanvas />
      </Suspense>
      <LoadingScreen />
      <div className="version">v0.3.4</div>
    </div>
)
