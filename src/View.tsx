import { Display, Map, RNG } from "rot-js";
import { Room } from "rot-js/lib/map/features";
import { createEffect, JSX, onCleanup, onMount } from "solid-js";
import type Model from "./Model";
import { messages } from "./Message";
import { Color, Tile, Vector2 } from "./types";
import State from "./State";

const TileToGlyphMap: Record<Tile, string> = {
  [Tile.Floor]: ".",
  [Tile.Wall]: "#",
  [Tile.Door]: "n",
};

export default function View() {
  RNG.setSeed(Math.random());
  const display = new Display({
    fg: Color.Black.toString(),
    bg: Color.Black.toString(),
  });
  const { width, height } = display.getOptions();

  const digger = new Map.Digger(width, height);
  let map: Tile[][] = [];
  digger.create((x, y, v) => {
    map[y] = map[y] ?? [];
    map[y][x] = v;
  });
  for (const room of digger.getRooms())
    room.getDoors((x, y) => (map[y][x] = Tile.Door));
  State.dispatch(messages.setMap(map));

  const room = RNG.getItem(digger.getRooms());
  if (!(room instanceof Room)) throw new TypeError();
  const x = RNG.getUniformInt(room.getLeft(), room.getRight());
  const y = RNG.getUniformInt(room.getTop(), room.getBottom());
  const playerPosition = new Vector2(x, y);
  State.dispatch(messages.setPlayerPosition(playerPosition));

  createEffect(() => {
    render(display, State.model);
  });

  onMount(() => {
    window.addEventListener("keypress", onKeypress);
    render(display, State.model);
  });
  onCleanup(() => {
    window.removeEventListener("keypress", onKeypress);
  });

  function onInputVisionRange(event: {
    currentTarget: HTMLInputElement;
  }): void {
    State.dispatch(
      messages.setPlayerVisionRange(event.currentTarget.valueAsNumber),
    );
  }

  return (
    <main>
      <header>
        <label>
          <span>Vision Range</span>
          <input
            type="range"
            min="1"
            max="10"
            value={State.model.visionRange}
            onInput={onInputVisionRange}
          />
        </label>
      </header>
      <article>{display.getContainer()}</article>
    </main>
  );
}

function render(display: Display, model: Model) {
  display.clear();
  model.vision.forEach((vision) => {
    const { p, v } = vision;
    const { x, y } = p;
    const t = model.map[y]?.[x];

    const foreground = Color.White.setAlpha(v);
    let background = Color.Black.setAlpha(v);
    if (t === Tile.Wall) background = background.setOpaque();

    const glyph = TileToGlyphMap[t];

    display.draw(x, y, glyph, foreground.toString(), background.toString());
  });
  display.drawOver(
    model.player.x,
    model.player.y,
    "@",
    Color.White.toString(),
    null,
  );
}

function onKeypress(event: KeyboardEvent): void {
  const { dispatch } = State;
  const { move } = messages;
  switch (event.key) {
    case "w":
      dispatch(move(Vector2.Up));
      break;
    case "d":
      dispatch(move(Vector2.Right));
      break;
    case "s":
      dispatch(move(Vector2.Down));
      break;
    case "a":
      dispatch(move(Vector2.Left));
      break;
  }
}
