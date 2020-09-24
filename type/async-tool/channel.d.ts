export declare class Channel<T> {
    constructor(limit?: number);
    put(x: T): Promise<boolean>;
    take(): Promise<[true] | [false, T]>;
    close(): void;
    get limit(): number;
    get length(): number;
    get isClose(): boolean;
    private _limit;
    private readonly buffer;
    private readonly putBlock;
    private readonly takeBlock;
    private _isClose;
}
