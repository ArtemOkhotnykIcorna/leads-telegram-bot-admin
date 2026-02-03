// Admin types (export first to avoid conflicts)
export * from "./admin.types";

// Auth types
export {
  type LoginRequest,
  type LoginResponse,
  type RefreshRequest,
  type RefreshResponse,
} from "./auth.types";

// Country types
export * from "./country.types";

// Direction types
export * from "./direction.types";

// Group types
export * from "./group.types";

// Source types
export * from "./source.types";

// Routing types
export * from "./routing.types";

// Lead types
export * from "./lead.types";

// Payment types
export * from "./payment.types";

// Subscription Plan types
export * from "./subscription-plan.types";

// Analytics types
export * from "./analytics.types";

// User types
export * from "./user.types";

// Bot Message types
export * from "./bot-message.types";

// Common types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
