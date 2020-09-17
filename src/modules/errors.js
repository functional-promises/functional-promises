const { inherits } = require('util');

inherits(FunctionalError, Error)

inherits(FunctionalUserError, FunctionalError)
inherits(FPCollectionError, FunctionalError)
inherits(FPUnexpectedError, FunctionalError)
inherits(FPInputError, FunctionalError)
inherits(FPTimeout, FunctionalError)

export function FunctionalError(msg, options) {
  if (!(this instanceof FunctionalError)) return new FunctionalError(...arguments)
  if (typeof msg === 'object') {
    options = msg
    if ( options.message ) msg = options.message
  }
  Error.call(this, msg)
  if (typeof msg === 'string') this.message = msg
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

export function FPCollectionError() {
  if (!(this instanceof FPCollectionError)) return new FPCollectionError(...arguments)
  FunctionalError.call(this, ...arguments)
}

export function FPTimeout() {
  if (!(this instanceof FPTimeout)) return new FPTimeout(...arguments)
  FunctionalError.call(this, ...arguments)
}


