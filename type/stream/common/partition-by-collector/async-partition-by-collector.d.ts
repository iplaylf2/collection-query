import { PartitionByCollectorBase } from "./partition-by-collector-base";
import { Selector, AsyncSelector } from "../../../type";
export declare class AsyncPartitionByCollector<T> extends PartitionByCollectorBase<T> {
    constructor(f: Selector<T, any> | AsyncSelector<T, any>);
    collect(x: T): Promise<[true, T[]] | [false]>;
    private readonly f;
}
