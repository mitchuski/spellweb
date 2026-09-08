import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SpellWeb from './components/SpellWeb'
import MobileSpell from './components/MobileSpell'
import { useIsMobile } from './hooks/useIsMobile'
import './index.css'
import StarConnection from './components/StarConnection'

function Root() {
  const isMobile = useIsMobile();
  return <>{isMobile ? <MobileSpell /> : <SpellWeb />}<StarConnection /></>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
