import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormAlert } from '../components/StatusViews';

const STEPS = [
  { icon: '📝', title: 'Build your profile once', text: 'Enter your major, GPA, English score, interests, countries and budget, or upload your CV to pre-fill them.' },
  { icon: '🎯', title: 'See ranked, explained matches', text: 'Every program gets a score out of 100 with the reasons it fits and the gaps you still need to close.' },
  { icon: '🔁', title: 'Try “what if”', text: 'Change your GPA or add an IELTS score and watch the ranking update instantly.' },
  { icon: '✉️', title: 'Save and contact schools', text: 'Keep a shortlist with deadlines and send an inquiry to the school without leaving the platform.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const { state } = useLocation();

  const primaryCta = !user
    ? { to: '/register', label: 'Create a free student profile' }
    : user.role === 'student'
      ? { to: '/matches', label: 'See my matches' }
      : { to: '/school', label: 'Go to school dashboard' };

  return (
    <>
      <section className="hero py-5">
        <div className="container py-lg-4">
          {state?.message && <FormAlert type="info">{state.message}</FormAlert>}
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              <p className="text-uppercase small fw-semibold text-primary mb-2">For undergraduates planning a master’s</p>
              <h1 className="display-5 fw-bold mb-3">Find the master’s programs that actually fit you.</h1>
              <p className="lead text-secondary mb-4">
                GradBridge compares your profile with each program’s requirements, explains every match, and shows exactly
                what is missing, so you don’t have to work it out across fifty university websites.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-2">
                <Link to={primaryCta.to} className="btn btn-primary btn-lg">{primaryCta.label}</Link>
                <Link to="/programs" className="btn btn-outline-secondary btn-lg">Browse programs</Link>
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="card shadow border-0 hero-card" aria-label="Example match result">
                <div className="card-body p-4">
                  <p className="small text-secondary mb-1">Example result</p>
                  <h2 className="h5 mb-1">MSc Data Science &amp; Society</h2>
                  <p className="small text-secondary">Delft, Netherlands</p>
                  <div className="progress mb-2" role="progressbar" aria-label="Match score" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100}>
                    <div className="progress-bar bg-success" style={{ width: '85%' }}>85 / 100</div>
                  </div>
                  <ul className="list-unstyled small mb-0">
                    <li className="text-success-emphasis">✓ GPA 3.4 meets the minimum of 3.2</li>
                    <li className="text-success-emphasis">✓ Netherlands is a preferred country</li>
                    <li className="text-danger-emphasis">! Needs IELTS 6.5; your score is not yet listed</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5" aria-labelledby="how-heading">
        <h2 id="how-heading" className="h3 text-center mb-4">How it works</h2>
        <div className="row g-4">
          {STEPS.map((s) => (
            <div className="col-12 col-sm-6 col-lg-3" key={s.title}>
              <div className="card h-100 border-0 bg-body-tertiary">
                <div className="card-body">
                  <div className="fs-2 mb-2" aria-hidden="true">{s.icon}</div>
                  <h3 className="h6">{s.title}</h3>
                  <p className="small text-secondary mb-0">{s.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-4" aria-labelledby="schools-heading">
        <div className="p-4 p-md-5 rounded-4 bg-primary-subtle d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
          <div>
            <h2 id="schools-heading" className="h4">Are you a graduate school?</h2>
            <p className="mb-0">List your programs, keep requirements up to date and answer inquiries from students who already fit.</p>
          </div>
          <Link to="/register?role=school" className="btn btn-dark">Register your school</Link>
        </div>
      </section>
    </>
  );
}
