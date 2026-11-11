// Setup -> Session -> Results, shared by every practice type.
//   renderSetup(start)  returns the setup screen; call start(config) to begin.
//   build(config)       returns the questions for that config (see lib/questions.js).
// config = { name, detail, items, ...anything the builder needs }
import { useRef, useState } from "react";
import Results from "./Results.jsx";
import Session from "./Session.jsx";

export default function RunFlow({ renderSetup, build }) {
  const [run, setRun] = useState(null); // { id, config, questions, result }
  const counter = useRef(0);

  function start(config) {
    const questions = build(config);
    if (!questions.length) return;
    counter.current += 1;
    setRun({ id: counter.current, config, questions, result: null });
  }

  if (!run) return renderSetup(start);

  if (run.result) {
    const { config, result } = run;
    return (
      <Results
        result={result}
        name={config.name}
        detail={config.detail}
        onAgain={() => start(config)}
        onMissed={() => start({ ...config, name: `${config.name} (missed)`, items: result.missed.map((q) => q.item) })}
        onChange={() => setRun(null)}
      />
    );
  }

  return <Session key={run.id} questions={run.questions} onExit={() => setRun(null)} onFinish={(result) => setRun({ ...run, result })} />;
}
