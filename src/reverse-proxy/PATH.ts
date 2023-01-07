import { normalize, join, isAbsolute } from "path";

import { parseOption } from "../args";


const wdPath: string = process.cwd();
const argPath: string = parseOption("wd", "W").string;


export const PATH: string = normalize(
    argPath
    ? (!isAbsolute(argPath)
        ? join(process.cwd(), argPath)
        : argPath)
    : wdPath
);