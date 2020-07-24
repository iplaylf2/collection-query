"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.race = void 0;
async function* race(ss) {
    if (ss.length === 0) {
        return;
    }
    const ii = ss.map((s) => s());
    const dispatcher = new RaceDispatcher(ii);
    while (true) {
        const [done, x] = await dispatcher.startRound();
        if (done) {
            return;
        }
        yield x;
    }
}
exports.race = race;
class RaceDispatcher {
    constructor(ii) {
        this.prepareRound();
        this.joinAll(ii);
    }
    static startRound(dispatcher, start) {
        let handleResult, handleError;
        const roundResult = new Promise((resolve, reject) => ((handleResult = resolve), (handleError = reject)));
        dispatcher.setRoundResult = handleResult;
        dispatcher.setRoundError = handleError;
        dispatcher.idle = true;
        start();
        return roundResult;
    }
    joinAll(ii) {
        this.count = ii.length;
        for (const i of ii) {
            this.join(i);
        }
    }
    async join(i) {
        while (true) {
            let x;
            try {
                x = await i.next();
            }
            catch (e) {
                this.crash(e);
                throw e;
            }
            const { done, value } = x;
            if (done) {
                this.leave();
                return;
            }
            await this.race(value);
        }
    }
    prepareRound() {
        let handle;
        this.roundStart = new Promise((resolve) => (handle = resolve));
        this.startRound = () => RaceDispatcher.startRound(this, handle);
    }
    async crash(e) {
        await this.costRound();
        this.setRoundError(e);
    }
    async leave() {
        this.count--;
        if (this.count === 0) {
            await this.costRound();
            this.setRoundResult([true]);
        }
    }
    async race(x) {
        await this.costRound();
        this.setRoundResult([false, x]);
    }
    async costRound() {
        while (true) {
            await this.roundStart;
            if (this.idle) {
                break;
            }
        }
        this.idle = false;
        this.prepareRound();
    }
}
