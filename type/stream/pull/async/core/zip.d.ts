import { Func } from "../../../../type";
export declare function zip<T>(ss: Func<AsyncIterableIterator<T>>[]): AsyncGenerator<T[], void, unknown>;
