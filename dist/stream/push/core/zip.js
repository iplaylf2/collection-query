"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
const type_1 = require("../type");
function zip(ee, emit, expose) {
    const total = ee.length;
    if (!(0 < total)) {
        expose(() => { });
        emit(type_1.EmitType.Complete);
    }
    const linked_zip_start = new LinkedZip(total);
    const cancel_list = [];
    const cancel = function () {
        for (const c of cancel_list) {
            c();
        }
    };
    expose(cancel);
    let index = 0;
    for (const emitter of ee) {
        let linked_zip = linked_zip_start;
        if (linked_zip.isBroken) {
            break;
        }
        const _index = index;
        linked_zip.arrive(index);
        emitter((t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    {
                        const [full, result] = linked_zip.zip(_index, x);
                        if (full) {
                            emit(type_1.EmitType.Next, result);
                        }
                        const next_linked = linked_zip.arriveNext(_index);
                        if (next_linked.isBroken) {
                            if (next_linked.isAllArrival) {
                                emit(type_1.EmitType.Complete);
                            }
                            else {
                                cancel_list[_index]();
                            }
                        }
                        else {
                            linked_zip = next_linked;
                        }
                    }
                    break;
                case type_1.EmitType.Complete:
                    {
                        const check_in_list = linked_zip.break();
                        if (linked_zip.isAllArrival) {
                            emit(type_1.EmitType.Complete);
                        }
                        else {
                            for (const i of check_in_list) {
                                cancel_list[i]();
                            }
                        }
                    }
                    break;
                case type_1.EmitType.Error:
                    emit(type_1.EmitType.Error, x);
                    break;
            }
        }, (c) => cancel_list.push(c));
        index++;
    }
}
exports.zip = zip;
class LinkedZip {
    constructor(total) {
        this.total = total;
        this.arrivalList = [];
        this.zipContent = new Array(total);
        this._isBroken = false;
        this.zipCount = 0;
    }
    arrive(i) {
        this.arrivalList.push(i);
    }
    zip(i, x) {
        this.zipContent[i] = x;
        this.zipCount++;
        return [(this.zipCount === this.total), this.zipContent];
    }
    arriveNext(i) {
        if (!this.next) {
            this.next = new LinkedZip(this.total);
        }
        this.next.arrive(i);
        return this.next;
    }
    break() {
        this._isBroken = true;
        this.zipContent = null;
        this.next = null;
        return this.arrivalList;
    }
    get isBroken() {
        return this._isBroken;
    }
    get isAllArrival() {
        return this.arrivalList.length === this.total;
    }
}
