export declare enum IteratorStatus {
    Running = 0,
    End = 1,
    Crash = 2
}
export declare abstract class ControlledIterator<T> implements AsyncIterableIterator<T> {
    constructor();
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    next(): Promise<IteratorResult<T, any>>;
    return(): Promise<IteratorResult<T, any>>;
    end(): void;
    crash(error: any): void;
    get status(): IteratorStatus;
    protected abstract getNext(): Promise<T>;
    protected abstract onDispose(): void;
    protected error: any;
    private _status;
}
