import { NextResponse } from 'next/server';

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return String(err);
}

// Logs the real error server-side always, but only reflects internal error
// detail (DB/library messages) back to the client outside production so we
// don't leak schema/infra details to attackers probing the live API.
export function errorResponse(err: unknown, status: number, publicMessage: string, context?: string) {
  console.error(context ? `[${context}]` : '[api-error]', getErrorMessage(err));
  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? publicMessage : (getErrorMessage(err) || publicMessage);
  return NextResponse.json({ error: message }, { status });
}
