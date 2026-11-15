import { Link } from 'react-router-dom';
import MatchScore from './MatchScore';
import SaveButton from './SaveButton';
import DeadlineText from './DeadlineText';
import { formatMoney } from '../utils/format';

/**
 * Card used on Programs, Matches and Saved pages.
 * Pass `match` ({score, reasons, gaps}) to show the score and fit summary.
 */
export default function ProgramCard({ program, match, wide = false, children }) {
  return (
    <article className="card h-100 shadow-sm program-card">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
          <div>
            <p className="text-secondary small mb-1">{program.school?.name}</p>
            <h2 className="h5 card-title mb-1">
              <Link to={`/programs/${program.id}`} className="link-body-emphasis text-decoration-none">
                {program.title}
              </Link>
            </h2>
            <p className="small text-secondary mb-0">
              {program.city}, {program.country}
            </p>
          </div>
          {match && <MatchScore score={match.score} size="sm" />}
        </div>

        <dl className={`small mb-2 program-facts ${wide ? 'program-facts-wide' : ''}`}>
          <dt>Field</dt>
          <dd>{program.field}</dd>
          <dt>Tuition / yr</dt>
          <dd>{formatMoney(program.tuition)}</dd>
          <dt>Min GPA</dt>
          <dd>{program.minGpa.toFixed(1)}</dd>
          <dt>Deadline</dt>
          <dd><DeadlineText deadline={program.deadline} /></dd>
        </dl>

        {children}

        <div className="mt-auto d-flex flex-wrap gap-2 pt-2">
          <Link to={`/programs/${program.id}`} className="btn btn-sm btn-primary">
            View details<span className="visually-hidden"> for {program.title}</span>
          </Link>
          <SaveButton program={program} />
        </div>
      </div>
    </article>
  );
}
