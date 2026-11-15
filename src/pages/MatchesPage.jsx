import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FitDetails from '../components/FitDetails';
import PageHeader from '../components/PageHeader';
import ProgramCard from '../components/ProgramCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { buildExplanation, rankPrograms } from '../utils/matching';
import { useAsync } from '../utils/useAsync';

const MIN_SCORES = [
  { value: 0, label: 'All programs' },
  { value: 55, label: 'Possible fit or better (55+)' },
  { value: 80, label: 'Strong fit only (80+)' },
];

/** Ranked list of programs for the logged-in student, with explanations and gaps. */
export default function MatchesPage() {
  const { profile, profileReady } = useAuth();
  const { data: programs, loading, error, reload } = useAsync(() => api.listPrograms(), []);
  const [minScore, setMinScore] = useState(0);
  const [hideClosed, setHideClosed] = useState(true);

  const ranked = useMemo(() => {
    if (!programs || !profile) return [];
    return rankPrograms(profile, programs)
      .filter((m) => m.score >= minScore)
      .filter((m) => !hideClosed || !m.gaps.some((g) => g.includes('deadline for this intake has passed')));
  }, [programs, profile, minScore, hideClosed]);

  if (!profileReady) return <div className="container"><LoadingState label="Loading your profile…" /></div>;
  if (!profile) {
    return (
      <>
        <PageHeader title="My matches" />
        <div className="container">
          <EmptyState icon="🧭" title="Tell us about yourself first"
            message="We need your major, GPA and interests to rank programs for you."
            actionLabel="Complete my profile" actionTo="/profile" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="My matches" subtitle="Programs ranked by how well they fit your profile. Scores are guidance, not admission predictions.">
        <Link to="/what-if" className="btn btn-outline-primary">Try “what if”</Link>
        <Link to="/profile" className="btn btn-outline-secondary">Edit profile</Link>
      </PageHeader>
      <div className="container">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <label htmlFor="min-score" className="form-label mb-0 text-nowrap">Show</label>
            <select id="min-score" className="form-select form-select-sm" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))}>
              {MIN_SCORES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="form-check form-switch mb-0">
            <input className="form-check-input" type="checkbox" role="switch" id="hide-closed" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} />
            <label className="form-check-label" htmlFor="hide-closed">Hide closed deadlines</label>
          </div>
          <details className="ms-md-auto small">
            <summary>How is the score calculated?</summary>
            <p className="mb-0 mt-2">Field 35 · GPA 25 · English 15 · Location 10 · Budget 10 · Deadline 5 points.</p>
          </details>
        </div>

        {loading && <LoadingState label="Ranking programs for you…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && ranked.length === 0 && (
          <EmptyState icon="🎯" title="No programs at this level yet"
            message="Lower the minimum score, or use the what-if simulator to see what would change your results."
            actionLabel="Show all programs" onAction={() => { setMinScore(0); setHideClosed(false); }} />
        )}
        {!loading && !error && ranked.length > 0 && (
          <ol className="list-unstyled d-grid gap-4" aria-label="Ranked program matches">
            {ranked.map((m, i) => (
              <li key={m.program.id}>
                <ProgramCard program={m.program} match={m} wide>
                  <p className="small mb-2">
                    <span className="badge text-bg-dark me-2">#{i + 1}</span>
                    <span className="fst-italic">{buildExplanation(m)}</span>
                  </p>
                  <FitDetails reasons={m.reasons} gaps={m.gaps} />
                </ProgramCard>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
