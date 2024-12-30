interface IFile {
    getContents(): string;
}

export class File implements IFile {
    public readonly contents: string;

    constructor(relativePath: string, contents: string|Uint8Array) {
        this.hash = 
    }
}