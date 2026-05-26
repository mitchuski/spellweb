import { Buffer } from 'buffer';
(globalThis as Record<string, unknown>).Buffer = Buffer;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import SpellWeb from './components/SpellWeb'
import MobileSpell from './components/MobileSpell'
import { useIsMobile } from './hooks/useIsMobile'
import { KeymasterProvider } from './contexts/KeymasterContext'
import './index.css'

function Root() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileSpell /> : <SpellWeb />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeymasterProvider>
      <Root />
    </KeymasterProvider>
  </StrictMode>,
)
