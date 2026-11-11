export default function Results({ result, name, detail, onMissed, onAgain, onChange }) {
  const { score, total, missed } = result;
  return (
    <section>
      <h2>Round complete</h2>
      <div className="score">
        {score} <small>of {total} correct</small>
      </div>
      <p className="sub">
        {name} · {detail}
      </p>
      {missed.length ? (
        <div>
          <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>To review</h3>
          <ul className="list missed">
            {missed.map((q) => (
              <li className="row" key={q.id}>
                <span className={q.review.leftLang === "ko" ? "ko" : "en"} lang={q.review.leftLang === "ko" ? "ko" : undefined}>
                  {q.review.left}
                </span>
                <span className={q.review.rightLang === "ko" ? "ko" : "en"} lang={q.review.rightLang === "ko" ? "ko" : undefined}>
                  {q.review.right}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="msg" style={{ color: "var(--good)" }}>
          No misses this round.
        </p>
      )}
      <div className="fb-actions">
        {missed.length > 0 && (
          <button type="button" className="btn primary" onClick={onMissed}>
            Practice the {missed.length} missed
          </button>
        )}
        <button type="button" className={`btn${missed.length ? "" : " primary"}`} onClick={onAgain}>
          Shuffle and restart
        </button>
        <button type="button" className="btn" onClick={onChange}>
          Change settings
        </button>
      </div>
    </section>
  );
}
