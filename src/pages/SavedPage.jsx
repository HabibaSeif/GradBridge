import { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import ProgramCard from '../components/ProgramCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { daysUntil, scoreProgram } from '../utils/matching';
import { formatDate } from '../utils/format';
import { useAsync } from '../utils/useAsync';

/** The student's shortlist, ordered by the nearest deadline. */
export default function SavedPage() {
  const { saved, profile } = useAuth();
  const { data: programs, loading, error, reload } = useAsync(() => api.listPrograms(), []);

  const items = useMemo(() => {
    if (!programs) return [];
    return saved
      .map((s) => ({ ...s, program: programs.find((p) => p.id === s.programId) }))
      .filter((s) => s.program)
      .sort((a, b) => a.program.deadline.localeCompare(b.program.deadline));
  }, [programs, saved]);

  const upcoming = items.filter((i) => daysUntil(i.program.deadline) >= 0);

  return (
    <>
      <PageHeader title="Saved programs" subtitle="Your shortlist, sorted by the nearest deadline." />
      <div className="container">
        {loading && <LoadingState label="Loading your shortlist…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState icon="☆" title="No saved programs yet"
            message="Press “Save” on any program to keep it here with its deadline."
            actionLabel="Find programs" actionTo="/programs" />
        )}
        {!loading && !error && items.length > 0 && (
          <>
            {upcoming[0] && (
              <div className="alert alert-warning d-flex gap-2" role="note">
                <span aria-hidden="true">⏰</span>
                <span>Next deadline: <strong>{upcoming[0].program.title}</strong> on {formatDate(upcoming[0].program.deadline)} ({daysUntil(upcoming[0].program.deadline)} days).</span>
              </div>
            )}
            <div className="row g-4">
              {items.map(({ program, dateSaved }) => (
                <div className="col-12 col-md-6 col-xl-4" key={program.id}>
                  <ProgramCard program={program} match={profile ? scoreProgram(profile, program) : null}>
                    <p className="small text-secondary mb-0">Saved on {formatDate(dateSaved)}</p>
                  </ProgramCard>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
