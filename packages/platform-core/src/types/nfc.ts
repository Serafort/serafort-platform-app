export interface NfcCardEvent {
  uid: string;
  atr?: string;
  standard?: string;
  [key: string]: any;
}

export type ReaderStatus = 'disconnected' | 'waiting' | 'connected' | 'card_detected' | 'error';

export interface NfcVerificationResult {
  verified: boolean;
  reason?: string;
  payload?: any;
}

export interface NfcVerificationParams {
  uid: string;
  ctr: string;
  cmac: string;
}
