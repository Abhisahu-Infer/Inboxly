import mongoose from "mongoose";
const { Schema, model } = mongoose;
const ref = (n) => ({ type: Schema.Types.ObjectId, ref: n });

export const User = model("User", new Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
}));
export const Account = model("Account", new Schema({
  user: ref("User"), provider: String,
  status: { type: String, default: "connected" }, lastSync: Date,
}));
export const Client = model("Client", new Schema({
  user: ref("User"), account: ref("Account"), name: String, role: String, provider: String,
}));
export const Email = model("Email", new Schema({
  user: ref("User"), client: ref("Client"),
  from: String, subject: String, body: String, receivedAt: Date,
  category: String,
  priority: { type: String, enum: ["high", "med", "low"] },
  owner: { type: String, enum: ["client", "assistant", "none"] }, // who must reply
  confidence: Number, reason: String,
  unread: { type: Boolean, default: true },
  done: { type: Boolean, default: false },
}));
