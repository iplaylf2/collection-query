"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
const type_1 = require("../type");
function zip(ee, emit) {
    if (ee.length === 0) {
        emit(type_1.EmitType.Complete);
        return () => { };
    }
    const zipCollector = new ZipCollector(ee, emit);
    zipCollector.start();
    return zipCollector.cancel.bind(zipCollector);
}
exports.zip = zip;
class ZipCollector {
    constructor(ee, emit) {
        this.ee = ee;
        this.emit = emit;
        this.cancelList = [];
    }
    start() {
        const linkedZip = new LinkedZip(this.ee.length);
        let index = 0;
        for (const emitter of this.ee) {
            linkedZip.checkIn(index);
            const receiver = this.collect(index, linkedZip);
            const cancel = emitter(receiver);
            this.cancelList.push(cancel);
        }
    }
    cancel() {
        for (const cancel of this.cancelList) {
            cancel();
        }
    }
    collect(index, linkedZip) {
        return (t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    linkedZip = this.handleNext(index, linkedZip, x);
                    break;
                case type_1.EmitType.Complete:
                    this.handleComplete(linkedZip);
                    break;
                case type_1.EmitType.Error:
                    this.handleError(x);
                    break;
            }
        };
    }
    handleNext(index, linkedZip, x) {
        const [full, content] = linkedZip.zip(index, x);
        if (full) {
            this.emit(type_1.EmitType.Next, content);
        }
        linkedZip = linkedZip.getNext();
        linkedZip.checkIn(index);
        if (linkedZip.broken) {
            this.cancelList[index]();
            if (linkedZip.isAllCheckIn()) {
                this.emit(type_1.EmitType.Complete);
            }
        }
        return linkedZip;
    }
    handleComplete(linkedZip) {
        const [full, checkInList] = linkedZip.break();
        for (const index of checkInList) {
            this.cancelList[index]();
        }
        if (full) {
            this.emit(type_1.EmitType.Complete);
        }
    }
    handleError(x) {
        this.cancel();
        this.emit(type_1.EmitType.Error, x);
    }
}
class LinkedZip {
    constructor(total) {
        this.total = total;
        this.checkInList = [];
        this.broken = false;
        this.zipContent = [];
        this.zipCount = 0;
    }
    checkIn(index) {
        this.checkInList.push(index);
    }
    zip(index, x) {
        this.zipContent[index] = x;
        this.zipCount++;
        return [this.zipCount === this.total, this.zipContent];
    }
    getNext() {
        if (!this.next) {
            this.next = new LinkedZip(this.total);
        }
        return this.next;
    }
    isAllCheckIn() {
        return this.checkInList.length === this.total;
    }
    break() {
        this.broken = true;
        this.next = null;
        return [this.isAllCheckIn(), this.checkInList];
    }
}
