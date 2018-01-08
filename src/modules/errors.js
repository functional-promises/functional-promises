class FunctionalError extends Error {
  constructor(msg, options) {
    if (typeof msg === 'object' && msg.message) {
      options = msg
      msg = msg.message
    }
    super(msg)
    if (typeof options === 'object') {
      Object.assign(this, options)
    }
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
