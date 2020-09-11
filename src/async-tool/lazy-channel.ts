export class LazyChannel<T> {
  async put(x: T): Promise<boolean> {
    begin: {
    }
    throw "never";
  }

  async take(): Promise<[true] | [false, T]> {
    begin: {
    }
    throw "never";
  }
}
