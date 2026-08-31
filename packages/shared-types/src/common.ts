export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiMeta {
  timestamp: string; // ISO 8601
  requestId: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiMeta["pagination"] & {
    total_pages?: number; // legacy compatibility
  };
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export enum HttpMethodEnum {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export enum OptimisticUpdateTypeEnum {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  CUSTOM = "custom",
}
