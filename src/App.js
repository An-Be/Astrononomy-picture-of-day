import "./App.scss";
import { Astronomy } from "./components/Astronomy";
import ParticleBackground from "react-particle-backgrounds";
import { particles } from "./particles";

function App() {
  return (
    <div className="App">
      <ParticleBackground settings={particles} />
      <h1 className="title">Astronomy Picture Of The Day</h1>
      <Astronomy />
    </div>
  );
}

export default App;
