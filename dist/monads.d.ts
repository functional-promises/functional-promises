export default function monads(FP: any): {
    chain: () => any;
    chainEnd: () => (input: any) => any;
};
