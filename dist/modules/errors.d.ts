export declare class FunctionalError extends Error {
    message: string;
    [name: string]: any;
    constructor(message: string, options?: {
        [name: string]: any;
    });
}
export declare class FunctionalUserError extends FunctionalError {
}
export declare class FPUnexpectedError extends FunctionalError {
}
export declare class FPInputError extends FunctionalError {
}
export declare class FPSoftError extends FunctionalError {
}
export declare class FPTimeout extends FunctionalError {
}
