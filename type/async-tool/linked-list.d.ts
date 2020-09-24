export declare class LinkedList<T> {
    constructor();
    put(x: T): void;
    take(): T;
    get length(): number;
    private readonly head;
    private tail;
    private _length;
}
