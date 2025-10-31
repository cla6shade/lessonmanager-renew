import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';
import { APIError } from '@/lib/errors';

export function getPaginationQuery(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Central error handler that converts errors to NextResponse
 * Handles APIError, ZodError, and unknown errors
 */
export function buildErrorResponse(error: Error | unknown) {
  // Handle APIError (AuthorizationError, BadRequestError, etc.)
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: error.statusCode },
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        errors: z.flattenError(error),
      },
      { status: 400 },
    );
  }

  // Log unexpected errors
  console.error('Unexpected error:', error);

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'Internal Server Error',
    },
    { status: 500 },
  );
}
