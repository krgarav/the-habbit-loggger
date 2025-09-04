import { useEffect, useState } from "react";
import axios from "axios";
import { saveLog, getLogs, resetLogs } from "./utils/db";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadLogs();
  }, []);
  useEffect(() => {
    const stk = getStreak(logs);
    setStreak(stk);
    console.log(stk);
  }, [logs]);

  async function loadLogs() {
    const localData = await getLogs();
    setLogs(localData.slice(-7));
  }

  async function markDone() {
    console.log(today);
    // return
    await saveLog(today, true);
    await axios.post("http://localhost:5000/mark");
    loadLogs();
  }

  async function reset() {
    await resetLogs();
    await axios.post("http://localhost:5000/reset");
    setLogs([]);
  }
  console.log(logs);
  function getStreak(logs) {
    if (!Array.isArray(logs)) return 0;
    let streak = 0;
    let day = new Date();
    let skippedToday = false;
    console.log(day);

    for (let i = 0; i < 7; i++) {
      // Check up to 7 days
      const dateStr = day.toISOString().split("T")[0];

      const log = logs.find((l) => l.date === dateStr);

      if (log && log.done) {
        streak++;
      } else {
        if (!skippedToday && streak === 0) {
          // Skip today if no streak yet
          skippedToday = true;
          day.setDate(day.getDate() - 1);
          continue;
        } else {
          break;
        }
      }

      day.setDate(day.getDate() - 1);
    }

    return streak;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-gray-200">
        {/* Title */}
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Tiny Habit Logger
        </h1>

        {/* Hardcoded Habit Name */}
        <h2 className="text-xl font-semibold mb-4 text-center">
          Habit: <span className="text-gray-700">Drink Water</span>
        </h2>

        {/* Streak */}
        <p className="text-lg mb-6 text-center text-gray-600">
          7-Day Streak: <span className="font-bold">{streak}</span>
        </p>

        {/* Logs Grid */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`w-12 h-12 flex items-center justify-center rounded-full font-semibold text-white ${
                log.done ? "bg-green-500" : "bg-gray-300 text-gray-700"
              }`}
            >
              {log.date.split("-")[2]}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={markDone}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Mark Done
          </button>
          <button
            onClick={reset}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
