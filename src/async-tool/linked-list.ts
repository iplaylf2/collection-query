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
    if (0 < this._length) {
      const current = this.head.next!;
      const x = current.value;
      this.head.next = current.next;
      this._length--;
      return x;
    }
    throw "empty";
  }

  dump(): T[] {
    const all = new Array(this._length);

    let current = this.head.next!;
    for (let i = 0; i < this._length; i++) {
      const x = current.value;
      all[i] = x;
      current = current.next!;
    }
    this.head.next = current;
    this._length = 0;

    return all;
  }

  get length() {
    return this._length;
  }

  private readonly head: LinkNode<T>;
  private tail: LinkNode<T>;
  private _length: number;
}

interface LinkNode<T> {
  value: T;
  next?: LinkNode<T>;
}
