// Dispatcher — given a LatticeVisualKey, render the right per-workshop SVG.
// Each Visual is the same one rendered at the top of its master /<shop> page,
// mirrored here so the spellweb forge popup shows the workshop's own crafted
// imagery instead of a generic blade icon.

import type { LatticeVisualKey } from '../../lib/workshop-artefact';
import BladeLatticeVisual from './BladeLatticeVisual';
import BonfiresLatticeVisual from './BonfiresLatticeVisual';
import CeremonyHallLatticeVisual from './CeremonyHallLatticeVisual';
import CloakLatticeVisual from './CloakLatticeVisual';
import CovenantLatticeVisual from './CovenantLatticeVisual';
import CuratrixVaultLatticeVisual from './CuratrixVaultLatticeVisual';
import EtherDiamondLatticeVisual from './EtherDiamondLatticeVisual';
import HolonLatticeVisual from './HolonLatticeVisual';
import JewelerLatticeVisual from './JewelerLatticeVisual';
import LogosCircleLatticeVisual from './LogosCircleLatticeVisual';
import RuneLatticeVisual from './RuneLatticeVisual';
import ShieldLatticeVisual from './ShieldLatticeVisual';

interface Props {
  visualKey: LatticeVisualKey;
  className?: string;
  height?: string;
  showLabels?: boolean;
}

export default function WorkshopLatticeVisual({ visualKey, className, height, showLabels }: Props) {
  const common = { className, height, showLabels };
  switch (visualKey) {
    case 'cloak':          return <CloakLatticeVisual {...common} />;
    case 'shield':         return <ShieldLatticeVisual {...common} />;
    case 'blade':          return <BladeLatticeVisual {...common} />;
    case 'ether-diamond':  return <EtherDiamondLatticeVisual {...common} />;
    case 'jeweler':        return <JewelerLatticeVisual {...common} />;
    case 'holon':          return <HolonLatticeVisual {...common} />;
    case 'bonfires':       return <BonfiresLatticeVisual {...common} />;
    case 'curatrix-vault': return <CuratrixVaultLatticeVisual {...common} />;
    case 'covenant':       return <CovenantLatticeVisual {...common} />;
    case 'logos-circle':   return <LogosCircleLatticeVisual {...common} />;
    case 'ceremony-hall':  return <CeremonyHallLatticeVisual {...common} />;
    case 'rune':
    default:               return <RuneLatticeVisual {...common} />;
  }
}
