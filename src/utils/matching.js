/**
 * Transparent weighted scoring function.
 * Each criterion adds points out of 100 and records a plain-language
 * reason (what fits) or gap (what is missing). The same function is
 * reused by the Matches page and the What-if simulator.
 */

export const WEIGHTS = {
  field: 35,
  gpa: 25,
  language: 15,
  location: 10,
  budget: 10,
  deadline: 5,
};

// Fixed "today" keeps demo results stable. Replace with new Date() later.
export const TODAY = new Date('2026-11-15T00:00:00');

export function daysUntil(dateStr, today = TODAY) {
  const ms = new Date(`${dateStr}T00:00:00`) - today;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function scoreProgram(profile, program) {
  const reasons = [];
  const gaps = [];
  const breakdown = {};

  // 1. Field
  const interestOverlap = (profile.interests || []).filter((i) => program.tags.includes(i));
  if (profile.major && profile.major === program.field) {
    breakdown.field = WEIGHTS.field;
    reasons.push(`Your major (${profile.major}) is the same field as this program.`);
  } else if (interestOverlap.length > 0) {
    breakdown.field = Math.round(WEIGHTS.field * 0.6);
    reasons.push(`Related to your interests: ${interestOverlap.join(', ')}.`);
  } else {
    breakdown.field = 0;
    gaps.push(`This is a ${program.field} program; your major is ${profile.major || 'not set'}.`);
  }

  // 2. GPA
  const gpa = parseFloat(profile.gpa);
  if (Number.isNaN(gpa)) {
    breakdown.gpa = 0;
    gaps.push(`Minimum GPA is ${program.minGpa.toFixed(1)}; your GPA is not listed.`);
  } else if (gpa >= program.minGpa) {
    breakdown.gpa = WEIGHTS.gpa;
    reasons.push(`Your GPA ${gpa.toFixed(2)} meets the minimum of ${program.minGpa.toFixed(1)}.`);
  } else if (program.minGpa - gpa <= 0.2) {
    breakdown.gpa = Math.round(WEIGHTS.gpa * 0.5);
    gaps.push(`GPA ${gpa.toFixed(2)} is just below the minimum of ${program.minGpa.toFixed(1)}.`);
  } else {
    breakdown.gpa = 0;
    gaps.push(`Needs GPA ${program.minGpa.toFixed(1)}; yours is ${gpa.toFixed(2)}.`);
  }

  // 3. Language
  const req = program.languageReq;
  const ielts = parseFloat(profile.ielts);
  const toefl = parseFloat(profile.toefl);
  if (!req) {
    breakdown.language = WEIGHTS.language;
    reasons.push('No English test is required.');
  } else if ((!Number.isNaN(ielts) && ielts >= req.ielts) || (!Number.isNaN(toefl) && toefl >= req.toefl)) {
    breakdown.language = WEIGHTS.language;
    reasons.push(`Your English score meets the requirement (IELTS ${req.ielts} / TOEFL ${req.toefl}).`);
  } else if (Number.isNaN(ielts) && Number.isNaN(toefl)) {
    breakdown.language = 0;
    gaps.push(`Needs IELTS ${req.ielts} or TOEFL ${req.toefl}; your score is not yet listed.`);
  } else {
    breakdown.language = 0;
    gaps.push(`Needs IELTS ${req.ielts} or TOEFL ${req.toefl}; your current score is below this.`);
  }

  // 4. Location
  const prefs = profile.preferredCountries || [];
  if (prefs.length === 0) {
    breakdown.location = WEIGHTS.location;
  } else if (prefs.includes(program.country)) {
    breakdown.location = WEIGHTS.location;
    reasons.push(`${program.country} is one of your preferred countries.`);
  } else {
    breakdown.location = 0;
    gaps.push(`${program.country} is not in your preferred countries.`);
  }

  // 5. Budget
  const budget = parseFloat(profile.budget);
  if (Number.isNaN(budget) || budget <= 0) {
    breakdown.budget = WEIGHTS.budget;
  } else if (program.tuition <= budget) {
    breakdown.budget = WEIGHTS.budget;
    reasons.push(`Tuition ($${program.tuition.toLocaleString()}/yr) is within your budget.`);
  } else if (program.tuition <= budget * 1.2) {
    breakdown.budget = Math.round(WEIGHTS.budget * 0.5);
    gaps.push(`Tuition is slightly above your budget ($${program.tuition.toLocaleString()} vs $${budget.toLocaleString()}).`);
  } else {
    breakdown.budget = 0;
    gaps.push(`Tuition ($${program.tuition.toLocaleString()}/yr) is above your budget of $${budget.toLocaleString()}.`);
  }

  // 6. Deadline
  const days = daysUntil(program.deadline);
  if (days < 0) {
    breakdown.deadline = 0;
    gaps.push('The application deadline for this intake has passed.');
  } else if (days < 30) {
    breakdown.deadline = Math.round(WEIGHTS.deadline * 0.4);
    gaps.push(`Deadline is close: ${days} days left.`);
  } else {
    breakdown.deadline = WEIGHTS.deadline;
    reasons.push(`${days} days until the deadline.`);
  }

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score, breakdown, reasons, gaps };
}

export function rankPrograms(profile, programs) {
  return programs
    .map((program) => ({ program, ...scoreProgram(profile, program) }))
    .sort((a, b) => b.score - a.score);
}

export function scoreLabel(score) {
  if (score >= 80) return { text: 'Strong fit', variant: 'success' };
  if (score >= 55) return { text: 'Possible fit', variant: 'warning' };
  return { text: 'Weak fit', variant: 'secondary' };
}

/**
 * Placeholder for the AI explanation (Milestone 2 will call an LLM).
 * For now a rule-based sentence is built from the scoring result.
 */
const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1).replace(/\.$/, '');

export function buildExplanation({ program, score, reasons, gaps }) {
  const lead = `${program.title} scores ${score}/100 for you.`;
  const good = reasons.length ? ` Main strengths: ${lowerFirst(reasons[0])}.` : '';
  const todo = gaps.length ? ` To improve your fit: ${lowerFirst(gaps[0])}.` : ' You meet every listed requirement.';
  return lead + good + todo;
}
