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
    vision: [],
    visionRange: 10,
  });

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
        dispatch(messages.updatePlayerVision());
        break;
      }
    }
  }

  function dispatch(message: Message) {
    message = resolve(model, message);
    setModel(
      produce((model) => {
        model = Update(model, message);
        effects(model, message);
        return model;
      }),
    );
  }

  return { dispatch, model };
});

export default State;
