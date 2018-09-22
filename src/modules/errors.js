export class FunctionalError extends Error {
  constructor(msg, options) {
    if (typeof msg === 'object') {
      options = msg
      if ( msg.message ) msg = msg.message
    }
    super(msg)
    if (typeof options === 'object') {
      Object.getOwnPropertyNames(options)
        .forEach(key => {
          this[key] = options[key]
        })
    }
    this.name = this.constructor.name
    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor)
  }
}
export class FunctionalUserError extends FunctionalError {}
export class FPUnexpectedError extends FunctionalError {}
export class FPInputError extends FunctionalError {}
export class FPSoftError extends FunctionalError {}
export class FPTimeout extends FunctionalError {}
