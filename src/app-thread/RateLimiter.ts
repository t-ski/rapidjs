import { MODE } from "../bin/runtime";


// TODO: Assuming even distribution, limit is n * configured_limit; implement hash based distribution for n consistency?


type TRate<I> = Map<I, number>;


export class RateLimiter<I> {   // TODO: Shared memory or partitioned logic?

    private readonly limit: number;
    private readonly windowSize: number;

    private timePivot: number;
    private previousWindow: TRate<I>;
    private currentWindow: TRate<I> = new Map();

    constructor(limit: number = Infinity, windowSize = 60000) {
        this.limit = MODE.DEV ? Infinity : limit;
        this.windowSize = windowSize;

        this.shift();

        this.timePivot -= windowSize;

        setInterval(() => this.shift(), windowSize);
    }

    private shift() {
        this.timePivot = Date.now();
            
        this.previousWindow = this.currentWindow;
        this.currentWindow = new Map();
    }

    public grantsAccess(entityIdentifier: I): boolean {
        const currentHits: number = (this.currentWindow.get(entityIdentifier) ?? 0) + 1;
                
        this.currentWindow.set(entityIdentifier, currentHits);

        const currentWindowWeight: number = Math.min((Date.now() - this.timePivot) / this.windowSize, 1);
        const weightedHits: number
        = ((this.previousWindow.get(entityIdentifier) ?? 0) * (1 - currentWindowWeight))
        + (currentHits * currentWindowWeight);
        
        return (weightedHits <= this.limit);
    }
}

// Sliding window with peak adjustments?