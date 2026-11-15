import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/FormFields';
import { FormAlert } from '../components/StatusViews';
import { email, required, validate } from '../utils/validation';

const RULES = {
  email: [required('Email'), email],
  password: [required('Password')],
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (touched[e.target.name]) setErrors(validate(next, RULES));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(values, RULES));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values, RULES);
    setErrors(errs);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      const user = await login(values);
      const fallback = user.role === 'school' ? '/school' : '/matches';
      navigate(location.state?.from || fallback, { replace: true });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role) =>
    setValues({ email: role === 'school' ? 'school@demo.edu' : 'student@demo.edu', password: 'Demo1234' });

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 mb-1">Log in</h1>
              <p className="text-secondary">Welcome back to GradBridge.</p>

              {location.state?.message && <FormAlert type="info">{location.state.message}</FormAlert>}
              <FormAlert type="danger" onClose={() => setServerError('')}>{serverError}</FormAlert>

              <form onSubmit={handleSubmit} noValidate>
                <TextField id="email" label="Email" type="email" autoComplete="email" required
                  value={values.email} onChange={handleChange} onBlur={handleBlur} error={touched.email && errors.email} />
                <TextField id="password" label="Password" type="password" autoComplete="current-password" required
                  value={values.password} onChange={handleChange} onBlur={handleBlur} error={touched.password && errors.password} />
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Logging in…</>) : 'Log in'}
                </button>
              </form>

              <p className="mt-3 mb-0 small text-center">
                No account? <Link to="/register">Sign up</Link>
              </p>
            </div>
          </div>

          <div className="card mt-3 border-warning-subtle bg-warning-subtle">
            <div className="card-body small">
              <span className="badge text-bg-warning me-1">Mock data</span>
              Demo accounts (password <code>Demo1234</code>):
              <div className="d-flex flex-wrap gap-2 mt-2">
                <button type="button" className="btn btn-sm btn-light" onClick={() => fillDemo('student')}>Fill student demo</button>
                <button type="button" className="btn btn-sm btn-light" onClick={() => fillDemo('school')}>Fill school demo</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
