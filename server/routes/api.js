import { Router } from "express";
import { Account, Client, Email } from "../models.js";
import { classify, draft } from "../ai.js";
import { SEED, INCOMING } from "../seed.js";
import { h, protect } from "../utils.js";

const r = Router();
r.use(protect);

// ----- accounts (simulated Gmail / Outlook connection) -----
r.get("/accounts", h(async (req, res) => res.json(await Account.find({ user: req.uid }))));

r.post("/accounts", h(async (req, res) => {
  const { provider } = req.body;
  const seed = SEED[provider];
  if (!seed) return res.status(400).json({ error: "Unsupported provider" });
  if (await Account.findOne({ user: req.uid, provider }))
    return res.status(409).json({ error: provider + " is already connected" });
  const acc = await Account.create({ user: req.uid, provider, lastSync: new Date() });
  const cli = await Client.create({ user: req.uid, account: acc._id, provider, ...seed.client });
  await Email.insertMany(seed.emails.map(([from, subject, body, mins]) => ({
    user: req.uid, client: cli._id, from, subject, body,
    receivedAt: new Date(Date.now() - mins * 60000), ...classify(from, subject, body),
  })));
  res.json(acc);
}));

r.post("/accounts/:id/sync", h(async (req, res) => {
  const a = await Account.findOneAndUpdate({ _id: req.params.id, user: req.uid }, { lastSync: new Date() }, { new: true });
  res.json(a);
}));

r.get("/clients", h(async (req, res) => res.json(await Client.find({ user: req.uid }))));

// ----- emails -----
r.get("/emails", h(async (req, res) => {
  const { client, filter = "all", q } = req.query;
  const m = { user: req.uid };
  if (client) m.client = client;
  if (filter === "done") m.done = true;
  else if (filter !== "all") m.done = false;
  if (["client", "assistant", "none"].includes(filter)) m.owner = filter;
  if (filter === "high") m.priority = "high";
  if (q) {
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    m.$or = [{ subject: re }, { from: re }, { body: re }];
  }
  const list = await Email.find(m).sort({ receivedAt: -1 }).populate("client", "name role provider");
  res.json(list.map((e) => ({ ...e.toObject(), draft: e.owner === "none" ? "" : draft(e, e.client?.name) })));
}));

r.get("/stats", h(async (req, res) => {
  const base = { user: req.uid };
  if (req.query.client) base.client = req.query.client;
  const total = await Email.countDocuments(base);
  const a = await Email.find({ ...base, done: false }).select("owner priority unread");
  res.json({
    total,
    needClient: a.filter((e) => e.owner === "client").length,
    needAssistant: a.filter((e) => e.owner === "assistant").length,
    high: a.filter((e) => e.priority === "high").length,
    unread: a.filter((e) => e.unread).length,
  });
}));

r.patch("/emails/:id", h(async (req, res) => {
  const { owner, done, unread } = req.body, u = {};
  if (["client", "assistant", "none"].includes(owner)) {
    Object.assign(u, { owner, confidence: 100, reason: "Manually assigned by you." });
  }
  if (typeof done === "boolean") { u.done = done; if (done) u.unread = false; }
  if (typeof unread === "boolean") u.unread = unread;
  const e = await Email.findOneAndUpdate({ _id: req.params.id, user: req.uid }, u, { new: true });
  if (!e) return res.status(404).json({ error: "Not found" });
  res.json(e);
}));

// demo helper: a new email "arrives" and is analysed by the AI
r.post("/emails/simulate", h(async (req, res) => {
  const cs = await Client.find({ user: req.uid });
  if (!cs.length) return res.status(400).json({ error: "Connect an account first" });
  const [from, subject, body] = INCOMING[Math.floor(Math.random() * INCOMING.length)];
  const c = cs[Math.floor(Math.random() * cs.length)];
  res.json(await Email.create({ user: req.uid, client: c._id, from, subject, body, receivedAt: new Date(), ...classify(from, subject, body) }));
}));

export default r;
