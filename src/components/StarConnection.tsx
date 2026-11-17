import { useEffect, useRef, useState, type CSSProperties } from 'react';
import KeyStar from './KeyStar';
import { clearStarAppearance, receiveStarAppearance, useStarAppearance, type StarPalette } from '../lib/starAppearance';
import { appearanceFromJSON } from '../lib/starProjection.mjs';
import { loadKey, saveKey, importKeyJSON, exportKeyJSON, CITY_KEY_EVENT } from '../lib/cityKey';
import { BUNDLE_KIND, validateBundle } from '../lib/journey-core';
import { adoptJourney } from '../lib/journey-store';
import './StarConnection.css';
import { useEquippedStar, setStarEquipped, syncStarLoadout } from '../lib/starLoadout';
import { downloadJourney } from '../lib/journey-store';
import { foldActiveJourney } from '../lib/cityKeyJourney';
import { OPEN_KEY_EVENT } from '../lib/keyIdentity';

// a soulbis /star snapshot carries the key in a PNG tEXt chunk named cityKey (base64 JSON)
function keyFromPng(u: Uint8Array): string {
 if(u.length<20||u[0]!==0x89||u[1]!==0x50||u[2]!==0x4e||u[3]!==0x47) throw Error('That is not a PNG.');
 const lat=(b: Uint8Array)=>{let s='';for(const c of b)s+=String.fromCharCode(c);return s;};
 for(let p=8;p+12<=u.length;){const len=((u[p]<<24)|(u[p+1]<<16)|(u[p+2]<<8)|u[p+3])>>>0,type=lat(u.subarray(p+4,p+8));
  if(type==='tEXt'){const d=u.subarray(p+8,p+8+len),z=d.indexOf(0);if(z>0&&lat(d.subarray(0,z))==='cityKey'){const bin=atob(lat(d.subarray(z+1)));return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)));}}
  if(type==='IEND')break;p+=12+len;}
 throw Error('No City Key inside this PNG.');
}
const defaults = {cool:'#141a3d',warm:'#f0eee8',sword:'#e8523a',mage:'#4dd9e8'};
type Preview = { text: string; palette: StarPalette; name: string; bundle: boolean };
export default function StarConnection({ inline = false }: { inline?: boolean } = {}) {
 const appearance = useStarAppearance();
 const equipped = useEquippedStar();
 const [open, setOpen] = useState(inline);  // inline: lives in the drawer's Key tab, always shown
 const [preview, setPreview] = useState<Preview | null>(null);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const [notice, setNotice] = useState('');
 const [key, setKey] = useState(() => { try { return loadKey(); } catch { return null; } });
 const input = useRef<HTMLInputElement>(null);
 useEffect(() => {
  const show = () => setOpen(true);
  window.addEventListener('spellweb:open-star', show); window.addEventListener(OPEN_KEY_EVENT, show);
  const receive = (event: Event) => { receiveStarAppearance((event as CustomEvent).detail); };
  const sync = () => { try { setKey(loadKey()); } catch { setError('Could not read the saved City Key.'); } };
  window.addEventListener('spellweb-star-appearance', receive);
  window.addEventListener(CITY_KEY_EVENT, sync);
  window.addEventListener('storage', sync);
  return () => { window.removeEventListener('spellweb:open-star', show); window.removeEventListener(OPEN_KEY_EVENT, show); window.removeEventListener('spellweb-star-appearance', receive); window.removeEventListener(CITY_KEY_EVENT, sync); window.removeEventListener('storage', sync); };
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
   const isPng = file.type === 'image/png' || /\.png$/i.test(file.name);
   if(file.size > (isPng ? 16 : 2)*1024*1024) throw Error(isPng ? 'Choose a PNG smaller than 16 MiB.' : 'Choose a JSON file smaller than 2 MiB.');
   const text = isPng ? keyFromPng(new Uint8Array(await file.arrayBuffer())) : await file.text();
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
 return <div id="spellweb-star" className={`sw-star${inline ? ' sw-star-inline' : ''}`} style={Object.fromEntries(Object.entries(palette).map(([k,v])=>['--'+k,v])) as CSSProperties}>
  {open && <section className={`sw-star-panel ${inline ? 'sw-key-inline' : 'sw-key-card'}`} aria-label="Your key">
   {!inline && <header><span className="eyebrow">THE CEREMONY · YOUR KEY</span><button aria-label="Close your key" onClick={()=>setOpen(false)}>×</button></header>}
   <h2>Your key.</h2>
    <KeyStar palette={palette} name={key ? (key.bearerName ?? (typeof (key.payload as Record<string, unknown>)?.name === 'string' ? String((key.payload as Record<string, unknown>).name) : 'Your City Key')) : undefined} kappa={key?.kappa ?? null} />
   <p className="star-status" role="status">{preview ? `Preview · ${preview.name}` : notice || (key ? 'City Key loaded in this browser' : 'Bring your City Key')}</p>
   <input ref={input} aria-label="Import Star JSON" type="file" accept=".json,application/json,.png,image/png" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void read(f);e.target.value='';}} />
   <button className="star-primary" disabled={busy} onClick={()=>input.current?.click()}>{busy ? 'Reading…' : 'Bring your City Key'}</button>
   <p className="muted">City Key or private journey bundle (JSON), or a soulbis Star snapshot (PNG)</p>
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
   <p className="muted">{appearance?.expiresAt ? 'Extension colours · temporary. ' : ''}Your orb unlocks your keys; the Swordsman Key says who you are, the City Key where you stand. The <a href="https://mages.city/star-key.html" target="_blank" rel="noopener noreferrer">Star Key ↗</a> (your VTA, in the browser) carries them and signs for you. Here the key lives in this browser.</p>
   <p role="alert" className="star-error">{error}</p>
  </section>}
 </div>;
}
