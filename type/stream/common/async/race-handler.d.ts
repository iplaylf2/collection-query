import { ControlledIterator } from "./controlled-iterator";
export declare class RaceHandler<T> extends ControlledIterator<T> {
    constructor(total: number);
    race(x: T): Promise<boolean>;
    leave(): void;
    protected getNext(): Promise<T>;
    protected onDispose(): void;
    private count;
    private readonly channel;
}
