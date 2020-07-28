export class FunctionalError extends Error {
  message: string;

  [name: string]: any;

  constructor(message: string, options?: { [name: string]: any }) {
    super(typeof message === "string" ? message : undefined);
    if (options && options.message)
      message = options.message;
    if (typeof options === 'object') {
      Object.getOwnPropertyNames(options)
        .forEach(key => {
          this[key] = options[key];
        });
    }
    this.name = this.constructor.name;
    this.message = message ?? '';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this);
  }
}

export class FunctionalUserError extends FunctionalError { }

export class FPUnexpectedError extends FunctionalError { }

export class FPInputError extends FunctionalError { }

export class FPSoftError extends FunctionalError { }

export class FPTimeout extends FunctionalError { }


