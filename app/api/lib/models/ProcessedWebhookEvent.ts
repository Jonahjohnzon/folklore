import { Schema, model, models, type Model, type Document } from "mongoose";

export interface ProcessedWebhookEventDoc extends Document {
  reference: string;
  createdAt: Date;
}

const ProcessedWebhookEventSchema = new Schema<ProcessedWebhookEventDoc>({
  // The Paystack transaction reference — unique index means a second
  // attempt to insert the same reference throws, which is exactly the
  // idempotency guarantee the webhook handler relies on.
  reference: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
});

// The `models.X ?? model(...)` pattern avoids Next.js's dev-mode hot-reload
// re-registering the same model and throwing "OverwriteModelError".
export const ProcessedWebhookEvent: Model<ProcessedWebhookEventDoc> =
  models.ProcessedWebhookEvent ||
  model<ProcessedWebhookEventDoc>("ProcessedWebhookEvent", ProcessedWebhookEventSchema);