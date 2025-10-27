import { NextResponse } from 'next/server';
import z, { ZodError } from 'zod';

export function getPaginationQuery(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function buildErrorResponse(error: Error | unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        errors: z.flattenError(error),
      },
      { status: 400 },
    );
  }
  return NextResponse.json(
    {
      error: 'Internal Server Error',
    },
    { status: 500 },
  );
}
