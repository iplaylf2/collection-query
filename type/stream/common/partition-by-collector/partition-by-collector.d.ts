import { Selector } from "../../../type";
import { PartitionByCollectorBase } from "./partition-by-collector-base";
export declare class PartitionByCollector<T> extends PartitionByCollectorBase<T> {
    constructor(f: Selector<T, any>);
    collect(x: T): [true, T[]] | [false];
    private readonly f;
}
