"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
const type_1 = require("../type");
function zip(ee, emit) {
    const total = ee.length;
    if (!(total > 0)) {
        emit(type_1.EmitType.Complete);
        return () => { };
    }
    const cancel_list = new Array(total);
    const linked_zip_start = new LinkedZip(total);
    let index = 0;
    for (const emitter of ee) {
        let linked_zip = linked_zip_start;
        linked_zip.checkIn(index);
        const _index = index;
        const cancel = emitter((t, x) => {
            switch (t) {
                case type_1.EmitType.Next:
                    {
                        const [full, result] = linked_zip.zip(_index, x);
                        if (full) {
                            emit(type_1.EmitType.Next, result);
                        }
                        const [status, next_linked] = linked_zip.getNext(_index);
                        switch (status) {
                            case LinkedZipStatus.Active:
                                linked_zip = next_linked;
                                break;
                            case LinkedZipStatus.Broken:
                                cancel_list[_index]();
                                break;
                            case LinkedZipStatus.Inactive:
                                cancel_list[_index]();
                                emit(type_1.EmitType.Complete);
                                break;
                        }
                    }
                    break;
                case type_1.EmitType.Complete:
                    {
                        const [full, check_in_list] = linked_zip.break();
                        for (const i of check_in_list) {
                            cancel_list[i]();
                        }
                        if (full) {
                            emit(type_1.EmitType.Complete);
                        }
                    }
                    break;
                case type_1.EmitType.Error:
                    cancel();
                    emit(type_1.EmitType.Error, x);
                    break;
            }
        });
        cancel_list[index] = cancel;
        index++;
    }
    const cancel = function () {
        for (const c of cancel_list) {
            c();
        }
    };
    return cancel;
}
exports.zip = zip;
class LinkedZip {
    constructor(total) {
        this.total = total;
        this.checkInList = [];
        this.broken = false;
        this.zipContent = [];
        this.zipCount = 0;
    }
    checkIn(i) {
        this.checkInList.push(i);
    }
    zip(i, x) {
        this.zipContent[i] = x;
        this.zipCount++;
        return [(this.zipCount === this.total), this.zipContent];
    }
    getNext(i) {
        if (!this.next) {
            this.next = new LinkedZip(this.total);
        }
        this.next.checkIn(i);
        let status;
        if (this.broken) {
            if (this.isAllCheckIn()) {
                status = LinkedZipStatus.Inactive;
            }
            else {
                status = LinkedZipStatus.Broken;
            }
        }
        else {
            status = LinkedZipStatus.Active;
        }
        return [status, this.next];
    }
    break() {
        this.broken = true;
        this.zipContent = null;
        this.next = null;
        return [this.isAllCheckIn(), this.checkInList];
    }
    isAllCheckIn() {
        return this.checkInList.length === this.total;
    }
}
var LinkedZipStatus;
(function (LinkedZipStatus) {
    LinkedZipStatus[LinkedZipStatus["Active"] = 0] = "Active";
    LinkedZipStatus[LinkedZipStatus["Broken"] = 1] = "Broken";
    LinkedZipStatus[LinkedZipStatus["Inactive"] = 2] = "Inactive";
})(LinkedZipStatus || (LinkedZipStatus = {}));
