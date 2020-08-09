export declare class PartitionCollector<T> {
    constructor(n: number);
    collect(x: T): [true, T[]] | [false];
    getRest(): [true, T[]] | [false];
    private readonly n;
    private partition;
}
