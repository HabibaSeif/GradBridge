import { Link, useParams } from 'react-router-dom';
import DeadlineText from '../components/DeadlineText';
import FitDetails from '../components/FitDetails';
import MatchScore from '../components/MatchScore';
import SaveButton from '../components/SaveButton';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { buildExplanation, scoreProgram } from '../utils/matching';
import { formatMoney } from '../utils/format';
import { useAsync } from '../utils/useAsync';

export default function ProgramDetailsPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { data: program, loading, error, reload } = useAsync(() => api.getProgram(id), [id]);

  if (loading) return <div className="container"><LoadingState label="Loading program…" /></div>;
  if (error?.message === 'NOT_FOUND') {
    return (
      <div className="container py-5">
        <EmptyState icon="🗂️" title="Program not found" message="It may have been removed by the school." actionLabel="Back to programs" actionTo="/programs" />
      </div>
    );
  }
  if (error) return <div className="container py-5"><ErrorState error={error} onRetry={reload} /></div>;

  const match = user?.role === 'student' && profile ? scoreProgram(profile, program) : null;
  const req = program.languageReq;

  return (
    <div className="container py-4">
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/programs">Programs</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{program.title}</li>
        </ol>
      </nav>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <p className="text-secondary mb-1">{program.school?.name}</p>
          <h1 className="h2">{program.title}</h1>
          <p className="text-secondary">
            {program.degreeType} · {program.city}, {program.country} · {program.durationMonths} months
          </p>
          <div className="d-flex flex-wrap gap-1 mb-3">
            {program.tags.map((t) => <span key={t} className="badge rounded-pill text-bg-light border">{t}</span>)}
          </div>
          <p>{program.description}</p>

          <h2 className="h5 mt-4">Entry requirements</h2>
          <div className="table-responsive">
            <table className="table table-sm align-middle">
              <tbody>
                <tr><th scope="row" className="w-50">Minimum GPA (4.0 scale)</th><td>{program.minGpa.toFixed(1)}</td></tr>
                <tr><th scope="row">English test</th><td>{req ? `IELTS ${req.ielts} or TOEFL iBT ${req.toefl}` : 'Not required'}</td></tr>
                <tr><th scope="row">Tuition per year</th><td>{formatMoney(program.tuition)}</td></tr>
                <tr><th scope="row">Application deadline</th><td><DeadlineText deadline={program.deadline} /></td></tr>
              </tbody>
            </table>
          </div>

          {match && (
            <section className="card mt-4" aria-labelledby="fit-heading">
              <div className="card-body">
                <h2 id="fit-heading" className="h5">Your fit</h2>
                <p className="small fst-italic text-secondary">
                  {buildExplanation({ program, ...match })}
                  <span className="badge text-bg-light border ms-2">Rule-based summary · AI explanation in Milestone 2</span>
                </p>
                <FitDetails reasons={match.reasons} gaps={match.gaps} />
              </div>
            </section>
          )}
        </div>

        <aside className="col-12 col-lg-4">
          <div className="card shadow-sm sticky-panel">
            <div className="card-body">
              {match ? (
                <div className="d-flex justify-content-center mb-3"><MatchScore score={match.score} size="lg" /></div>
              ) : user?.role !== 'school' && (
                <p className="small text-secondary">
                  {user ? <><Link to="/profile">Complete your profile</Link> to see your match score.</> : <><Link to="/login" state={{ from: `/programs/${id}` }}>Log in</Link> to see your match score.</>}
                </p>
              )}
              <div className="d-grid gap-2">
                {user?.role !== 'school' && (
                  <Link to={`/programs/${program.id}/inquire`} className="btn btn-primary">Contact the school</Link>
                )}
                <SaveButton program={program} size="md" />
                {user?.role === 'student' && (
                  <Link to={`/what-if?program=${program.id}`} className="btn btn-outline-primary">Try “what if” for this program</Link>
                )}
              </div>
              <hr />
              <p className="small mb-1"><strong>Contact:</strong> {program.school?.contactEmail}</p>
              <p className="small mb-0"><strong>Website:</strong> <a href={program.school?.website} target="_blank" rel="noreferrer">{program.school?.name}<span className="visually-hidden"> (opens in new tab)</span></a></p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
