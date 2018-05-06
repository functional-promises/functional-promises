class FunctionalError extends Error {
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
class FunctionalUserError extends FunctionalError {}
class FPUnexpectedError extends FunctionalError {}
class FPInputError extends FunctionalError {}
class FPSoftError extends FunctionalError {}
class FPTimeout extends FunctionalError {}

module.exports = {
  FunctionalError,
  FunctionalUserError,
  FPUnexpectedError,
  FPInputError,
  FPSoftError,
  FPTimeout,
}
