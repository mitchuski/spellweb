import { useRef } from 'react';
import { useKeymaster } from '../contexts/KeymasterContext';
import type { StoredWallet } from '@didcid/keymaster';
import { THEME } from '../data/theme';

function truncateDid(did: string): string {
  const prefix = 'did:cid:';
  if (!did.startsWith(prefix)) return did.slice(0, 24) + '…';
  const suffix = did.slice(prefix.length);
  return `${prefix}${suffix.slice(0, 10)}…`;
}

export function MageIdentityPanel() {
  const {
    walletState,
    mageDid,
    isGatekeeperConnected,
    connectWallet,
    disconnect,
    refreshMageId,
    exportWallet,
    importWallet,
  } = useKeymaster();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gatekeeperColor = isGatekeeperConnected ? '#2ecc71' : '#ffd700';

  const monoStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
  };

  const iconBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: THEME.textDim,
    cursor: 'pointer',
    padding: '0 2px',
    lineHeight: 1,
    ...monoStyle,
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target?.result as string) as StoredWallet;
        await importWallet(data);
      } catch {
        alert('Invalid wallet file — could not parse JSON.');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected if needed
    e.target.value = '';
  }

  if (walletState === 'checking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: THEME.textDim, ...monoStyle }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: THEME.panelBorder, display: 'inline-block' }} />
        checking…
      </div>
    );
  }

  if (walletState === 'unlocked' && mageDid) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: gatekeeperColor,
            boxShadow: `0 0 4px ${gatekeeperColor}`,
            display: 'inline-block',
            flexShrink: 0,
          }}
          title={isGatekeeperConnected ? 'Gatekeeper connected' : 'Gatekeeper offline'}
        />
        <span style={{ color: THEME.textDim, cursor: 'default', ...monoStyle }} title={mageDid}>
          {truncateDid(mageDid)}
        </span>
        <button
          onClick={exportWallet}
          title="Export encrypted wallet"
          style={iconBtnStyle}
        >
          ↓
        </button>
        <button
          onClick={disconnect}
          title="Disconnect wallet"
          style={iconBtnStyle}
        >
          ✕
        </button>
      </div>
    );
  }

  // Wallet unlocked but DID not yet resolved (Gatekeeper may be offline)
  if (walletState === 'unlocked') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#ffd700',
            display: 'inline-block',
            flexShrink: 0,
          }}
          title="Wallet unlocked — DID pending"
        />
        <span style={{ color: THEME.textDim, ...monoStyle }}>wallet unlocked</span>
        <button
          onClick={refreshMageId}
          title="Retry DID resolution"
          style={iconBtnStyle}
        >
          ↺
        </button>
      </div>
    );
  }

  // locked — single unlock button
  if (walletState === 'locked') {
    return (
      <button
        onClick={connectWallet}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 4,
          border: `1px solid ${THEME.panelBorder}`,
          background: 'transparent',
          color: THEME.textDim,
          cursor: 'pointer',
          transition: 'all 0.2s',
          ...monoStyle,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = THEME.accent;
          e.currentTarget.style.color = THEME.accent;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = THEME.panelBorder;
          e.currentTarget.style.color = THEME.textDim;
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e94560', display: 'inline-block', flexShrink: 0 }} />
        Unlock Wallet
      </button>
    );
  }

  // no-wallet — two options: create new or import
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        onClick={connectWallet}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 4,
          border: `1px solid ${THEME.panelBorder}`,
          background: 'transparent',
          color: THEME.textDim,
          cursor: 'pointer',
          transition: 'all 0.2s',
          ...monoStyle,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = THEME.accent;
          e.currentTarget.style.color = THEME.accent;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = THEME.panelBorder;
          e.currentTarget.style.color = THEME.textDim;
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e94560', display: 'inline-block', flexShrink: 0 }} />
        Connect Wallet
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Import wallet from exported JSON"
        style={{
          padding: '4px 8px',
          borderRadius: 4,
          border: `1px solid ${THEME.panelBorder}`,
          background: 'transparent',
          color: THEME.textDim,
          cursor: 'pointer',
          transition: 'all 0.2s',
          ...monoStyle,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = THEME.accent;
          e.currentTarget.style.color = THEME.accent;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = THEME.panelBorder;
          e.currentTarget.style.color = THEME.textDim;
        }}
      >
        ↑ Import
      </button>
    </div>
  );
}
