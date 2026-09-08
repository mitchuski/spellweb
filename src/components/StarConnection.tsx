import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { clearStarAppearance, receiveStarAppearance, useStarAppearance, type StarPalette } from '../lib/starAppearance';
import { appearanceFromJSON } from '../lib/starProjection.mjs';
import { loadKey, saveKey, importKeyJSON, exportKeyJSON, CITY_KEY_EVENT } from '../lib/cityKey';
import { BUNDLE_KIND, validateBundle } from '../lib/journey-core';
import { adoptJourney } from '../lib/journey-store';
import './StarConnection.css';
import { useEquippedStar, setStarEquipped, syncStarLoadout } from '../lib/starLoadout';
import { downloadJourney } from '../lib/journey-store';
import { foldActiveJourney } from '../lib/cityKeyJourney';
const defaults = {cool:'#141a3d',warm:'#f0eee8',sword:'#e8523a',mage:'#4dd9e8'};
type Preview = { text: string; palette: StarPalette; name: string; bundle: boolean };
export default function StarConnection() {
 const appearance = useStarAppearance();
 const equipped = useEquippedStar();
 const [open, setOpen] = useState(false);
 const [preview, setPreview] = useState<Preview | null>(null);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [notice, setNotice] = useState('');
 const [key, setKey] = useState(() => { try { return loadKey(); } catch { return null; } });
 const input = useRef<HTMLInputElement>(null);
 useEffect(() => {
  const show = () => setOpen(true);
  window.addEventListener('spellweb:open-star', show);
  const receive = (event: Event) => { receiveStarAppearance((event as CustomEvent).detail); };
  const sync = () => { try { setKey(loadKey()); } catch { setError('Could not read the saved City Key.'); } };
  window.addEventListener('spellweb-star-appearance', receive);
  window.addEventListener(CITY_KEY_EVENT, sync);
  window.addEventListener('storage', sync);
  return () => { window.removeEventListener('spellweb:open-star', show); window.removeEventListener('spellweb-star-appearance', receive); window.removeEventListener(CITY_KEY_EVENT, sync); window.removeEventListener('storage', sync); };
 }, []);
 useEffect(() => {
  if (!key) return;
  let active = true;
  appearanceFromJSON(exportKeyJSON(key)).then(p => { if(active) receiveStarAppearance(p.palette, false); }).catch(() => {});
  return () => { active = false; };
 }, [key]);
 useEffect(() => {
  const check = () => { if (appearance?.expiresAt && Date.now() >= appearance.expiresAt) clearStarAppearance(); };
  window.addEventListener('focus', check); return () => window.removeEventListener('focus', check);
 }, [appearance]);
 async function read(file: File) {
  setBusy(true); setError(''); setPreview(null); setNotice('');
  try {
   if(file.size > 2*1024*1024) throw Error('Choose a JSON file smaller than 2 MiB.');
   const text = await file.text();
   const projected = await appearanceFromJSON(text);
   const value = JSON.parse(text);
   const bundle = value.kind === BUNDLE_KIND;
   if(bundle) await validateBundle(value);
   const source = bundle ? value.key : value;
   setPreview({text,palette:projected.palette,name:typeof source.name === 'string' ? source.name : 'City Key',bundle});
  } catch(e) { setError(e instanceof Error ? e.message : 'Could not read that JSON.'); }
  finally { setBusy(false); }
 }
 async function adopt() {
  if(!preview) return;
  setBusy(true); setError('');
  try {
   const value = JSON.parse(preview.text);
   const result = await importKeyJSON(JSON.stringify(preview.bundle ? value.key : value));
   if(!result.verified || !result.derivedKappa) throw Error('Could not verify the key content.');
   if(preview.bundle) await adoptJourney(value);
   saveKey(result.key); setKey(result.key); setStarEquipped(true);
   receiveStarAppearance(preview.palette, false);
   setPreview(null); setNotice('City Key loaded. Your Star and orbs now use its colours.');
  } catch(e) { setError(e instanceof Error ? e.message : 'Import failed.'); }
  finally { setBusy(false); }
 }
 const palette = preview?.palette ?? appearance?.palette ?? defaults;
 return <div id="spellweb-star" className="sw-star" style={Object.fromEntries(Object.entries(palette).map(([k,v])=>['--'+k,v])) as CSSProperties}>
  {open && <section className="sw-star-panel" aria-label="Your Star">
   <header><span className="eyebrow">CITY OF MAGES</span><button aria-label="Close Star" onClick={()=>setOpen(false)}>×</button></header>
   <h2>Your Star.</h2>
    <svg viewBox="0 0 200 200" role="img" aria-label="Paired Soulbis Star tetrahedra in your City Key colours"><circle className="ring" cx="100" cy="100" r="87"/><ellipse className="orbit" cx="100" cy="100" rx="92" ry="32" transform="rotate(-32 100 100)"/><ellipse className="orbit" cx="100" cy="100" rx="92" ry="32" transform="rotate(48 100 100)"/><path className="sword" d="M159.13 135.53L114.18 79.88 M159.13 135.53L40.87 145.26 M159.13 135.53L85.82 39.33 M114.18 79.88L40.87 145.26 M114.18 79.88L85.82 39.33 M40.87 145.26L85.82 39.33"/><path className="mage" d="M40.87 64.47L85.82 120.12 M40.87 64.47L159.13 54.74 M40.87 64.47L114.18 160.67 M85.82 120.12L159.13 54.74 M85.82 120.12L114.18 160.67 M159.13 54.74L114.18 160.67"/><circle className="centre" cx="100" cy="100" r="3"/></svg>
   <p className="star-status" role="status">{preview ? `Preview · ${preview.name}` : notice || (key ? 'City Key loaded in this browser' : 'Bring your City Key')}</p>
   <input ref={input} aria-label="Import Star JSON" type="file" accept=".json,application/json" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void read(f);e.target.value='';}} />
   <button className="star-primary" disabled={busy} onClick={()=>input.current?.click()}>{busy ? 'Reading…' : 'Import City Key JSON'}</button>
   <p className="muted">City Key or private journey bundle · JSON</p>
   {preview && <div className="star-preview">
    <p>{preview.bundle ? 'Key and original journey evidence are ready to import.' : 'Key ready to import. Original journey evidence is only included in a bundle.'}</p>
    {key && <p>This replaces your current local City Key. Export it below first if you want to keep a copy.</p>}
    <button className="star-primary" disabled={busy} onClick={()=>void adopt()}>Use this City Key</button>
    <button disabled={busy} onClick={()=>setPreview(null)}>Cancel preview</button>
   </div>}
   {key && <div className="star-preview">
    <button aria-pressed={equipped} onClick={() => setStarEquipped(!equipped)}>{equipped ? 'Unequip Star' : 'Equip Star'}</button>
    <button className="star-primary" disabled={busy || !!preview} onClick={async () => {
     setBusy(true); setError('');
     try { const snapshot = await syncStarLoadout(); setNotice(`Star synced · ${snapshot.equipped.length} equipped · ${snapshot.forged.length} forged · ${snapshot.held.length} held · ${snapshot.bound.length} bound.`); }
     catch(e) { setError(e instanceof Error ? e.message : 'Sync failed.'); }
     finally { setBusy(false); }
    }}>Sync Star</button>
    <p className="muted">Copy your lattice loadout, forged items, held constellations, familiars and receipts into this key. Retains original journey evidence; adds no witness claims or signing authority.</p>
    <button disabled={busy} onClick={async () => { setBusy(true); setError(''); try { downloadJourney(await foldActiveJourney()); } catch(e) { setError(e instanceof Error ? e.message : 'Export failed.'); } finally { setBusy(false); } }}>Export private journey bundle</button>
   </div>}
   {key && <button onClick={()=>{const url=URL.createObjectURL(new Blob([exportKeyJSON(key)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='city-key.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}}>Export City Key JSON</button>}
   <a className="star-customise" href="https://soulbis.com/star/" target="_blank" rel="noopener noreferrer">Customise on Star ↗</a>
   {appearance && <button onClick={()=>{clearStarAppearance();setNotice('Appearance reset. Your City Key is still saved.');}}>Reset colours</button>}
   <p className="muted">{appearance?.expiresAt ? 'Extension colours · temporary. ' : ''}Local key · VTA signer not connected.</p>
   <p role="alert" className="star-error">{error}</p>
  </section>}
  <button className="sw-star-launch" aria-expanded={open} onClick={()=>setOpen(!open)}>✦ Star</button>
 </div>;
}
