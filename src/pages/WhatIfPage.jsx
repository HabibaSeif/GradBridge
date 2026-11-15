import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { rankPrograms, scoreLabel } from '../utils/matching';
import { formatMoney } from '../utils/format';
import { useAsync } from '../utils/useAsync';

function RangeControl({ id, label, min, max, step, value, onChange, format = (v) => v, enabled, onToggle, toggleLabel }) {
  return (
    <div className="mb-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <label htmlFor={id} className="form-label mb-0 fw-semibold">{label}</label>
        <output htmlFor={id} className="badge text-bg-primary fs-6">{enabled ? format(value) : 'Not set'}</output>
      </div>
      {onToggle && (
        <div className="form-check form-switch small mb-1">
          <input className="form-check-input" type="checkbox" role="switch" id={`${id}-on`} checked={enabled} onChange={(e) => onToggle(e.target.checked)} />
          <label className="form-check-label" htmlFor={`${id}-on`}>{toggleLabel}</label>
        </div>
      )}
      <input type="range" className="form-range" id={id} min={min} max={max} step={step} value={value}
        disabled={!enabled} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

/** Change profile values and compare the new ranking with the current one. Nothing is saved. */
export default function WhatIfPage() {
  const { profile, profileReady } = useAuth();
  if (!profileReady) return <div className="container"><LoadingState label="Loading your profile…" /></div>;
  if (!profile) {
    return (
      <>
        <PageHeader title="What-if simulator" />
        <div className="container">
          <EmptyState icon="🔁" title="Your profile is empty" message="Save a profile first so we have a starting point to compare against."
            actionLabel="Complete my profile" actionTo="/profile" />
        </div>
      </>
    );
  }
  return <WhatIfSimulator profile={profile} />;
}

function WhatIfSimulator({ profile }) {
  const [params] = useSearchParams();
  const focusId = params.get('program');
  const { data: programs, loading, error, reload } = useAsync(() => api.listPrograms(), []);

  const base = useMemo(() => ({
    gpa: Number(profile?.gpa) || 3.0,
    ielts: profile?.ielts === '' || profile?.ielts == null ? null : Number(profile.ielts),
    budget: profile?.budget === '' || profile?.budget == null ? null : Number(profile.budget),
  }), [profile]);

  const [gpa, setGpa] = useState(base.gpa);
  const [ieltsOn, setIeltsOn] = useState(base.ielts !== null);
  const [ielts, setIelts] = useState(base.ielts ?? 6.5);
  const [budgetOn, setBudgetOn] = useState(base.budget !== null);
  const [budget, setBudget] = useState(base.budget ?? 20000);

  const comparison = useMemo(() => {
    if (!programs) return [];
    const before = rankPrograms(profile, programs);
    const whatIf = { ...profile, gpa, ielts: ieltsOn ? ielts : '', budget: budgetOn ? budget : '' };
    const after = rankPrograms(whatIf, programs);
    return after.map((a, newIdx) => {
      const oldIdx = before.findIndex((b) => b.program.id === a.program.id);
      return { ...a, oldScore: before[oldIdx].score, oldRank: oldIdx + 1, newRank: newIdx + 1 };
    });
  }, [programs, profile, gpa, ielts, ieltsOn, budget, budgetOn]);

  const reset = () => {
    setGpa(base.gpa);
    setIeltsOn(base.ielts !== null);
    setIelts(base.ielts ?? 6.5);
    setBudgetOn(base.budget !== null);
    setBudget(base.budget ?? 20000);
  };

  const improved = comparison.filter((c) => c.score > c.oldScore).length;

  return (
    <>
      <PageHeader title="What-if simulator" subtitle="Move the sliders to see how your matches would change. Your saved profile is not modified." />
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <section className="card shadow-sm sticky-panel" aria-labelledby="whatif-controls">
              <div className="card-body">
                <h2 id="whatif-controls" className="h5 mb-3">Change your profile</h2>
                <RangeControl id="wi-gpa" label="GPA" min={2} max={4} step={0.05} value={gpa} onChange={setGpa}
                  format={(v) => v.toFixed(2)} enabled />
                <RangeControl id="wi-ielts" label="IELTS score" min={4} max={9} step={0.5} value={ielts} onChange={setIelts}
                  enabled={ieltsOn} onToggle={setIeltsOn} toggleLabel="I have an IELTS score" />
                <RangeControl id="wi-budget" label="Budget" min={2000} max={40000} step={1000} value={budget} onChange={setBudget}
                  format={(v) => `${formatMoney(v)}/yr`} enabled={budgetOn} onToggle={setBudgetOn} toggleLabel="Set a budget limit" />
                <div className="d-grid gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={reset}>Reset to my profile</button>
                  <Link to="/profile" className="btn btn-link btn-sm">Update my real profile</Link>
                </div>
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-8">
            {loading && <LoadingState label="Loading programs…" />}
            {error && <ErrorState error={error} onRetry={reload} />}
            {!loading && !error && (
              <>
                <p className="alert alert-light border" aria-live="polite">
                  {improved > 0
                    ? <>With these changes, <strong>{improved}</strong> program{improved > 1 ? 's' : ''} would score higher for you.</>
                    : 'Change a value on the left to compare.'}
                </p>
                <div className="table-responsive">
                  <table className="table align-middle whatif-table">
                    <caption className="visually-hidden">Ranking before and after your changes</caption>
                    <thead>
                      <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Program</th>
                        <th scope="col" className="text-end">Now</th>
                        <th scope="col" className="text-end">What-if</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.map((c) => {
                        const diff = c.score - c.oldScore;
                        const moved = c.oldRank - c.newRank;
                        return (
                          <tr key={c.program.id} className={c.program.id === focusId ? 'table-primary' : undefined}>
                            <td className="text-nowrap">
                              {c.newRank}
                              {moved !== 0 && (
                                <span className={`small ms-1 ${moved > 0 ? 'text-success' : 'text-danger'}`}>
                                  {moved > 0 ? `▲${moved}` : `▼${-moved}`}
                                  <span className="visually-hidden">{moved > 0 ? ' places up' : ' places down'}</span>
                                </span>
                              )}
                            </td>
                            <td>
                              <Link to={`/programs/${c.program.id}`} className="fw-semibold">{c.program.title}</Link>
                              <div className="small text-secondary">{c.program.school?.name}</div>
                              {c.gaps[0] && <div className="small text-danger-emphasis">! {c.gaps[0]}</div>}
                            </td>
                            <td className="text-end text-secondary">{c.oldScore}</td>
                            <td className="text-end text-nowrap">
                              <span className={`badge text-bg-${scoreLabel(c.score).variant}`}>{c.score}</span>
                              {diff !== 0 && (
                                <span className={`small ms-1 ${diff > 0 ? 'text-success' : 'text-danger'}`}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
