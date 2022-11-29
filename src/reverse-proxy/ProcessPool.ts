import { ChildProcess, fork } from "child_process";
import { Socket } from "net";

import { ISpaceEnv } from "../interfaces";
import { WorkerPool } from "../WorkerPool";
import * as print from "../print";


export class ChildProcessPool extends WorkerPool<Socket, void> {

    private readonly childProcessModulePath: string;
    private readonly env: ISpaceEnv;

    constructor(childProcessModulePath: string, env: ISpaceEnv, baseSize?: number, timeout?: number, maxPending?: number) { // TODO: Define
        super(baseSize, timeout, maxPending);

        this.childProcessModulePath = childProcessModulePath;
        this.env = env;
    }
    
    protected createWorker(): ChildProcess {
        const childProcess = fork(this.childProcessModulePath, {
            cwd: process.cwd(), // TODO: Set according to project
            detached: false,
            silent: true,
            env: {
                MODE: JSON.stringify(this.env.MODE),
                PATH: this.env.PATH
            }
        });

		childProcess.stdout.on("data", (message: Buffer) => {
			print.info(String(message).replace(/\n$/, ""));
		});
		childProcess.stderr.on("data", (err: Buffer) => {
			print.error(String(err));
		});
        
        childProcess.on("message", (message: string) => {
            if(message !== "done") {
                return;
            }

            this.deactivateWorker(childProcess, null);
        });
        
        return childProcess;
    }
    
    protected activateWorker(childProcess: ChildProcess, socket: Socket) {
        childProcess.send("deploy-response", socket);
    }

}