import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import questionsData from "./data/questions.json";

const LEVELS = ["junior", "mid", "senior", "staff"];

function pickQuestion(pool, asked, level) {
  const filtered = pool.filter(
    (q) => q.level === level && !asked.has(q.id)
  );

  if (!filtered.length) return null;

  return filtered[Math.floor(Math.random() * filtered.length)];
}

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

  function rate(score) {
    const copy = [...scores];
    copy[index] = score;
    setScores(copy);
  }

  function next() {
    if (questions.length >= targetCount) return;

    const nextQ = pickQuestion(questionsData, asked, level);
    if (!nextQ) return;

    setQuestions((p) => [...p, nextQ]);
    setAsked((p) => new Set([...p, nextQ.id]));

    setCurrent(nextQ);
    setIndex((i) => i + 1);
  }

  function prev() {
    if (index <= 0) return;
    setIndex((i) => i - 1);
    setCurrent(questions[index - 1]);
  }

  function endInterview() {
    const total = scores.reduce((a, b) => a + b, 0);
    const max = questions.length * 10;
    const percent = max ? ((total / max) * 100).toFixed(1) : 0;

    let result = "Weak";
    if (percent > 80) result = "Strong";
    else if (percent > 60) result = "Mid";
    else if (percent > 40) result = "Junior";

    setReport({ percent, result });
  }

  function exportPDF() {
    const doc = new jsPDF();

    doc.text("Go Interview Report", 10, 10);
    doc.text(`Level: ${level}`, 10, 20);

    let y = 30;

    questions.forEach((q, i) => {
      doc.text(`${i + 1}. ${q.q}`, 10, y);
      y += 7;
    });

    doc.save("report.pdf");
  }

  if (!current) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading interview engine...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">
            Go Interview Platform
          </h1>

          <span className="text-xs px-3 py-1 rounded-full bg-black text-white">
            LIVE SESSION
          </span>
        </div>

        {/* CONTROLS */}
        <div className="flex gap-3 items-center bg-white p-4 rounded-xl shadow-sm border">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="border rounded-lg p-2 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={targetCount}
            onChange={(e) => setTargetCount(Number(e.target.value))}
            className="border rounded-lg p-2 w-24 text-sm"
          />

          <div className="ml-auto text-xs text-gray-500">
            Questions: {questions.length} / {targetCount}
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-5 transition hover:shadow-md">

          {/* badge */}
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              #{index + 1}
            </span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
              {current.level.toUpperCase()}
            </span>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
              {current.skill}
            </span>
          </div>

          {/* question */}
          <div className="text-lg font-semibold leading-relaxed">
            {current.q}
          </div>

          {/* answer preview */}
          <div className="text-sm text-gray-500 border-l-2 pl-3">
            {current.a}
          </div>

          {/* rating */}
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8,9,10].map((s) => (
              <button
                key={s}
                onClick={() => rate(s)}
                className="w-8 h-8 text-xs border rounded-lg hover:bg-black hover:text-white transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* nav */}
          <div className="flex justify-between pt-2">
            <button
              onClick={prev}
              className="px-4 py-2 rounded-lg border hover:bg-gray-100"
            >
              ← Prev
            </button>

            <button
              onClick={next}
              className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-80"
            >
              Next →
            </button>
          </div>

          <button
            onClick={endInterview}
            className="w-full mt-2 py-2 rounded-lg border hover:bg-gray-100"
          >
            End Interview
          </button>
        </div>

        {/* NOTES */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full p-3 rounded-xl border bg-white shadow-sm"
          placeholder="Write notes about candidate..."
        />

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            onClick={exportPDF}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:opacity-90"
          >
            Export PDF
          </button>
        </div>

        {/* REPORT */}
        {report && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-2">Final Report</h2>

            <div className="flex gap-4 text-sm">
              <div>Score: <b>{report.percent}%</b></div>
              <div>Status: <b>{report.result}</b></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}