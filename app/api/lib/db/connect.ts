import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);


// Reuse the connection across hot-reloads / serverless invocations
declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: Promise<typeof mongoose> | undefined;
}

export async function connectToDatabase() {
  if (global._mongooseConn) {
    return global._mongooseConn;
  }

  global._mongooseConn = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });

  return global._mongooseConn;
}