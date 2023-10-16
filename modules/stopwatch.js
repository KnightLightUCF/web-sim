// stopwatch.js

class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.running = false;
    }

    start() {
        if (!this.running) {
            this.startTime = Date.now() - this.elapsedTime;
            this.running = true;
        }
    }

    stop() {
        if (this.running) {
            this.elapsedTime = Date.now() - this.startTime;
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
            return Date.now() - this.startTime;
        } else {
            return this.elapsedTime;
        }
    }
}

export { Stopwatch };
