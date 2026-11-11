import { useState } from "react";
import { useStore } from "../store.jsx";

export default function Login() {
  const { unlock } = useStore();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await unlock(password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      <h2>Password</h2>
      <p className="sub">Enter the password for this app.</p>
      <form onSubmit={submit}>
        <div className="form-row">
          <label htmlFor="pw">
            Password
            <input
              type="password"
              id="pw"
              autoComplete="current-password"
              autoFocus
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" className="btn primary">
            Unlock
          </button>
        </div>
      </form>
      <p className="msg err" role="status">
        {error}
      </p>
    </section>
  );
}
