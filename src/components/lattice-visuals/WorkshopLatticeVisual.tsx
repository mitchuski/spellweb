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
import QuartermasterLatticeVisual from './QuartermasterLatticeVisual';
import ChanceryLatticeVisual from './ChanceryLatticeVisual';
import RostraLatticeVisual from './RostraLatticeVisual';
import WellpoolLatticeVisual from './WellpoolLatticeVisual';
import CircuitLatticeVisual from './CircuitLatticeVisual';
import StakesLatticeVisual from './StakesLatticeVisual';
import CharthouseLatticeVisual from './CharthouseLatticeVisual';
import HorizonLatticeVisual from './HorizonLatticeVisual';
import SolchantingLatticeVisual from './SolchantingLatticeVisual';
import StaffLatticeVisual from './StaffLatticeVisual';
import FamiliarsLatticeVisual from './FamiliarsLatticeVisual';

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
    case 'quartermaster':  return <QuartermasterLatticeVisual {...common} />;
    case 'chancery':       return <ChanceryLatticeVisual {...common} />;
    case 'rostra':         return <RostraLatticeVisual {...common} />;
    case 'wellpool':       return <WellpoolLatticeVisual {...common} />;
    case 'circuit':        return <CircuitLatticeVisual {...common} />;
    case 'stakes':         return <StakesLatticeVisual {...common} />;
    case 'charthouse':     return <CharthouseLatticeVisual {...common} />;
    case 'horizon':        return <HorizonLatticeVisual {...common} />;
    case 'solchanting':    return <SolchantingLatticeVisual {...common} />;
    case 'staff':          return <StaffLatticeVisual {...common} />;
    case 'familiars':      return <FamiliarsLatticeVisual {...common} />;
    case 'rune':
    default:               return <RuneLatticeVisual {...common} />;
  }
}
