// lib/api-response.ts
// Standard API response envelope: { data, error, meta }
// All API routes MUST use these factory functions for consistency.

import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  totalPages?: number
  [key: string]: unknown
}

export interface ApiSuccess<T> {
  data: T
  error: null
  meta: ApiMeta | null
}

export interface ApiError {
  data: null
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: null
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ---------------------------------------------------------------------------
// HTTP STATUS CODE MAP
// ---------------------------------------------------------------------------

const HTTP_STATUS: Record<string, number> = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
}

// ---------------------------------------------------------------------------
// FACTORY FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Create a successful API response.
 * @param data - The response payload
 * @param meta - Optional pagination/metadata
 * @param status - HTTP status code (default: 200)
 */
export function success<T>(
  data: T,
  meta: ApiMeta | null = null,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { data, error: null, meta },
    { status }
  )
}

/**
 * Create a created (201) API response.
 */
export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return success(data, null, HTTP_STATUS.CREATED)
}

/**
 * Create an error API response.
 * @param code - Machine-readable error code (e.g., 'VALIDATION_ERROR')
 * @param message - Human-readable error message
 * @param details - Optional additional error context (e.g., Zod errors)
 * @param status - HTTP status code (default: 400)
 */
export function error(
  code: string,
  message: string,
  details?: unknown,
  status: number = 400
): NextResponse<ApiError> {
  return NextResponse.json(
    { data: null, error: { code, message, details: details ?? null }, meta: null },
    { status }
  )
}

export function notFound(resource: string = 'Resource'): NextResponse<ApiError> {
  return error('NOT_FOUND', `${resource} not found`, undefined, 404)
}

export function unauthorized(): NextResponse<ApiError> {
  return error('UNAUTHORIZED', 'Authentication required', undefined, 401)
}

export function forbidden(): NextResponse<ApiError> {
  return error('FORBIDDEN', 'Insufficient permissions', undefined, 403)
}

export function validationError(details: unknown): NextResponse<ApiError> {
  return error('VALIDATION_ERROR', 'Request validation failed', details, 422)
}

export function internalError(message: string = 'An unexpected error occurred'): NextResponse<ApiError> {
  return error('INTERNAL_ERROR', message, undefined, 500)
}

export function rateLimited(): NextResponse<ApiError> {
  return error('RATE_LIMITED', 'Too many requests. Please try again later.', undefined, 429)
}
