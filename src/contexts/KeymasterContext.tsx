import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import DrawbridgeClient from '@didcid/gatekeeper/drawbridge';
import Keymaster from '@didcid/keymaster';
import type { StoredWallet } from '@didcid/keymaster';
import CipherWeb from '@didcid/cipher';
import WalletWeb from '@didcid/keymaster/wallet/web';
import {
  clearSessionPassphrase,
  getSessionPassphrase,
  setSessionPassphrase,
} from '../utils/sessionPassphrase';
import { deriveMageKeyFromKeymaster } from '../lib/mageIdentity';
import { Buffer } from 'buffer';
import { type MageArchonBackup, MAGE_VAULT_ALIAS, MAGE_HISTORY_ITEM } from '../lib/mageHistory';
import { THEME } from '../data/theme';

// ── Config ──────────────────────────────────────────────────────────────────
const GATEKEEPER_KEY = 'spellweb-gatekeeper-url';
// flaxlap.local (192.168.1.23) hosts the Archon Gatekeeper. Browsers bypass
// mDNS so the hostname doesn't resolve — use the IP directly.
export const DEFAULT_GATEKEEPER_URL = 'http://192.168.1.23:4224';

// Module-level singletons — one gatekeeper connection and cipher for the app lifetime
const gatekeeper = new DrawbridgeClient();
const cipher = new CipherWeb();

// ── Types ────────────────────────────────────────────────────────────────────
export type WalletState = 'checking' | 'no-wallet' | 'locked' | 'unlocked';

interface KeymasterContextValue {
  walletState: WalletState;
  keymaster: Keymaster | null;
  mageDid: string | null;
  isGatekeeperConnected: boolean;
  gatekeeperUrl: string;
  connectWallet: () => void;
  disconnect: () => void;
  setGatekeeperUrl: (url: string) => void;
  refreshMageId: () => Promise<void>;
  exportWallet: () => Promise<void>;
  importWallet: (walletData: StoredWallet) => Promise<void>;
  backupMageHistory: (payload: MageArchonBackup) => Promise<void>;
  saveBladeToVault: (itemName: string, content: string) => Promise<void>;
  listVaultItems: () => Promise<Record<string, unknown>>;
  restoredHistory: MageArchonBackup | null;
}

const KeymasterContext = createContext<KeymasterContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────
export function KeymasterProvider({ children }: { children: ReactNode }) {
  const [walletState, setWalletState] = useState<WalletState>('checking');
  const [showModal, setShowModal] = useState(false);
  const [isGatekeeperConnected, setIsGatekeeperConnected] = useState(false);
  const [gatekeeperUrl, setGatekeeperUrlState] = useState(() => {
    const stored = localStorage.getItem(GATEKEEPER_KEY);
    // Discard any mDNS hostnames saved from previous sessions — browsers can't
    // resolve them. Replace with the IP-based default.
    if (stored && stored.includes('.local')) {
      return DEFAULT_GATEKEEPER_URL;
    }
    return stored ?? DEFAULT_GATEKEEPER_URL;
  });
  const [mageDid, setMageDid] = useState<string | null>(null);

  // Modal form state
  const [passphrase, setPassphrase] = useState('');
  const [passphraseConfirm, setPassphraseConfirm] = useState('');
  const [passphraseError, setPassphraseError] = useState('');

  // Keymaster singleton — ref so mutations don't trigger re-renders; refreshFlag drives them
  const keymasterRef = useRef<Keymaster | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [restoredHistory, setRestoredHistory] = useState<MageArchonBackup | null>(null);
  // Prevent redundant restore calls within a session (reset on disconnect)
  const historyRestoreDone = useRef(false);

  // ── Gatekeeper connection ────────────────────────────────────────────────
  useEffect(() => {
    async function connect() {
      try {
        localStorage.setItem(GATEKEEPER_KEY, gatekeeperUrl);
        await gatekeeper.connect({ url: gatekeeperUrl });
        setIsGatekeeperConnected(true);
      } catch {
        setIsGatekeeperConnected(false);
      }
    }
    connect();
  }, [gatekeeperUrl]);

  // ── Wallet initialisation (runs once on mount) ───────────────────────────
  useEffect(() => {
    async function init() {
      const walletWeb = new WalletWeb();
      const walletData = await walletWeb.loadWallet();

      if (!walletData) {
        setWalletState('no-wallet');
        return;
      }

      const cached = getSessionPassphrase();
      if (cached) {
        const ok = await doUnlock(cached, false);
        if (ok) return;
        clearSessionPassphrase();
      }

      setWalletState('locked');
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core unlock / create ─────────────────────────────────────────────────
  async function doUnlock(pass: string, isNew: boolean): Promise<boolean> {
    const walletWeb = new WalletWeb();
    const instance = new Keymaster({ gatekeeper, wallet: walletWeb, cipher, passphrase: pass });

    try {
      if (isNew) {
        await instance.newWallet(undefined, true);
        await instance.recoverWallet();
      } else {
        await instance.loadWallet();
      }
    } catch (err: unknown) {
      const msg = String((err as { message?: string })?.message ?? err);
      setPassphraseError(msg.includes('Incorrect') ? 'Incorrect passphrase' : msg);
      return false;
    }

    keymasterRef.current = instance;
    setSessionPassphrase(pass);
    setWalletState('unlocked');
    setShowModal(false);
    setPassphrase('');
    setPassphraseConfirm('');
    setPassphraseError('');
    setRefreshFlag(n => n + 1);

    await doRefreshMageId(instance);
    return true;
  }

  // ── Mage DID resolution / creation ──────────────────────────────────────
  async function doRefreshMageId(km: Keymaster): Promise<void> {
    async function deriveMageKey(did: string) {
      await deriveMageKeyFromKeymaster(km, did).catch(err =>
        console.warn('[keymaster] mage key derivation failed:', err),
      );
    }

    async function tryRestoreHistory() {
      if (historyRestoreDone.current) return;
      try {
        const vaultId = await km.getAlias(MAGE_VAULT_ALIAS);
        historyRestoreDone.current = true;
        if (!vaultId) return;
        const buf = await km.getVaultItem(vaultId, MAGE_HISTORY_ITEM);
        if (!buf) return;
        const data = JSON.parse(new TextDecoder().decode(buf)) as MageArchonBackup;
        setRestoredHistory(data);
      } catch (err) {
        console.warn('[keymaster] history restore failed:', err);
      }
    }

    try {
      const ids = await km.listIds();
      const idList: string[] = Array.isArray(ids)
        ? ids
        : ids
          ? Object.keys(ids as Record<string, string>)
          : [];

      if (idList.length === 0) {
        try {
          await km.createId('mage', { registry: 'hyperswarm' });
          const updated = await km.listIds();
          const list: string[] = Array.isArray(updated) ? updated : Object.keys(updated ?? {});
          if (list.length > 0) {
            const doc = await km.resolveDID(list[0]);
            const did = (doc as { didDocument?: { id?: string } })?.didDocument?.id ?? null;
            setMageDid(did);
            if (did) {
              await deriveMageKey(did);
              await tryRestoreHistory();
            }
          }
        } catch (err) {
          console.error('[keymaster] createId failed:', err);
          setMageDid(null);
        }
        return;
      }

      const doc = await km.resolveDID(idList[0]);
      const did = (doc as { didDocument?: { id?: string } })?.didDocument?.id ?? null;
      setMageDid(did);
      if (did) {
        await deriveMageKey(did);
        await tryRestoreHistory();
      }
    } catch (err) {
      console.error('[keymaster] refreshMageId failed:', err);
      setMageDid(null);
    }
  }

  // ── Passphrase submit handler ────────────────────────────────────────────
  const handlePassphraseSubmit = useCallback(async () => {
    setPassphraseError('');
    if (!passphrase.trim()) {
      setPassphraseError('Passphrase is required');
      return;
    }
    if (walletState === 'no-wallet' && passphrase !== passphraseConfirm) {
      setPassphraseError('Passphrases do not match');
      return;
    }
    await doUnlock(passphrase, walletState === 'no-wallet');
  }, [passphrase, passphraseConfirm, walletState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Public API ────────────────────────────────────────────────────────────
  function connectWallet() {
    setPassphraseError('');
    setPassphrase('');
    setPassphraseConfirm('');
    setShowModal(true);
  }

  function disconnect() {
    keymasterRef.current = null;
    clearSessionPassphrase();
    setMageDid(null);
    setRefreshFlag(n => n + 1);
    setWalletState('locked');
    historyRestoreDone.current = false;
  }

  const refreshMageId = useCallback(async () => {
    if (keymasterRef.current) {
      await doRefreshMageId(keymasterRef.current);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function exportWallet(): Promise<void> {
    if (!keymasterRef.current) return;
    const enc = await keymasterRef.current.exportEncryptedWallet();
    const date = new Date().toISOString().slice(0, 10);
    const shortDid = mageDid ? mageDid.slice(-8) : 'wallet';
    const filename = `archon-wallet-${shortDid}-${date}.json`;
    const blob = new Blob([JSON.stringify(enc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function backupMageHistory(payload: MageArchonBackup): Promise<void> {
    const km = keymasterRef.current;
    if (!km) throw new Error('Wallet not unlocked');

    // Get or lazily create the Mage vault
    let vaultId = await km.getAlias(MAGE_VAULT_ALIAS);
    if (!vaultId) {
      vaultId = await km.createVault();
      await km.addAlias(MAGE_VAULT_ALIAS, vaultId);
    }

    // Remove stale item before writing (vault items may not overwrite)
    try { await km.removeVaultItem(vaultId, MAGE_HISTORY_ITEM); } catch { /* not yet present */ }
    await km.addVaultItem(vaultId, MAGE_HISTORY_ITEM, Buffer.from(JSON.stringify(payload)));
  }

  async function saveBladeToVault(itemName: string, content: string): Promise<void> {
    const km = keymasterRef.current;
    if (!km) throw new Error('Wallet not unlocked');
    let vaultId = await km.getAlias(MAGE_VAULT_ALIAS);
    if (!vaultId) {
      vaultId = await km.createVault();
      await km.addAlias(MAGE_VAULT_ALIAS, vaultId);
    }
    try { await km.removeVaultItem(vaultId, itemName); } catch { /* not yet present */ }
    await km.addVaultItem(vaultId, itemName, Buffer.from(content));
  }

  async function listVaultItems(): Promise<Record<string, unknown>> {
    const km = keymasterRef.current;
    if (!km) return {};
    const vaultId = await km.getAlias(MAGE_VAULT_ALIAS);
    if (!vaultId) return {};
    return (await km.listVaultItems(vaultId)) as Record<string, unknown>;
  }

  async function importWallet(walletData: StoredWallet): Promise<void> {
    const walletWeb = new WalletWeb();
    await walletWeb.saveWallet(walletData, true);
    setPassphraseError('');
    setPassphrase('');
    setPassphraseConfirm('');
    setWalletState('locked');
    setShowModal(true);
  }

  void refreshFlag;

  const value: KeymasterContextValue = {
    walletState,
    keymaster: keymasterRef.current,
    mageDid,
    isGatekeeperConnected,
    gatekeeperUrl,
    connectWallet,
    disconnect,
    setGatekeeperUrl: setGatekeeperUrlState,
    refreshMageId,
    exportWallet,
    importWallet,
    backupMageHistory,
    saveBladeToVault,
    listVaultItems,
    restoredHistory,
  };

  return (
    <KeymasterContext.Provider value={value}>
      {children}

      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
          }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            style={{
              background: THEME.panelBg,
              border: `1px solid ${THEME.panelBorder}`,
              borderRadius: 12,
              padding: 28,
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✦</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: THEME.textBright, fontFamily: "'Cormorant Garamond', serif" }}>
                {walletState === 'no-wallet' ? 'Create Mage Wallet' : 'Unlock Wallet'}
              </div>
              <div style={{ fontSize: 11, color: THEME.textDim, marginTop: 4, fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {walletState === 'no-wallet'
                  ? 'Set a passphrase to protect your Archon identity'
                  : 'Enter your passphrase to unlock the Mage wallet'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input
                type="password"
                placeholder="Passphrase"
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePassphraseSubmit()}
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: '#ffffff08',
                  border: `1px solid ${THEME.panelBorder}`,
                  borderRadius: 6,
                  color: THEME.textBright,
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = THEME.accent)}
                onBlur={e => (e.target.style.borderColor = THEME.panelBorder)}
              />
              {walletState === 'no-wallet' && (
                <input
                  type="password"
                  placeholder="Confirm passphrase"
                  value={passphraseConfirm}
                  onChange={e => setPassphraseConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePassphraseSubmit()}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: '#ffffff08',
                    border: `1px solid ${THEME.panelBorder}`,
                    borderRadius: 6,
                    color: THEME.textBright,
                    fontSize: 13,
                    outline: 'none',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = THEME.accent)}
                  onBlur={e => (e.target.style.borderColor = THEME.panelBorder)}
                />
              )}
              {passphraseError && (
                <div style={{ fontSize: 11, color: '#e94560', fontFamily: "'JetBrains Mono', monospace" }}>
                  {passphraseError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: `1px solid ${THEME.panelBorder}`,
                  borderRadius: 6,
                  background: 'transparent',
                  color: THEME.textDim,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePassphraseSubmit}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  border: 'none',
                  borderRadius: 6,
                  background: THEME.accent,
                  color: '#000',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {walletState === 'no-wallet' ? 'Create' : 'Unlock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </KeymasterContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useKeymaster(): KeymasterContextValue {
  const ctx = useContext(KeymasterContext);
  if (!ctx) throw new Error('useKeymaster must be used within KeymasterProvider');
  return ctx;
}
