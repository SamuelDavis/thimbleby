export enum Tile {
  Floor,
  Wall,
  Door,
}

export class Vector2 {
  public static Zero = new Vector2(0, 0);
  public static Up = new Vector2(0, -1);
  public static Right = new Vector2(1, 0);
  public static Down = new Vector2(0, 1);
  public static Left = new Vector2(-1, 0);

  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  public add(vector: Vector2): Vector2 {
    return new Vector2(this.x + vector.x, this.y + vector.y);
  }
}
