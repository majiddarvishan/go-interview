import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import questionsData from "./data/questions.json";

// -----------------------------
// CORE SETTINGS
// -----------------------------
const LEVELS = ["junior", "mid", "senior", "staff"];

// -----------------------------
// QUESTION PICKER
// -----------------------------
function pickQuestion(pool, asked, level) {
  const filtered = pool.filter(
    (q) => q.level === level && !asked.has(q.id)
  );

  if (filtered.length === 0) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

// -----------------------------
// MAIN APP
// -----------------------------
export default function App() {
  const [level, setLevel] = useState("junior");
  const [targetCount, setTargetCount] = useState(10);

  const [questions, setQuestions] = useState([]);
  const [asked, setAsked] = useState(new Set());

  const [current, setCurrent] = useState(null);
  const [index, setIndex] = useState(0);

  const [scores, setScores] = useState([]);
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState(null);

  // -----------------------------
  // INIT / RESET SESSION
  // -----------------------------
  useEffect(() => {
    const first = pickQuestion(questionsData, new Set(), level);

    if (!first) return;

    setQuestions([first]);
    setAsked(new Set([first.id]));
    setCurrent(first);
    setIndex(0);
    setScores([]);
    setReport(null);
  }, [level]);

  // -----------------------------
  // RATE ANSWER
  // -----------------------------
  function rate(score) {
    const copy = [...scores];
    copy[index] = score;
    setScores(copy);
  }

  // -----------------------------
  // NEXT QUESTION
  // -----------------------------
  function next() {
    if (questions.length >= targetCount) return;

    const nextQ = pickQuestion(questionsData, asked, level);
    if (!nextQ) return;

    setQuestions((prev) => [...prev, nextQ]);
    setAsked((prev) => new Set([...prev, nextQ.id]));

    setCurrent(nextQ);
    setIndex((i) => i + 1);
  }

  // -----------------------------
  // PREVIOUS QUESTION
  // -----------------------------
  function prev() {
    if (index <= 0) return;

    setIndex((i) => i - 1);
    setCurrent(questions[index - 1]);
  }

  // -----------------------------
  // END INTERVIEW
  // -----------------------------
  function endInterview() {
    const total = scores.reduce((a, b) => a + b, 0);
    const max = questions.length * 10;

    const percent = max ? ((total / max) * 100).toFixed(1) : 0;

    let result = "Weak Candidate";
    if (percent > 80) result = "Strong Candidate";
    else if (percent > 60) result = "Mid-Level Candidate";
    else if (percent > 40) result = "Junior Candidate";

    setReport({ percent, result });
  }

  // -----------------------------
  // EXPORT PDF
  // -----------------------------
  function exportPDF() {
    const doc = new jsPDF();

    doc.text("Go Interview Report", 10, 10);
    doc.text(`Level: ${level}`, 10, 20);
    doc.text(`Questions: ${questions.length}`, 10, 30);

    let y = 40;

    questions.forEach((q, i) => {
      doc.text(`${i + 1}. ${q.q}`, 10, y);
      y += 7;

      doc.text(`Answer: ${q.a}`, 10, y);
      y += 10;
    });

    if (notes) {
      doc.text("Notes:", 10, y + 10);
      doc.text(notes, 10, y + 20);
    }

    doc.save("interview-report.pdf");
  }

  // -----------------------------
  // UI
  // -----------------------------
  if (!current) {
    return <div className="p-6">Loading interview session...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold">
        Go Interview Platform
      </h1>

      {/* CONTROLS */}
      <div className="flex gap-4 items-center">
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border p-2 rounded"
        >
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={targetCount}
          onChange={(e) => setTargetCount(Number(e.target.value))}
          className="border p-2 w-20 rounded"
        />
      </div>

      {/* QUESTION CARD */}
      <div className="border rounded p-4 space-y-3">
        <div className="font-semibold">
          Q{index + 1}: {current.q}
        </div>

        <div className="text-gray-600 text-sm">
          Answer: {current.a}
        </div>

        {/* RATING */}
        <div className="flex gap-2 flex-wrap">
          {[1,2,3,4,5,6,7,8,9,10].map((s) => (
            <button
              key={s}
              onClick={() => rate(s)}
              className="border px-2 py-1 rounded"
            >
              {s}
            </button>
          ))}
        </div>

        {/* NAV */}
        <div className="flex justify-between">
          <button onClick={prev} className="border px-3 py-1 rounded">
            Prev
          </button>

          <button onClick={next} className="border px-3 py-1 rounded">
            Next
          </button>
        </div>

        <button
          onClick={endInterview}
          className="border px-3 py-1 rounded w-full"
        >
          End Interview
        </button>
      </div>

      {/* NOTES */}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder="Write interview notes..."
      />

      {/* ACTIONS */}
      <button
        onClick={exportPDF}
        className="border px-3 py-1 rounded"
      >
        Export PDF
      </button>

      {/* REPORT */}
      {report && (
        <div className="border p-4 rounded space-y-1">
          <h2 className="font-bold">Final Report</h2>
          <p>Score: {report.percent}%</p>
          <p>Result: {report.result}</p>
        </div>
      )}
    </div>
  );
}