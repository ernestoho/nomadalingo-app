// Community guidelines enforcement.
//
// App Store Review Guideline 1.2 asks apps with user-generated content to
// provide "a method for filtering objectionable material from being posted".
// The filter itself lives in Postgres (see the content_filter migration) so a
// modified client cannot bypass it; this module only turns the resulting
// constraint violation into something a person can read.

/** Thrown when the database rejects text that breaks the community rules. */
export class ContentBlockedError extends Error {
  constructor() {
    super('content_blocked');
    this.name = 'ContentBlockedError';
  }
}

/** Postgres SQLSTATE for a violated CHECK constraint. */
export const CHECK_VIOLATION = '23514';

export function errorText(error: unknown, es: boolean, fallback: string): string {
  if (error instanceof ContentBlockedError) {
    return es
      ? 'Ese texto no cumple las normas de la comunidad. Prueba con otras palabras.'
      : "That text doesn't follow the community guidelines. Please reword it.";
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
