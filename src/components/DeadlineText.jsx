import { daysUntil } from '../utils/matching';
import { formatDate } from '../utils/format';

/** Deadline with urgency wording (text, not only colour). */
export default function DeadlineText({ deadline }) {
  const days = daysUntil(deadline);
  const date = formatDate(deadline);
  if (days < 0) return <span className="text-danger">Closed ({date})</span>;
  if (days < 30) return <span className="text-warning-emphasis fw-semibold">{date} · {days} days left</span>;
  return <span>{date}</span>;
}
