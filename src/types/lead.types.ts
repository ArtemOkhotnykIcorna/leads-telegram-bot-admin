export interface Lead {
  _id: string;
  externalId?: string;
  sourceId: string;
  countryId?: string;
  directionId?: string;
  groupId?: string;

  // Contact info
  name?: string;
  phone?: string;
  email?: string;

  // Lead data
  data: Record<string, unknown>;

  // Status
  status: LeadStatus;
  statusHistory: LeadStatusHistory[];

  // Telegram
  telegramMessageId?: number;
  telegramChatId?: string;

  // Timestamps
  receivedAt: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;

  // Populated fields
  source?: {
    _id: string;
    name: string;
  };
  country?: {
    _id: string;
    name: string;
    code: string;
    flag?: string;
  };
  direction?: {
    _id: string;
    name: string;
  };
  group?: {
    _id: string;
    name: string;
  };
}

export type LeadStatus =
  | "new"
  | "pending"
  | "processing"
  | "sent"
  | "delivered"
  | "failed"
  | "rejected"
  | "duplicate";

export interface LeadStatusHistory {
  status: LeadStatus;
  timestamp: string;
  message?: string;
}

export interface LeadsFilter {
  page?: number;
  limit?: number;
  sourceId?: string;
  countryId?: string;
  directionId?: string;
  groupId?: string;
  status?: LeadStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface LeadsResponse {
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadStats {
  total: number;
  pending: number;
  processing: number;
  sent: number;
  delivered: number;
  failed: number;
  rejected: number;
  todayTotal: number;
  todaySent: number;
}
