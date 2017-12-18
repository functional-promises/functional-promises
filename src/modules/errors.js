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
class FRUnexpectedError extends FunctionalError {}
class FRInputError extends FunctionalError {}
class FRSoftError extends FunctionalError {}
class FRTimeout extends FunctionalError {}

module.exports = {
  FunctionalError,
  FunctionalUserError,
  FRUnexpectedError,
  FRInputError,
  FRSoftError,
  FRTimeout,
}
