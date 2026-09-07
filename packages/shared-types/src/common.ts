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

/**
 * True when the value is a plain object with no own enumerable keys.
 *
 * Lives in Tier 0 because it is a dependency-free predicate used by the
 * layout engine and by route guards alike; keeping it in the platform facade
 * forced lower tiers to import upward just to null-check a user object.
 */
export const isObjectEmpty = (objectName: object): boolean => {
  return (
    !!objectName &&
    Object.keys(objectName).length === 0 &&
    objectName.constructor === Object
  );
};
