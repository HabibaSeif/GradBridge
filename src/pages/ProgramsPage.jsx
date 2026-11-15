import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ProgramCard from '../components/ProgramCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, FIELDS } from '../data/mockPrograms';
import { api } from '../services/mockApi';
import { scoreProgram } from '../utils/matching';
import { useAsync } from '../utils/useAsync';

const SORTS = [
  { value: 'match', label: 'Best match' },
  { value: 'deadline', label: 'Deadline (soonest)' },
  { value: 'tuition', label: 'Tuition (lowest)' },
  { value: 'title', label: 'Name (A–Z)' },
];

/** Search and filter programs. Filters live in the URL so results can be shared or bookmarked. */
export default function ProgramsPage() {
  const { user, profile } = useAuth();
  const { data: programs, loading, error, reload } = useAsync(() => api.listPrograms(), []);
  const [params, setParams] = useSearchParams();

  const showMatch = user?.role === 'student' && !!profile;
  const q = params.get('q') || '';
  const field = params.get('field') || '';
  const country = params.get('country') || '';
  const maxTuition = params.get('max') || '';
  const sort = params.get('sort') || (showMatch ? 'match' : 'deadline');

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const results = useMemo(() => {
    if (!programs) return [];
    const term = q.trim().toLowerCase();
    let list = programs
      .filter((p) => !term || [p.title, p.school?.name, p.city, p.field, ...p.tags].join(' ').toLowerCase().includes(term))
      .filter((p) => !field || p.field === field)
      .filter((p) => !country || p.country === country)
      .filter((p) => !maxTuition || p.tuition <= Number(maxTuition))
      .map((p) => ({ program: p, match: showMatch ? scoreProgram(profile, p) : null }));

    const sorters = {
      match: (a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0),
      deadline: (a, b) => a.program.deadline.localeCompare(b.program.deadline),
      tuition: (a, b) => a.program.tuition - b.program.tuition,
      title: (a, b) => a.program.title.localeCompare(b.program.title),
    };
    return [...list].sort(sorters[sort] || sorters.deadline);
  }, [programs, q, field, country, maxTuition, sort, showMatch, profile]);

  const hasFilters = q || field || country || maxTuition;

  return (
    <>
      <PageHeader title="Programs" subtitle="Search master’s programs and filter by field, country and tuition." />
      <div className="container">
        <form className="card card-body mb-4 shadow-sm" role="search" aria-label="Filter programs" onSubmit={(e) => e.preventDefault()}>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-lg-4">
              <label htmlFor="search" className="form-label">Search</label>
              <input id="search" type="search" className="form-control" placeholder="e.g. AI, Delft, finance"
                value={q} onChange={(e) => setParam('q', e.target.value)} />
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="field" className="form-label">Field</label>
              <select id="field" className="form-select" value={field} onChange={(e) => setParam('field', e.target.value)}>
                <option value="">All fields</option>
                {FIELDS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="country" className="form-label">Country</label>
              <select id="country" className="form-select" value={country} onChange={(e) => setParam('country', e.target.value)}>
                <option value="">All countries</option>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="max" className="form-label">Max tuition</label>
              <select id="max" className="form-select" value={maxTuition} onChange={(e) => setParam('max', e.target.value)}>
                <option value="">Any</option>
                <option value="5000">Up to $5,000</option>
                <option value="10000">Up to $10,000</option>
                <option value="20000">Up to $20,000</option>
                <option value="30000">Up to $30,000</option>
              </select>
            </div>
            <div className="col-6 col-md-3 col-lg-2">
              <label htmlFor="sort" className="form-label">Sort by</label>
              <select id="sort" className="form-select" value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                {SORTS.filter((s) => s.value !== 'match' || showMatch).map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {!showMatch && user?.role !== 'school' && (
          <div className="alert alert-info small" role="note">
            {user ? 'Complete your profile' : 'Log in as a student'} to see a personal match score on every program.
          </div>
        )}

        {loading && <LoadingState label="Loading programs…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && (
          <>
            <p className="text-secondary small" aria-live="polite">
              {results.length} program{results.length === 1 ? '' : 's'} found
            </p>
            {results.length === 0 ? (
              <EmptyState
                icon="🔍"
                title="No programs match these filters"
                message="Try removing a filter or searching for a broader term."
                actionLabel={hasFilters ? 'Clear all filters' : undefined}
                onAction={() => setParams({}, { replace: true })}
              />
            ) : (
              <div className="row g-4">
                {results.map(({ program, match }) => (
                  <div className="col-12 col-md-6 col-xl-4" key={program.id}>
                    <ProgramCard program={program} match={match} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
