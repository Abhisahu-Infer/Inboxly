import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models.js";
import { h, sign } from "../utils.js";

const r = Router();
r.post("/signup", h(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || password.length < 6)
    return res.status(400).json({ error: "Email and a password of 6+ characters are required" });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ error: "Email already registered" });
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.json({ token: sign(u), user: { name: u.name, email: u.email } });
}));
r.post("/login", h(async (req, res) => {
  const { email = "", password = "" } = req.body;
  const u = await User.findOne({ email: email.toLowerCase() });
  if (!u || !(await bcrypt.compare(password, u.password)))
    return res.status(401).json({ error: "Invalid email or password" });
  res.json({ token: sign(u), user: { name: u.name, email: u.email } });
}));
export default r;
