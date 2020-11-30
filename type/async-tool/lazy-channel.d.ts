export declare class LazyChannel<T> {
    constructor();
    put(x: T): Promise<boolean>;
    take(): Promise<[true] | [false, T]>;
    close(): void;
    private readonly buffer;
    private readonly putBlock;
    private readonly takeBlock;
    private _isClose;
}
