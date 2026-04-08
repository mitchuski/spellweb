/**
 * SwordsmanImport - Import swordsman identity from agentprivacy.ai
 *
 * Accepts JSON paste with:
 * - publicKeyHex: Ed25519 public key (64 hex chars)
 * - participantId: ap-{16hex}
 * - displayName: Optional name
 * - constellationPath: Emoji path from ceremony
 * - trustTier: blade | light | heavy | dragon
 */

import { useState } from 'react';
import { saveSwordsmanLink, getSwordsmanLink, type SwordsmanLink } from '../lib/mageIdentity';

interface SwordsmanImportProps {
  onImportComplete?: (link: SwordsmanLink) => void;
  onClose?: () => void;
}

export function SwordsmanImport({ onImportComplete, onClose }: SwordsmanImportProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleImport = () => {
    setError(null);
    setSuccess(false);

    try {
      const parsed = JSON.parse(input);

      // Validate required fields
      if (!parsed.publicKeyHex) {
        throw new Error('Missing publicKeyHex');
      }
      if (!parsed.participantId) {
        throw new Error('Missing participantId');
      }

      // Validate hex format (64 chars for Ed25519 public key)
      if (!/^[0-9a-f]{64}$/i.test(parsed.publicKeyHex)) {
        throw new Error('Invalid publicKeyHex format (expected 64 hex characters)');
      }

      // Validate participantId format (ap-{16hex})
      if (!/^ap-[0-9a-f]{16}$/i.test(parsed.participantId)) {
        throw new Error('Invalid participantId format (expected ap-{16hex})');
      }

      // Create SwordsmanLink
      const link: SwordsmanLink = {
        participantId: parsed.participantId,
        displayName: parsed.displayName || 'Unknown Swordsman',
        publicKeyHex: parsed.publicKeyHex,
        trustTier: parsed.trustTier || 'blade',
        constellationPath: parsed.constellationPath,
        linkedAt: new Date().toISOString(),
      };

      // Save to storage
      saveSwordsmanLink(link);
      setSuccess(true);
      setInput('');

      onImportComplete?.(link);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON format');
    }
  };

  const existingLink = getSwordsmanLink();

  return (
    <div style={{
      padding: 20,
      background: 'rgba(15, 15, 25, 0.98)',
      borderRadius: 16,
      border: '1px solid #333',
      maxWidth: 480,
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <h3 style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 600,
          color: '#e94560',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⚔️</span> Link Swordsman Identity
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 18,
              padding: 4,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {existingLink ? (
        <div style={{
          padding: 16,
          background: 'rgba(233, 69, 96, 0.1)',
          borderRadius: 12,
          border: '1px solid rgba(233, 69, 96, 0.3)',
          marginBottom: 16,
        }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            Currently linked:
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>⚔️</span>
            <div>
              <div style={{ color: '#e94560', fontWeight: 600 }}>
                {existingLink.displayName}
              </div>
              <div style={{
                fontSize: 11,
                fontFamily: '"JetBrains Mono", monospace',
                color: '#666',
              }}>
                {existingLink.participantId}
              </div>
              {existingLink.constellationPath && (
                <div style={{ fontSize: 14, marginTop: 4 }}>
                  {existingLink.constellationPath}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p style={{
          fontSize: 13,
          color: '#888',
          margin: '0 0 16px 0',
          lineHeight: 1.5,
        }}>
          Paste your agentprivacy.ai export to link your Swordsman identity.
          Blades forged here will be anchored to both identities.
        </p>
      )}

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`{
  "publicKeyHex": "...",
  "participantId": "ap-...",
  "displayName": "...",
  "constellationPath": "⚔️→✨→..."
}`}
        style={{
          width: '100%',
          minHeight: 120,
          padding: 12,
          background: 'rgba(30, 30, 45, 0.8)',
          border: '1px solid #444',
          borderRadius: 8,
          color: '#ccc',
          fontSize: 12,
          fontFamily: '"JetBrains Mono", monospace',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />

      {error && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: 'rgba(255, 100, 100, 0.1)',
          border: '1px solid rgba(255, 100, 100, 0.3)',
          borderRadius: 6,
          color: '#ff6666',
          fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: 'rgba(100, 255, 150, 0.1)',
          border: '1px solid rgba(100, 255, 150, 0.3)',
          borderRadius: 6,
          color: '#66ff99',
          fontSize: 12,
        }}>
          Swordsman identity linked successfully!
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 16,
      }}>
        {existingLink && (
          <button
            onClick={() => {
              // Clear existing link
              localStorage.removeItem('spellweb-swordsman-link');
              setSuccess(false);
              setError(null);
            }}
            style={{
              padding: '10px 16px',
              background: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              borderRadius: 8,
              color: '#ff6666',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            Unlink
          </button>
        )}
        <button
          onClick={handleImport}
          disabled={!input.trim()}
          style={{
            padding: '10px 20px',
            background: input.trim()
              ? 'linear-gradient(135deg, rgba(233, 69, 96, 0.3), rgba(233, 69, 96, 0.2))'
              : 'rgba(60, 60, 80, 0.3)',
            border: input.trim()
              ? '1px solid #e94560'
              : '1px solid #444',
            borderRadius: 8,
            color: input.trim() ? '#e94560' : '#666',
            fontSize: 13,
            fontWeight: 600,
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            fontFamily: '"JetBrains Mono", monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>⚔️</span>
          {existingLink ? 'Update Link' : 'Link Identity'}
        </button>
      </div>

      <div style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: '1px solid #333',
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
      }}>
        Export from{' '}
        <a
          href="https://agentprivacy.ai/ceremony"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#9b59b6' }}
        >
          agentprivacy.ai/ceremony
        </a>
      </div>
    </div>
  );
}

export default SwordsmanImport;
