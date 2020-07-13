export default class AsyncPull<T> {
    constructor(s: () => AsyncIterableIterator<T>) {
      this[Symbol.asyncIterator] = s;
    }
    [Symbol.asyncIterator]: () => AsyncIterableIterator<T>;
  }
  