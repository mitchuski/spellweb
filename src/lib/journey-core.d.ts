export type JourneyKey = Record<string, any>;
export interface JourneyBundle { kind: 'agentprivacy.journey-bundle/1'; key: JourneyKey; packets: any[]; taskDocuments: any[]; }
export const BUNDLE_KIND: JourneyBundle['kind'];
export function canonicalJSON(value: unknown): string;
export function kappaOf(key: JourneyKey): Promise<string>;
export function stamp(key: JourneyKey): Promise<JourneyKey>;
export function packetProof(packet: any): Promise<string>;
export function checkPacket(packet: any,key: JourneyKey): Promise<unknown>;
export function createBundle(key: JourneyKey,packets?: any[],taskDocuments?: any[]): Promise<JourneyBundle>;
export function validateBundle(bundle: unknown): Promise<unknown>;
export function foldJourney(bundle: JourneyBundle,evidence: {packet?: any; taskDocument?: any}): Promise<{bundle:JourneyBundle;changed:boolean}>;
