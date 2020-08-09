import { IterateItem } from "../../pull/type";
export declare enum ZipCollectorStatus {
    Active = 0,
    Pending = 1,
    End = 2,
    Crash = 3
}
export declare class ZipCollector<T> {
    constructor(total: number);
    zip(i: number, x: T): Promise<void>;
    leave(): void;
    crash(e: any): void;
    next(): Promise<IterateItem<T[]>>;
    getStatus(): ZipCollectorStatus;
    private alreadyCrash;
    private unblock;
    private setNextResult;
    private setNextError;
    private readonly total;
    private count;
    private content;
    private error;
    private status;
    private blockPromise;
    private nextPromise;
}
