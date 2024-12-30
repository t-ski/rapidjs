interface IAFile {
}

export class AFile implements IAFile {
  private readonly name: string = "9";

  constructor(discPath: string) {
    return this.name;
  }
}
