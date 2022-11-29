import { statSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join, normalize } from "path";

import { ENV } from "../../ENV";

import { LimitDictionary } from "./LimitDictionary";


interface IFileReference {
    ctime: number;
    mtime: number;
}

interface IFileStamp {
    ETag: string;
    data: string;
}


export class VFS extends LimitDictionary<string, IFileStamp, IFileReference> {

    private readonly root: string;

    constructor(root: string) { // TODO: Default from config
        super((path: string) => {
            return normalize(path);
        });

        this.root = normalize(join(ENV.PATH, root));
            
        // Error if out of ENV.PATH (information hiding / security)
        if(this.root.slice(0, ENV.PATH.length) !== ENV.PATH) {
            throw new RangeError(`VFS root directory must not point outwards of the application working directory.\nExpecting\t'${ENV.PATH}...',\ngiven\t\t'${this.root}'.`);
        }
        // TODO: Generic out of PATH utility (reuse e.g. for log dir)
    }
    
    private getAbsolutePath(path: string): string {
        return join(this.root, path);   // TODO: Resolve project locally / from main
    }

    private getFileReference(path: string): IFileReference {
        const {
            ctimeMs, mtimeMs    // ns for precision ?
        } = statSync(this.getAbsolutePath(path));

        return {
            ctime: ctimeMs,
            mtime: mtimeMs
        };
    }

    private getFileStamp(path: string, data: string): IFileStamp {
        const fileReference: IFileReference = this.getFileReference(path);
        
        const eTag = `${fileReference.ctime}${fileReference.mtime}`;  // Quick time stats value (inconsistent in multi-machine setups)
        // TODO: Provide different ETag calculation algorithms / custom interface ?
        
        const fileStamp: IFileStamp = {
            ETag: eTag,
            data: data
        };

        return fileStamp;
    }

    protected retrieveReferenceCallback(path: string): IFileReference {
        return this.getFileReference(path);
    }

    protected validateLimitCallback(reference: IFileReference, current: IFileReference): boolean {
        return (reference.ctime === current.ctime
            && reference.mtime === current.mtime);
    }

    public write(): Promise<void> {
        throw new SyntaxError("write() is not a member of VFS, use writeDisc() or writeVirtual() instead");
    }

    public writeVirtual(path: string, data: string) {
        // TODO: Sync and / or async interface ???
        const fileStamp: IFileStamp = this.getFileStamp(path, data);
        
       super.write(path, fileStamp);
    }

    public writeDisc(path: string, data: string) {
        // TODO: Sync and / or async interface ???
        writeFileSync(this.getAbsolutePath(path), data);

        this.writeVirtual(path, data);
    }

    public exists(path: string): boolean {
        const exists: boolean = super.exists(path);
        if(exists) {
            return true;
        }
        
        const pathOnDisc = this.getAbsolutePath(path);

        if(!existsSync(pathOnDisc)) {
            return false;
        }

        const fileContents = String(readFileSync(pathOnDisc));
        const fileStamp: IFileStamp = this.getFileStamp(path, fileContents);
        
        super.write(path, fileStamp);

        this.setExistenceLookup(path, fileStamp);
        
        return true;
    }

    // TODO: Delete method?
    
}