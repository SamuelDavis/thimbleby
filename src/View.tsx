import { Display, Map, RNG } from "rot-js";
import { Room } from "rot-js/lib/map/features";
import { createEffect, createRoot, JSX, onCleanup, onMount } from "solid-js";
import { createStore, produce } from "solid-js/store";

enum Tile {
  Floor,
  Wall,
  Door,
}

class Vector2 {
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

type Model = {
  map: Tile[][];
  player: Vector2;
};

interface Messages {
  noop: void;
  setMap: Tile[][];
  setPlayerPosition: Vector2;
  move: Vector2;
}

type Message = {
  [Type in keyof Messages]: { type: Type; payload: Messages[Type] };
}[keyof Messages];

export const messages = new Proxy(
  {},
  {
    get<Type extends keyof Messages>(_: never, type: Type) {
      const factory = (payload: Messages[Type]) => ({ type, payload });
      factory.type = type;
      return factory;
    },
  },
) as {
  [Type in keyof Messages]: { type: Type } & ((payload: Messages[Type]) => {
    type: Type;
    payload: Messages[Type];
  });
};

const State = createRoot(() => {
  const [model, setModel] = createStore<Model>({
    map: [],
    player: Vector2.Zero,
  });
  function resolve(model: Model, message: Message): Message {
    if (message.type === messages.move.type) {
      const next = model.player.add(message.payload);
      const tile = model.map[next.y]?.[next.x];
      if (tile === Tile.Wall) return messages.noop();
    }
    return message;
  }
  function dispatch(message: Message) {
    message = resolve(model, message);
    setModel(produce((model) => Update(model, message)));
  }

  return { dispatch, model };
});

function Update(model: Model, message: Message): Model {
  switch (message.type) {
    case messages.setMap.type: {
      model.map = message.payload;
      break;
    }
    case messages.setPlayerPosition.type:
      model.player = message.payload;
      break;
    case messages.move.type: {
      model.player = model.player.add(message.payload);
      break;
    }
  }
  return model;
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
