import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// 5 sample candidates matching real EVM layout style
const CANDIDATES = [
  { id: 1, name: "Priya Sharma", party: "National Front", symbol: "🌸" },
  { id: 2, name: "Rajan Kumar", party: "People's Alliance", symbol: "⚡" },
  { id: 3, name: "Meena Devi", party: "United Party", symbol: "🌾" },
  { id: 4, name: "Arjun Nair", party: "Progress Alliance", symbol: "🔆" },
  { id: 5, name: "NOTA", party: "None of the Above", symbol: "✗" },
];

const STAGES = {
  IDLE: "idle",
  READY: "ready",       // Officer pressed Ready
  VOTED: "voted",       // User pressed a candidate button
  VVPAT: "vvpat",      // VVPAT slip showing
  DONE: "done",         // Slip dropped, machine locked
};

export function EVMSimulator() {
  const [stage, setStage] = useState(STAGES.IDLE);
  const [selected, setSelected] = useState(null);
  const [vvpatTimer, setVvpatTimer] = useState(7);

  // VVPAT countdown — state transition is intentional when timer expires
  useEffect(() => {
    if (stage !== STAGES.VVPAT) return;
    if (vvpatTimer === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStage(STAGES.DONE);
      return;
    }
    const t = setTimeout(() => setVvpatTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, vvpatTimer]);

  function handleReady() {
    setStage(STAGES.READY);
    setSelected(null);
    setVvpatTimer(7);
  }

  function handleVote(candidate) {
    if (stage !== STAGES.READY) return;
    setSelected(candidate);
    setStage(STAGES.VOTED);
    // Short delay, then VVPAT slip appears
    setTimeout(() => setStage(STAGES.VVPAT), 600);
  }

  function handleReset() {
    setStage(STAGES.IDLE);
    setSelected(null);
    setVvpatTimer(7);
  }

  return (
    <div className="evm-simulator">
      <div className="evm-label text-caption">
        ⬤ Interactive EVM Simulator — Try it
      </div>

      <div className="evm-layout">
        {/* Control Unit (left) */}
        <div className="evm-cu">
          <div className="evm-unit-label">CONTROL UNIT</div>
          <div className="evm-cu-display">
            {stage === STAGES.IDLE && (
              <span className="evm-status idle">READY</span>
            )}
            {stage === STAGES.READY && (
              <span className="evm-status green">VOTING ENABLED</span>
            )}
            {stage === STAGES.VOTED && (
              <span className="evm-status green">RECORDING...</span>
            )}
            {stage === STAGES.VVPAT && (
              <span className="evm-status green">SLIP PRINTING</span>
            )}
            {stage === STAGES.DONE && (
              <span className="evm-status done">VOTE RECORDED</span>
            )}
          </div>
          <button
            className="evm-ready-btn"
            onClick={handleReady}
            disabled={stage !== STAGES.IDLE && stage !== STAGES.DONE}
          >
            {stage === STAGES.DONE ? "Reset" : "BALLOT (Presiding Officer)"}
          </button>
          {stage === STAGES.DONE && (
            <button className="evm-reset-link" onClick={handleReset}>
              ↺ Try again
            </button>
          )}
        </div>

        {/* Ballot Unit (center) */}
        <div className="evm-bu">
          <div className="evm-unit-label">BALLOT UNIT</div>
          <div className="evm-candidates">
            {CANDIDATES.map((c, i) => (
              <motion.button
                key={c.id}
                className={`evm-candidate-row ${selected?.id === c.id ? "selected" : ""} ${c.id === 5 ? "nota" : ""}`}
                onClick={() => handleVote(c)}
                disabled={stage !== STAGES.READY}
                whileTap={stage === STAGES.READY ? { scale: 0.97 } : {}}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="evm-serial">{i + 1}</span>
                <span className="evm-symbol">{c.symbol}</span>
                <span className="evm-name">{c.name}</span>
                <span className="evm-party">{c.party}</span>
                <span className={`evm-light ${selected?.id === c.id && stage !== STAGES.IDLE ? "lit" : ""}`} />
              </motion.button>
            ))}
          </div>
        </div>

        {/* VVPAT (right) */}
        <div className="evm-vvpat">
          <div className="evm-unit-label">VVPAT</div>
          <div className="evm-vvpat-window">
            <AnimatePresence>
              {stage === STAGES.VVPAT && selected && (
                <motion.div
                  className="evm-vvpat-slip"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="slip-symbol">{selected.symbol}</div>
                  <div className="slip-name">{selected.name}</div>
                  <div className="slip-party">{selected.party}</div>
                  <div className="slip-timer">{vvpatTimer}s</div>
                </motion.div>
              )}
              {stage === STAGES.DONE && (
                <motion.div
                  className="evm-vvpat-done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CheckCircle2 size={24} color="#34D399" />
                  <span>Slip dropped</span>
                </motion.div>
              )}
              {(stage === STAGES.IDLE || stage === STAGES.READY) && (
                <motion.div className="evm-vvpat-empty">
                  {stage === STAGES.READY ? "Press a button to vote" : "Waiting..."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="evm-vvpat-label text-caption">
            Visible for 7 seconds only
          </div>
        </div>
      </div>

      {/* Explanation below */}
      <div className="evm-explainer text-caption">
        {stage === STAGES.IDLE && "1. The Presiding Officer presses 'BALLOT' to enable your vote."}
        {stage === STAGES.READY && "2. Press any button next to your candidate to vote."}
        {stage === STAGES.VOTED && "3. Your vote is being recorded..."}
        {stage === STAGES.VVPAT && `4. Check the VVPAT window — you have ${vvpatTimer} seconds to verify your choice.`}
        {stage === STAGES.DONE && "5. Slip dropped into sealed box. Your vote is recorded and the machine is locked for you."}
      </div>
    </div>
  );
}
