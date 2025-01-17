import { join } from "path";

import { Handler } from "../../build/api.js";


const defaultHandler = initHandler(join(import.meta.dirname, "../../../../test-app"));


export function initHandler(appWorkingDir) {
    return new Handler({
        cwd: appWorkingDir,
        apiDirPath: "./api",
        sourceDirPath: "./src",
        publicDirPath: "./public"
    }, {
        "security": {
            "maxRequestHeadersLength": 500,
            "maxRequestURILength": 100
        },
        "performance": {
            "compressionByteThreshold": 999
        },
        "www": "never",
        "hostnames": [ "example.org", "other.example.org" ]
    }, [
        "README.md",
        "test/file.txt"
    ]);
}


export async function requestWithHandler(handler, sReq, headerFilters = null, hideBody = false, metaBody = false) {
    const sRes = await handler.activate(sReq);

    if(Array.isArray(headerFilters)) {
        const filteredHeaders = {};
        headerFilters.forEach(header => {
            filteredHeaders[header] = sRes.headers[header];
        });
        
        if(!headerFilters.length) {
            delete sRes.headers;
        } else {
            sRes.headers = filteredHeaders;
        }
    }

    if(hideBody) {
        delete sRes.body;
    } else if(metaBody) {
        sRes.body = {
            length: sRes.body ? Buffer.byteLength(sRes.body) : 0
        };
    } else {
        try {
            sRes.body = sRes.body.toString();
            sRes.body = JSON.parse(sRes.body);
        } catch {}
    }

    return sRes;
};


export async function request(sReq, headerFilters = null, hideBody = false, metaBody = false) {
    return requestWithHandler(defaultHandler, sReq, headerFilters, hideBody, metaBody);
}