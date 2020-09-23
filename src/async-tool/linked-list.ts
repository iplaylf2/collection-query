export class LinkedList<T> {
  constructor() {
    const tail = {} as any;
    this.head = { next: tail } as any;
    this.tail = tail;
    this._length = 0;
  }

  put(x: T) {
    const tail = {} as any;
    this.tail.value = x;
    this.tail.next = tail;
    this.tail = tail;
    this._length++;
  }

  take(): T {
    if (this._length > 0) {
      const current = this.head.next!;
      const x = current.value;
      this.head.next = current.next;
      this._length--;
      return x;
    }
    throw "empty";
  }

  get length() {
    return this._length;
  }

  private head: LinkNode<T>;
  private tail: LinkNode<T>;
  private _length: number;
}

interface LinkNode<T> {
  value: T;
  next?: LinkNode<T>;
}
