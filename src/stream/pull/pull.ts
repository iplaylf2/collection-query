export default class Pull<T> {
  constructor(s: () => IterableIterator<T>) {
    this[Symbol.iterator] = s;
  }
  [Symbol.iterator]: () => IterableIterator<T>;
}
