import { createRoot } from "solid-js";
import { createStore, produce } from "solid-js/store";
import { type Message, messages } from "./Message";
import type Model from "./Model";
import { pipe, Tile, Vector2 } from "./types";
import Update from "./Update";

const State = createRoot(() => {
  const [model, setModel] = createStore<Model>({
    map: [],
    player: Vector2.Zero,
    vision: [],
    visionRange: 10,
  });

  function dispatch(message: Message) {
    setModel(produce((model) => pipeline({ model, message }).model));
  }

  return { dispatch, model };
});

const pipeline = pipe<{ model: Model; message: Message }>(
  // resolve
  (value, next) => {
    const message = resolve(value.model, value.message);
    return next({ ...value, message });
  },
  // update
  (value, next) => {
    const model = Update(value.model, value.message);
    return next({ ...value, model });
  },
  // effects
  (value, next) => {
    const result = next(value);
    effects(result.model, result.message);
    return result;
  },
);

function resolve(model: Model, message: Message): Message {
  switch (message.type) {
    case messages.move.type: {
      const next = model.player.add(message.payload);
      const tile = model.map[next.y]?.[next.x];
      return tile === Tile.Wall
        ? messages.noop()
        : messages.setPlayerPosition(next);
    }
  }
  return message;
}

function effects(_model: Model, message: Message): void {
  switch (message.type) {
    case messages.setPlayerVisionRange.type:
    case messages.setPlayerPosition.type: {
      State.dispatch(messages.updatePlayerVision());
      break;
    }
  }
}

export default State;
