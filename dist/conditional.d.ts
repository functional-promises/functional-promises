export default function conditional(FP: any): {
    tapIf: (cond: any, ifTrue: any, ifFalse: any, ...args: any[]) => any;
    thenIf: (cond: any, ifTrue: any, ifFalse: any, ...args: any[]) => any;
    _thenIf: (cond?: (x: any) => any, ifTrue?: (x: any) => any, ifFalse?: () => null, returnValue?: boolean) => (value: any) => any;
};
