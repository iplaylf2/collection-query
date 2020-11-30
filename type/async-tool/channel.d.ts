export declare class Channel<T> {
    constructor(limit?: number);
    put(x: T): boolean;
    take(): Promise<[true] | [false, T]>;
    dump(): Promise<[true] | [false, T[]]>;
    close(): void;
    get limit(): number;
    get length(): number;
    get isClose(): boolean;
    private _limit;
    private readonly buffer;
    private readonly takeBlock;
    private _isClose;
}
