import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SpellWeb from './components/SpellWeb'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SpellWeb />
  </StrictMode>,
)
