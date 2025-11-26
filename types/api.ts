export interface ApiResponse<T = undefined> {
  status: number;
  message: string;
  data: T;
  statusCode: number;
}

export interface ApiResponsePagePagination<T> {
  total: number;
  totalCount?: number;
  items: T;
}

export interface ApiResponsePagination<T> {
  nextCursor: string | null | undefined;
  previousCursor: string | null | undefined;
  items: T;
}

export interface ApiPaginationWithTotal<T> {
  nextCursor: string | null | undefined;
  previousCursor: string | null | undefined;
  items: T;
  total: number;
  unreadCount?: number;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  errors?: Record<string, any>;
}
