import { Directory } from "./api.ts";

interface IBundle {
  root: Directory;
}

export class Bundle implements IBundle {
  public readonly root: Directory;

  constructor() {
  }
}
