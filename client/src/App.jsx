import { useEffect, useState } from "react";
import axios from "axios";
import { saveLog, getLogs, resetLogs } from "./utils/db";

export default function App() {
  const [logs, setLogs] = useState([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    const localData = await getLogs();
    setLogs(localData.slice(-7));
  }

  async function markDone() {
    await saveLog(today, true);
    await axios.post("http://localhost:5000/mark");
    loadLogs();
  }

  async function reset() {
    await resetLogs();
    await axios.post("http://localhost:5000/reset");
    setLogs([]);
  }
console.log(logs)
  function getStreak() {
    let streak = 0;
    let day = new Date();
    for (let i = 0; i < logs.length; i++) {
      const dateStr = day.toISOString().split("T")[0];
      const log = logs.find((l) => l.date === dateStr);
      if (log && log.done) {
        streak++;
        day.setDate(day.getDate() - 1);
      } else break;
    }
    return streak;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Tiny Habit Logger</h1>

      {/* Hardcoded Habit Name */}
      <h2 className="text-xl font-semibold mb-2">Habit: Drink Water</h2>

      <p className="text-lg mb-4">7-Day Streak: {getStreak()}🔥</p>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              log.done ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {log.date.split("-")[2]}
          </div>
        ))}
      </div>

      <button
        onClick={markDone}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
      >
        Mark Done
      </button>
      <button
        onClick={reset}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Reset
      </button>
    </div>
  );
}
