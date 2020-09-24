export declare class AsyncBlock<T = void> {
    constructor();
    block(): void;
    unblock(x: T): void;
    get isBlock(): boolean;
    get wait(): Promise<T>;
    private resolveBlock;
    private _isBlock;
    private blockPromise;
}
