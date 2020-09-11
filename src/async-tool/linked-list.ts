export class LinkedList<T> {
  constructor() {
    this.head = {} as any;
    this.tail = this.head;
  }

  put(x: T) {
      
  }

  take(): T {}

  private head: LinkNode<T>;
  private tail: LinkNode<T>;
  private length: number;
}

interface LinkNode<T> {
  value: T;
  next?: LinkNode<T>;
}
