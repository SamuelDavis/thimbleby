import { type Message, messages } from "./Message";
import type Model from "./Model";

export default function Update(model: Model, message: Message): Model {
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
