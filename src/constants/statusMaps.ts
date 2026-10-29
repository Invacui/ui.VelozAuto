import type { BuyRequestStatus } from '@/types/buyRequest.types';
import type { SellRequestStatus } from '@/types/sellRequest.types';

type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger';

export const BUY_REQUEST_STATUS_LABELS: Record<BuyRequestStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  TEST_DRIVE_SCHEDULED: 'Test Drive Scheduled',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed — Won',
  CLOSED_LOST: 'Closed — Lost',
};

export const BUY_REQUEST_STATUS_TONE: Record<BuyRequestStatus, Tone> = {
  NEW: 'info',
  CONTACTED: 'info',
  TEST_DRIVE_SCHEDULED: 'warning',
  NEGOTIATION: 'warning',
  CLOSED_WON: 'success',
  CLOSED_LOST: 'danger',
};

export const BUY_REQUEST_STATUS_FLOW: BuyRequestStatus[] = [
  'NEW',
  'CONTACTED',
  'TEST_DRIVE_SCHEDULED',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
];

export const SELL_REQUEST_STATUS_LABELS: Record<SellRequestStatus, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  INSPECTION_SCHEDULED: 'Inspection Scheduled',
  INSPECTED: 'Inspected',
  OFFER_MADE: 'Offer Made',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  NEGOTIATING: 'Negotiating',
  LISTED: 'Listed',
  CLOSED: 'Closed',
};

export const SELL_REQUEST_STATUS_TONE: Record<SellRequestStatus, Tone> = {
  SUBMITTED: 'info',
  UNDER_REVIEW: 'info',
  INSPECTION_SCHEDULED: 'warning',
  INSPECTED: 'warning',
  OFFER_MADE: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
  NEGOTIATING: 'warning',
  LISTED: 'success',
  CLOSED: 'default',
};

export const SELL_REQUEST_STATUS_FLOW: SellRequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'INSPECTION_SCHEDULED',
  'INSPECTED',
  'OFFER_MADE',
  'ACCEPTED',
  'LISTED',
  'CLOSED',
];

export type { Tone };
