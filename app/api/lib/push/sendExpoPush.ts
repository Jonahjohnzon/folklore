// app/api/lib/push/sendExpoPush.ts

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default";
}

// Expo caps batches at 100 messages per request.
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function sendExpoPush(
  tokens: string[],
  payload: { title: string; body: string; data?: Record<string, unknown> }
) {
  if (tokens.length === 0) return;

  const messages: ExpoPushMessage[] = tokens.map((to) => ({
    to,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    sound: "default",
  }));

  const staleTokens: string[] = [];

  for (const batch of chunk(messages, 100)) {
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(batch),
      });
      const json = await res.json();

      // Each ticket lines up with the message at the same index in this batch.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (json?.data ?? []).forEach((ticket: any, i: number) => {
        if (ticket?.status === "error" && ticket?.details?.error === "DeviceNotRegistered") {
          staleTokens.push(batch[i].to);
        }
      });
    } catch {
      // Swallow — a failed push shouldn't fail the notification-creation request.
    }
  }

  return { staleTokens };
}