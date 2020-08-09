export declare abstract class PartitionByCollectorBase<T> {
    constructor();
    getRest(): [true, T[]] | [false];
    protected dispatch(key: any, x: T): [true, T[]] | [false];
    private partition;
    private start;
    private key;
}
