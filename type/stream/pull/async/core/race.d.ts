import { Func } from "../../../../type";
export declare function race<T>(ss: Func<AsyncIterableIterator<T>>[]): AsyncGenerator<T, void, unknown>;
