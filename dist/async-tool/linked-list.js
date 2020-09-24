"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedList = void 0;
class LinkedList {
    constructor() {
        const tail = {};
        this.head = { next: tail };
        this.tail = tail;
        this._length = 0;
    }
    put(x) {
        const tail = {};
        this.tail.value = x;
        this.tail.next = tail;
        this.tail = tail;
        this._length++;
    }
    take() {
        if (0 < this._length) {
            const current = this.head.next;
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
}
exports.LinkedList = LinkedList;
