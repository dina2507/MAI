import admin from "firebase-admin";

const MAX_PER_MINUTE = 10;
const MAX_PER_DAY = 100;

export async function checkRateLimit(fingerprint) {
  const db = admin.firestore();

  const now = Date.now();
  const minuteWindow = Math.floor(now / 60_000);
  const dayWindow = Math.floor(now / 86_400_000);

  const ref = db.collection("rate_limits").doc(fingerprint);

  const result = await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    const data = doc.data() || { minute: {}, day: {} };

    const minuteCount = (data.minute[minuteWindow] || 0) + 1;
    const dayCount = (data.day[dayWindow] || 0) + 1;

    if (minuteCount > MAX_PER_MINUTE) return { ok: false, reason: "minute" };
    if (dayCount > MAX_PER_DAY) return { ok: false, reason: "day" };

    // Keep only current windows
    tx.set(ref, {
      minute: { [minuteWindow]: minuteCount },
      day: { [dayWindow]: dayCount },
    });

    return { ok: true };
  });

  return result;
}
