import { openDB } from "idb";

const DB_NAME = "habitLogger";
const STORE_NAME = "logs";

async function getDB() {
  try {
    return await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "date" });
        }
      },
    });
  } catch (error) {
    console.warn("IndexedDB not supported, fallback to localStorage");
    console.log(error);
    return null;
  }
}

export async function saveLog(date, done) {
  const db = await getDB();
  if (db) {
    await db.put(STORE_NAME, { date, done });
  } else {
    let logs = JSON.parse(localStorage.getItem("logs")) || [];
    const idx = logs.findIndex((l) => l.date === date);
    if (idx !== -1) logs[idx].done = done;
    else logs.push({ date, done });
    localStorage.setItem("logs", JSON.stringify(logs));
  }
}

export async function getLogs() {
  const db = await getDB();
  if (db) {
    const all = await db.getAll(STORE_NAME);
    return all;
  } else {
    return JSON.parse(localStorage.getItem("logs")) || [];
  }
}

export async function resetLogs() {
  const db = await getDB();
  if (db) {
    const tx = db.transaction(STORE_NAME, "readwrite");
    await tx.store.clear();
    await tx.done;
  } else {
    localStorage.removeItem("logs");
  }
}
