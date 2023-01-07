#!/usr/bin/env node


import { join } from "path";
import { readFileSync } from "fs";
import { fork } from "child_process";

import { parseOption, parsePositional } from "../args";

import * as print from "./print";
import { proxyIPC } from "./proxy-ipc";


const providedCommand: string = parsePositional();

switch(providedCommand) {

    case "help":
        console.log(
            String(readFileSync(join(__dirname, "./_help.txt")))
            .replace(/(https?:\/\/[a-z0-9/._-]+)/ig, "\x1b[38;2;255;71;71m$1\x1b[0m")
        );
        break;
    
    case "start":
        embedApp();
        break;
        
    case "stop":
        unbedApp();
        break;
        
    case "monitor":
        // ...
        // TODO: Traverse tmp for socket files and check existence
        break;
        
    default:
        print.info(
            providedCommand
            ? `Unknown command '${providedCommand}'`
            : "No command provided"
        );

}


async function embedApp() {
    const hostname: string = parseOption("hostname", "H").string ?? "localhost";    // TODO: Intepret hostname protocol if provided
    const port: number = parseOption("port", "P").number ?? 80;    // TODO: HTTP or HTTPS (80, 443)
    
    try {
        if(!await proxyIPC(port, "hostname_available", hostname)) {
            print.info(`Hostname already in use on proxy ${hostname}:${port}`);

            return;
        }
    } catch {}

    const runSecure: boolean = false;   // TODO: Implement (CLI arg)
    // TODO: Optional HTTPS
    
    const embed = async () => {
        try {
            await proxyIPC(port, "embed", hostname);

            print.info(`Embedded application cluster at ${hostname}:${port}`);
        } catch(err) {
            print.info("Could not embed application to proxy:");
            print.error(err.message);
        }
    };
    
    try {
        if(await proxyIPC(port, "port_available")) {
            throw 0;
        }

        embed();
    } catch {
        const proxyProcess = fork(join(__dirname, "./server"), {
            detached: true
        });

        proxyProcess.on("message", async (message: string) => {
            if(message !== "listening") return;

            print.info(`HTTP${runSecure ? "S": ""} server proxy started listening on :${port}`);
            // TODO: handle errors, print.error(err.message);
            
            await embed();

            process.exit(0);
        });

        proxyProcess.send(JSON.stringify({
            port, runSecure
        }));
    }
}

async function unbedApp() {
    // TODO: IDs?

    const hostname: string = parseOption("hostname", "H").string ?? "localhost";
    const port: number = parseOption("port", "P").number ?? 80;    // TODO: HTTP or HTTPS (80, 443)
    
    try {
        if(!await proxyIPC(port, "unbed", hostname)) {
            print.info(`Hostname not registered on proxy ${hostname}:${port}`);

            return;
        }

        print.info(`Unbedded application cluster from ${hostname}:${port}`);
    } catch {
        print.info(`No server proxy listening on :${port}`);
    }
}