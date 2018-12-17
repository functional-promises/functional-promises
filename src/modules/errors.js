export function FunctionalError(msg, options) {
  if (!(this instanceof FunctionalError)) return new FunctionalError(...arguments)
  if (typeof msg === 'object') {
    options = msg
    if ( msg.message ) msg = msg.message
  }
  Error.call(this, msg)
  if (typeof options === 'object') {
    Object.getOwnPropertyNames(options)
      .forEach(key => {
        this[key] = options[key]
      })
  }
  this.name = this.constructor.name
  // Capturing stack trace, excluding constructor call from it.
  Error.captureStackTrace(this)
}

export function FunctionalUserError() {
  if (!(this instanceof FunctionalUserError)) return new FunctionalUserError(...arguments)
  FunctionalError.call(this, ...arguments)
}

export function FPUnexpectedError() {
  if (!(this instanceof FPUnexpectedError)) return new FPUnexpectedError(...arguments)
  FunctionalError.call(this, ...arguments)
}

export function FPInputError() {
  if (!(this instanceof FPInputError)) return new FPInputError(...arguments)
  FunctionalError.call(this, ...arguments)
}

export function FPSoftError() {
  if (!(this instanceof FPSoftError)) return new FPSoftError(...arguments)
  FunctionalError.call(this, ...arguments)
}

export function FPTimeout() {
  if (!(this instanceof FPTimeout)) return new FPTimeout(...arguments)
  FunctionalError.call(this, ...arguments)
}


