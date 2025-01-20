import { Display, Map, RNG } from "rot-js";
import { Room } from "rot-js/lib/map/features";
import { createEffect, onCleanup, onMount } from "solid-js";
import type Model from "./Model";
import { messages } from "./Message";
import { Tile, Vector2 } from "./types";
import State from "./State";

export default function View() {
  RNG.setSeed(Math.random());
  const display = new Display({ fg: "black", bg: "lightgray" });
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

  return (
    <main>
      <article>{display.getContainer()}</article>
    </main>
  );
}

function render(display: Display, model: Model) {
  display.clear();
  model.map.forEach((row, y) => {
    return row.forEach((v, x) => {
      let bg = null;
      if (v === Tile.Floor) bg = "black";
      else if (v === Tile.Door) bg = "red";
      display.draw(x, y, " ", null, bg);
    });
  });
  display.drawOver(model.player.x, model.player.y, "@", "white", null);
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
