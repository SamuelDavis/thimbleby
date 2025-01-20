export type VisionRange = number;
export type Visibility = number;
export type Vision = { p: Vector2; v: Visibility };

export const maxVisionRange = 20;

export enum Tile {
  Floor,
  Wall,
  Door,
}

type Middleware<Input, Output = Input> = (
  value: Input,
  next: (value: Input) => Output,
) => Output;

export function pipe<T>(...pipes: Middleware<T>[]): (value: T) => T {
  return [...pipes].reverse().reduce(
    (next: (value: T) => T, middleware: Middleware<T>) => (value: T) =>
      middleware(value, next),
    (value: T) => value,
  );
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

export class Color {
  public static White = new Color(255, 255, 255);
  public static LightGray = new Color(211, 211, 211);
  public static MediumGray = new Color(169, 169, 169);
  public static DarkGray = new Color(128, 128, 128);
  public static Black = new Color(0, 0, 0);
  public static Red = new Color(255, 0, 0);
  public static Green = new Color(0, 255, 0);
  public static Blue = new Color(0, 0, 255);

  constructor(
    public readonly r: number,
    public readonly g: number,
    public readonly b: number,
    public readonly a: number = 1,
  ) {}

  public setAlpha(a: number): Color {
    return new Color(this.r, this.g, this.b, a);
  }

  public setOpaque(): Color {
    return new Color(this.r, this.g, this.b, 1);
  }

  public toString(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
}
