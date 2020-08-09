import { IterateItem } from "../../pull/type";
export declare enum RaceDispatcherStatus {
    Active = 0,
    Pending = 1,
    Crash = 2
}
export declare class RaceDispatcher<T> {
    constructor(total: number);
    race(x: T): Promise<void>;
    leave(): void;
    crash(e: any): void;
    next(): Promise<IterateItem<T>>;
    getStatus(): RaceDispatcherStatus;
    private pending;
    private alreadyCrash;
    private unblock;
    private setNextResult;
    private setNextError;
    private count;
    private error;
    private status;
    private blockPromise;
    private nextPromise;
}
