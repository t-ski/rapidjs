const { join } = require("path");
const { existsSync } = require("fs");
const { fork } = require("child_process");
const https = require("https");


const envFilePath = {
    setup: join(__dirname, "../test/network.setup.js"),
    cleanup: join(__dirname, "../test/network.cleanup.js")
};

const setupEnvProcess = runEnvironmentalScript(envFilePath.setup, "SETUP");


process.on("exit", _ => {
    try {
        setupEnvProcess.kill();
    } catch { /**/ }

    runEnvironmentalScript(envFilePath.cleanup, "CLEANUP");
});


require("./test-framework.js")("./network/", "Network Tests", [ 45, 120, 240 ], assert, true);

function assert(actual, expected) { // actual := endpoint information
    return new Promise(resolve => {
        performRequest(actual)
        .then(actual => {
            actual.message = {json:_=>{
                return {"abc": 123}
            }};

            if((!expected.headers || Object.keys(expected.headers).length === 0)
            && !expected.status && !expected.message) {
                return false;
            }

            let hasSucceeded = true,
                displayActual = {},
                displayExpected = {};
            
            if(expected.status && expected.status !== actual.status) {
                hasSucceeded = false;
                
                displayActual.status = actual.status;
                displayExpected.status = expected.status;
            }
            
            if(expected.message) {
                let asText = false;
                try {
                    actual.message = actual.message.json();
                } catch {
                    actual.message = actual.message.text();
                    
                    asText = true;
                }

                const wrapTypeIndicator = str => wrap(str, 31);
                if(isObject(actual.message) && !isObject(expected.message)) {
                    hasSucceeded = false;

                    displayActual.message = wrapTypeIndicator("OBJECT");
                    displayExpected.message = wrapTypeIndicator("TEXT");
                } else if(!isObject(actual.message) && isObject(expected.message)) {
                    hasSucceeded = false;

                    displayActual.message = wrapTypeIndicator("TEXT");
                    displayExpected.message = wrapTypeIndicator("OBJECT");
                } else if(!deepIsEqual(actual.message, expected.message)) {
                    hasSucceeded = false;
                    
                    if(asText) {
                        const windowSize = 25;

                        const handleWhitespace = str => {
                            return expected.ignoreWhitespace
                            ? str.trim().replace(/\s+/g, " ")
                            : str;
                        };
                        actual.message = handleWhitespace(actual.message);
                        expected.message = handleWhitespace(expected.message);
                        
                        let mismatchIndex = 0;
                        while(actual.message.charAt(mismatchIndex)
                        === expected.message.charAt(mismatchIndex)) {
                            mismatchIndex++;
                        }

                        const offset = {
                            left: Math.max(0, mismatchIndex - windowSize),
                            right: mismatchIndex + windowSize
                        };

                        displayActual.message = [
                            mismatchIndex,
                            `${(offset.left > 0) ? "..." : ""}${actual.message.slice(offset.left, offset.right)}${(actual.message.length > offset.right) ? "..." : ""}`
                        ];

                        displayExpected.message = `${(offset.left > 0) ? "..." : ""}${expected.message.slice(offset.left, offset.right)}${(expected.message.length > offset.right) ? "..." : ""}`;
                    } else {
                        displayActual.message = actual.message;
                    }
                }
            }
            
            if(expected.headers) {
                for(let header in expected.headers) {
                    const normalizedHeader = header.toLowerCase();

                    if(actual.headers[normalizedHeader] != expected.headers[header]) {
                        hasSucceeded = false;

                        displayActual.headers = displayActual.headers || {};
                        displayExpected.headers = displayExpected.headers || {};
                        displayActual.headers[normalizedHeader] = actual.headers[normalizedHeader];
                        displayExpected.headers[normalizedHeader] = expected.headers[header];
                    }
                }
            }
            
            resolve({
                hasSucceeded,
                actual: formatDisplayObj(displayActual),
                expected: formatDisplayObj(displayExpected)
            });
        })
        .catch(err => {
            console.error(`Request error: ${err.message}`);

            resolve(false);
        });
    });
}


function runEnvironmentalScript(path, caption) {
    if(!existsSync(path)) {
        return null;
    }

    console.log(`\x1b[2m+ ENV \x1b[1m${caption}\x1b[0m\n`);

    const child = fork(path, [], {
        stdio: "pipe"
    }); // TODO: Mode; [ "--dev" ] ?

    child.stdout.on("data", data => {
        console.group();
        console.log(`\x1b[2m--- ENV log ---`);
        console.log(String(data));
        console.groupEnd("\x1b[0m");
    });

    child.stderr.on("data", data => {
        console.group();
        console.log(`\x1b[2m--- ENV \x1b[31merror\x1b[30m ---`);
        console.error(String(data));
        console.groupEnd("\x1b[0m");
    });

    return child;
}

function performRequest(endpoint) {
    url = new URL(endpoint.url);
    
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: url.hostname,
            port: url.port,
            path: url.href,
            method: endpoint.method || "GET",
            headers: endpoint.headers || {}
        }, res => {
            res.on("data", message => {
                message = String(message);
                
                resolve({
                    headers: res.headers,
                    status: res.statusCode,
                    message: {
                        json: _ => JSON.parse(message),
                        text: _ => message
                    }
                });
            });
        });

        req.on("error", err => {
            reject(err);
        });

        endpoint.body
        && req.write(JSON.stringify(endpoint.body));

        req.end();
    });
}

function isObject(value) {
    return !Array.isArray(value)
    && !["string", "number", "boolean"].includes(typeof(value));
}

function wrap(str, code){
    return `${
        (!Array.isArray(code) ? [ code ] : code)
        .map(c => `\x1b[${c}m`)
        .join("")
    }${str}\x1b[0m`
}

function formatObj(obj) {
    return JSON.stringify(obj)
    .replace(/:(("|')[^"']+\2|[0-9]+)/g, m => {
        const rawValue = m.slice(1).replace(/^["']|["']$/g, "");
        const value = isNaN(rawValue)
        ? wrap(`"${rawValue}"`, 32)
        : wrap(rawValue, "38:5:214");

        return `:${value}`;
    })
    .replace(/("|')[^"']+\1:/g, m => `${wrap(m.slice(0, -1), 36)}${wrap(":", 2)} `)
    .replace(/\{/g, `${wrap("{", 2)}\n  `)
    .replace(/\}/g, `\n${wrap("}", 2)}`)
    .replace(/,/g, ",\n  ");
}

function formatDisplayObj(displayObj) {
    const wrapCaption = str => wrap(`– ${str.charAt(0).toUpperCase()}${str.slice(1)}:`, [2, 33]);

    const log = [];

    displayObj.status
    && log.push(
        `${wrapCaption("status")} ${wrap(displayObj.status, 36)}`
    );

    displayObj.message
    && log.push(`${wrapCaption("message")}${
        Array.isArray(displayObj.message)
        ? `${wrap(`At position ${displayObj.message[0]}`, 31)}\n${
                displayObj.message[1].slice(0, displayObj.message[0])
            }${wrap("^^^", 31)}${
                displayObj.message[1].slice(displayObj.message[0])
            }`
        : isObject(displayObj.message)
            ? formatObj(displayObj.message)
            : `${
                ((displayObj.message.length > 25) || (displayObj.message.indexOf("\n") >= 0))
                ? "\n" : " "
            }${displayObj.message}`
    }`);

    displayObj.headers
    && log.push(`${wrapCaption("headers")}\n${
        formatObj(displayObj.headers)
    }`);
    
    return log.join("\n\n");
}

function deepIsEqual(value1, value2) {
    const arrayIsEqual = (array1, array2) => {
        return (JSON.stringify(array1.sort()) === JSON.stringify(array2.sort()));
    };
    
    if(!isObject(value1) && !isObject(value2)) {
        return Array.isArray(value1)
        ? arrayIsEqual(value1, value2)
        : (value1 === value2);
    }

    for(const key in value1) {
        if((isObject(value1[key]) && !this.deepIsEqual(value1[key], value2[key]))
        || (Array.isArray(value1[key]) && !this.arraysEqual(value1[key], value2[key]))
        || value1[key] !== value2[key]) {
            return false;
        }
    }

    return true;
}