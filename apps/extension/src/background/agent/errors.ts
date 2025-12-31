export const LLM_FORBIDDEN_ERROR_MESSAGE =
  'Access denied (403 Forbidden). Please check:\n\n1. Your API key has the required permissions\n\n2. For Ollama: Set OLLAMA_ORIGINS=chrome-extension://* \nsee https://github.com/ollama/ollama/blob/main/docs/faq.md';

export const EXTENSION_CONFLICT_ERROR_MESSAGE = `
  Cannot access a chrome-extension:// URL of different extension.
  
  This is likely due to conflicting extensions. Please use scrapter in a new profile.`;

/**
 * Custom error class for chat model authentication errors
 */
export class ChatModelAuthError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ChatModelAuthError';
  }
}

export class ChatModelForbiddenError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ChatModelForbiddenError';
  }
}

export class ChatModelBadRequestError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ChatModelBadRequestError';
  }
}

export class RequestCancelledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestCancelledError';
  }
}

export class ExtensionConflictError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ExtensionConflictError';
  }
}

export class MaxStepsReachedError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MaxStepsReachedError';
  }
}

export class MaxFailuresReachedError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'MaxFailuresReachedError';
  }
}

export class ResponseParseError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ResponseParseError';
  }
}

/**
 * Checks if an error is related to API authentication
 */
export function isAuthenticationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const errorMessage = error.message || '';
  const errorName = error.name || (error.constructor?.name !== 'Error' ? error.constructor.name : '');

  if (errorName === 'AuthenticationError') return true;

  return (
    errorMessage.toLowerCase().includes('authentication') ||
    errorMessage.includes(' 401') ||
    errorMessage.toLowerCase().includes('api key')
  );
}

export function isForbiddenError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes(' 403') && error.message.includes('Forbidden');
}

export function isBadRequestError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const errorMessage = error.message || '';
  const errorName = error.name || (error.constructor?.name !== 'Error' ? error.constructor.name : '');

  if (errorName === 'BadRequestError') return true;

  return (
    errorMessage.includes(' 400') ||
    errorMessage.toLowerCase().includes('badrequest') ||
    errorMessage.includes('Invalid parameter')
  );
}

export function isAbortedError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === 'AbortError' || error.message.includes('Aborted');
}

export function isExtensionConflictError(error: unknown): boolean {
  const errorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return errorMessage.includes('cannot access a chrome-extension') && errorMessage.includes('of different extension');
}