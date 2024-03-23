// stopwatch.js

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.running = false;
        this.timeWarp = 1;
    }

    start() {
        if (!this.running) {
            this.startTime = Date.now() - (this.elapsedTime / Math.abs(this.timeWarp));
            this.running = true;
        }
    }

    stop() {
        if (this.running) {
            this.elapsedTime = (Date.now() - this.startTime) * Math.abs(this.timeWarp);
            this.running = false;
        }
    }

    reset() {
        this.elapsedTime = 0;
        if (this.running) {
            this.start();
        }
    }

    getTime() {
        if (this.running) {
            return (Date.now() - this.startTime) * Math.abs(this.timeWarp);
        } else {
            return this.elapsedTime;
        }
    }
}

export { Stopwatch };
