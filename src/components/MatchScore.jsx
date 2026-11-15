import { scoreLabel } from '../utils/matching';

/** Circular-looking score badge with a text label (never colour alone). */
export default function MatchScore({ score, size = 'md' }) {
  const { text, variant } = scoreLabel(score);
  return (
    <div className={`match-score match-score-${size} text-center`}>
      <div
        className={`match-score-ring border-${variant} text-${variant === 'warning' ? 'warning-emphasis' : variant}`}
        aria-label={`Match score ${score} out of 100, ${text}`}
        role="img"
      >
        <span className="fw-bold">{score}</span>
      </div>
      <span className={`badge rounded-pill text-bg-${variant} mt-1`}>{text}</span>
    </div>
  );
}
