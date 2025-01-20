import { Display, Map, RNG } from "rot-js";

export default function App() {
  RNG.setSeed(Math.random());
  const display = new Display();
  const { width, height } = display.getOptions();
  const digger = new Map.Digger(width, height);
  digger.create(display.DEBUG);
  for (const room of digger.getRooms())
    room.getDoors((x, y) => display.draw(x, y, "", "", "red"));

  return (
    <main>
      <article>{display.getContainer()}</article>
    </main>
  );
}
