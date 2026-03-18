type ErrorOptions = {
  message?: string
  [key: string]: unknown
}

function normalizeMessage(messageOrOptions?: string | ErrorOptions): {
  message?: string
  options?: ErrorOptions
} {
  if (typeof messageOrOptions === 'object' && messageOrOptions) {
    return {
      message: messageOrOptions.message,
      options: messageOrOptions,
    }
  }

  return {
    message: typeof messageOrOptions === 'string' ? messageOrOptions : undefined,
    options: undefined,
  }
}

function assignOptions(target: Record<string, unknown>, options?: ErrorOptions): void {
  if (!options) {
    return
  }

  Object.keys(options).forEach((key) => {
    target[key] = options[key]
  })
}

export class FunctionalError extends Error {
  [key: string]: unknown

  constructor(messageOrOptions?: string | ErrorOptions, options?: ErrorOptions) {
    const normalized = normalizeMessage(messageOrOptions)
    super(normalized.message)

    if (normalized.message) {
      this.message = normalized.message
    }

    this.name = new.target.name
    assignOptions(this, normalized.options ?? options)

    Error.captureStackTrace?.(this, new.target)
  }
}

export class FunctionalUserError extends FunctionalError {}
export class FPCollectionError extends FunctionalError {}
export class FPUnexpectedError extends FunctionalError {}
export class FPInputError extends FunctionalError {}
export class FPTimeout extends FunctionalError {}
