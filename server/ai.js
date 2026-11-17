// "AI" triage: decides who should reply. Rule-based so it runs offline.
// To use a real LLM, replace classify() with an API call that returns the same shape.
const RULES = [
  [/digest|newsletter|you appeared|recording is ready|\bpaid\b|unsubscribe/i,
    { owner: "none", priority: "low", confidence: 97, category: "FYI",
      reason: "Automated or informational message. No reply needed." }],
  [/\b(mom|dad|dinner|birthday)\b/i,
    { owner: "client", priority: "med", confidence: 85, category: "Personal",
      reason: "Personal message from family or friends; the assistant should not reply on the client’s behalf." }],
  [/\bsign(ature|ed)?\b|approve|your (personal )?(view|opinion|decision)|personally|board|term sheet/i,
    { owner: "client", priority: "high", confidence: 92, category: "Decision",
      reason: "Needs a personal decision, approval or signature from the client." }],
  [/reschedule|schedule|availability|invoice|book|flight|confirm|follow(ing)? up|circling back|demo|calendar|payment timeline/i,
    { owner: "assistant", priority: "med", confidence: 88, category: "Admin",
      reason: "Routine logistics or admin; the assistant can handle this." }],
];

export function classify(from, subject, body) {
  const text = `${from} ${subject} ${body}`;
  let r = null;
  for (const [re, out] of RULES) if (re.test(text)) { r = { ...out }; break; }
  if (!r) {
    r = text.includes("?")
      ? { owner: "assistant", priority: "med", confidence: 65, category: "General",
          reason: "Contains a question but no clear owner; assistant should triage first." }
      : { owner: "none", priority: "low", confidence: 60, category: "General",
          reason: "No question or action detected; likely informational." };
  }
  if (r.owner !== "none" && /today|tonight|urgent|asap|friday/i.test(text)) r.priority = "high";
  return r;
}

const D = {
  Admin: "Hi,\n\nThanks for your email. We’ve noted this and will confirm the details shortly.\n\nBest,\nAssistant to {c}",
  Decision: "(Draft for {c} to review)\n\nHi,\n\nThanks for sending this over. I’ll review it and come back to you shortly.\n\nBest,\n{c}",
  Personal: "Hi,\n\nThanks for your message. I’ll reply to you personally soon.\n\nBest,\n{c}",
};
export const draft = (e, c = "the client") => (D[e.category] || D.Admin).replace(/\{c\}/g, c);
