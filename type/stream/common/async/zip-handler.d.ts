import { ControlledIterator } from "./controlled-iterator";
export declare class ZipHandler<T> extends ControlledIterator<T[]> {
    constructor(total: number);
    zip(i: number, x: T): Promise<boolean>;
    protected getNext(): Promise<T[]>;
    protected onDispose(): void;
    private readonly total;
    private count;
    private readonly content;
    private readonly channel;
    private readonly zipBlock;
}
