export interface Source {
  _id: string;
  name: string;
  type: "api" | "webhook" | "manual" | "telegram";
  apiKey?: string;
  webhookUrl?: string;
  description?: string;
  config?: SourceConfig;
  isActive: boolean;
  leadsCount?: number;
  lastActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SourceConfig {
  rateLimit?: number;
  allowedIps?: string[];
  customFields?: Record<string, string>;
}

export interface CreateSourceDto {
  name: string;
  type: "api" | "webhook" | "manual" | "telegram";
  description?: string;
  webhookUrl?: string;
  config?: SourceConfig;
  isActive?: boolean;
}

export interface UpdateSourceDto {
  name?: string;
  type?: "api" | "webhook" | "manual" | "telegram";
  description?: string;
  webhookUrl?: string;
  config?: SourceConfig;
  isActive?: boolean;
}
