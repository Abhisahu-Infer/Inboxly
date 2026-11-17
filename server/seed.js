// Sample mailboxes used to simulate a connected account: [from, subject, body, minutes ago]
export const SEED = {
  Gmail: {
    client: { name: "Priya Mehta", role: "Founder, Lumen Labs" },
    emails: [
      ["Arjun Rao (Investor)", "Term sheet – signature needed by Friday", "Hi Priya, attaching the final term sheet. We need your signature before Friday to close the round.", 20],
      ["Calendly", "Reschedule request: Design review", "Sam would like to move Thursday’s design review to Friday 11:00. Please confirm or suggest another time.", 55],
      ["Stripe", "Invoice #4821 paid", "Payment of $2,400 received from Orbit Studio. Receipt attached.", 70],
      ["Meera Iyer", "Quick question on the Q4 hiring plan", "Priya, do you want to approve the two senior roles personally or should HR proceed?", 1500],
      ["Notion Weekly", "Your weekly digest", "Here’s what your team worked on this week across 6 pages.", 1600],
      ["Kavya (Travel desk)", "Flight options for Mumbai trip", "Three options attached. Please let us know which works with your calendar and we will book.", 3000],
    ],
  },
  Outlook: {
    client: { name: "Daniel Cho", role: "VP Sales, Northwind" },
    emails: [
      ["Helena Brandt (CEO)", "Re: Pricing strategy for EMEA", "Daniel, I’d like your personal view on the discount structure before the board meeting.", 15],
      ["Acme Procurement", "Updated invoice and PO numbers", "Please find the corrected invoice. Kindly confirm receipt and share the payment timeline.", 40],
      ["Rohit Nair", "Following up: demo next week?", "Hi Daniel, circling back on my earlier note. Does Tuesday 3pm work for a 30 min demo?", 1450],
      ["LinkedIn", "You appeared in 14 searches", "See who’s viewing your profile this week.", 3100],
      ["Sunita (Mom)", "Dinner on Sunday?", "Beta, are you free for dinner Sunday? Let me know personally ok :)", 4300],
    ],
  },
};
export const INCOMING = [
  ["Vikram (Legal)", "Please approve the revised NDA", "Hi, could you approve the revised NDA today? I need your decision before the board call."],
  ["Zoom", "Cloud recording is ready", "Your recording is now available to download."],
  ["Neha Kapoor", "Availability for a call this week?", "Hi, can we confirm a time for a quick call? Let me know your availability."],
];
