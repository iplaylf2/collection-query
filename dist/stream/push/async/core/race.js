"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.race = void 0;
const type_1 = require("../../type");
function race(ee, emit) {
    if (ee.length === 0) {
        emit(type_1.EmitType.Complete);
        return () => { };
    }
    const raceDispatch = new RaceDispatch(ee, emit);
    raceDispatch.start();
    return raceDispatch.cancel.bind(raceDispatch);
}
exports.race = race;
class RaceDispatch {
    constructor(ee, emit) {
        this.ee = ee;
        this.emit = emit;
        this.cancelList = [];
        this.count = this.ee.length;
    }
    start() {
        for (const emitter of this.ee) {
            const receiver = this.join.bind(this);
            const cancel = emitter(receiver);
            this.cancelList.push(cancel);
        }
    }
    cancel() {
        for (const cancel of this.cancelList) {
            cancel();
        }
    }
    async join(...[t, x]) {
        switch (t) {
            case type_1.EmitType.Next:
                await this.handleNext(x);
                break;
            case type_1.EmitType.Complete:
                this.handleComplete();
                break;
            case type_1.EmitType.Error:
                this.handleError(x);
                break;
        }
    }
    async handleNext(x) {
        await this.emit(type_1.EmitType.Next, x);
    }
    handleComplete() {
        this.count--;
        if (this.count === 0) {
            this.emit(type_1.EmitType.Complete);
        }
    }
    handleError(x) {
        this.cancel();
        this.emit(type_1.EmitType.Error, x);
    }
}
