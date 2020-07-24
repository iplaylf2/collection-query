"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
async function* zip(ss) {
    if (ss.length === 0) {
        return;
    }
    const ii = ss.map((s) => s());
    const zipCollector = new ZipCollector(ii);
    while (true) {
        const [done, x] = await zipCollector.startRound();
        if (done) {
            return;
        }
        yield x;
    }
}
exports.zip = zip;
class ZipCollector {
    constructor(ii) {
        this.ii = ii;
        this.total = ii.length;
        this.close = false;
    }
    startRound() {
        let handleResult, handleError;
        const roundResult = new Promise((resolve, reject) => ((handleResult = resolve), (handleError = reject)));
        this.setRoundResult = handleResult;
        this.setRoundError = handleError;
        this.count = 0;
        let index = 0;
        for (const _ of this.ii) {
            this.collect(index);
            index++;
        }
        return roundResult;
    }
    async collect(index) {
        let x;
        try {
            x = await this.ii[index].next();
        }
        catch (e) {
            this.crash(e);
            throw e;
        }
        const { done, value } = x;
        if (done) {
            this.over();
            return;
        }
        this.zip(index, value);
    }
    crash(e) {
        if (this.close) {
            return;
        }
        this.close = true;
        this.setRoundError(e);
    }
    over() {
        if (this.close) {
            return;
        }
        this.close = true;
        this.setRoundResult([true]);
    }
    zip(index, x) {
        if (this.close) {
            return;
        }
        this.zipContent[index] = x;
        this.count++;
        if (this.count === this.total) {
            this.setRoundResult([false, this.zipContent]);
        }
    }
}
