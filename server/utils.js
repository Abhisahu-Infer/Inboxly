import jwt from "jsonwebtoken";
const SECRET = () => process.env.JWT_SECRET || "dev-secret";
// forwards async errors to Express error handler
export const h = (fn) => (req, res, next) => fn(req, res, next).catch(next);
export const sign = (u) => jwt.sign({ id: u._id }, SECRET(), { expiresIn: "7d" });
export const protect = (req, res, next) => {
  try {
    const t = (req.headers.authorization || "").replace("Bearer ", "");
    req.uid = jwt.verify(t, SECRET()).id;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
};
