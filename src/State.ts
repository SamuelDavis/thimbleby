import { createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { type Message, messages } from "./Message";
import type Model from "./Model";
import { Tile, Vector2 } from "./types";
import Update from "./Update";

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

export default State;
