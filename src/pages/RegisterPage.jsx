import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/FormFields';
import { FormAlert } from '../components/StatusViews';
import { email, minLength, password, required, validate } from '../utils/validation';

function rulesFor(role) {
  return {
    name: [required('Full name'), minLength(2, 'Full name')],
    ...(role === 'school' ? { schoolName: [required('School name'), minLength(3, 'School name')] } : {}),
    email: [required('Email'), email],
    password: [required('Password'), password],
    confirm: [required('Confirm password'), (v, all) => (v !== all.password ? 'Passwords do not match.' : '')],
    terms: [(v) => (!v ? 'You must accept the terms to continue.' : '')],
  };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [values, setValues] = useState({
    role: params.get('role') === 'school' ? 'school' : 'student',
    name: '', schoolName: '', email: '', password: '', confirm: '', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const rules = rulesFor(values.role);

  const update = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name] || touched.confirm) setErrors(validate(next, rulesFor(next.role)));
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    update(name, type === 'checkbox' ? checked : value);
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(values, rules));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values, rules);
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(rules).map((k) => [k, true])));
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setSubmitting(true);
    setServerError('');
    try {
      const user = await register(values);
      if (user.role === 'school') navigate('/school', { state: { message: 'Your school account is ready. Add your first program.' } });
      else navigate('/profile', { state: { message: 'Account created! Complete your profile to see your matches.' } });
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const err = (k) => touched[k] && errors[k];

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 mb-1">Create your account</h1>
              <p className="text-secondary">It takes less than a minute.</p>
              <FormAlert type="danger" onClose={() => setServerError('')}>{serverError}</FormAlert>

              <form onSubmit={handleSubmit} noValidate>
                <fieldset className="mb-3">
                  <legend className="form-label fs-6">I am a…</legend>
                  <div className="btn-group w-100" role="group">
                    <input type="radio" className="btn-check" name="role" id="role-student" value="student"
                      checked={values.role === 'student'} onChange={handleChange} />
                    <label className="btn btn-outline-primary" htmlFor="role-student">🎓 Student</label>
                    <input type="radio" className="btn-check" name="role" id="role-school" value="school"
                      checked={values.role === 'school'} onChange={handleChange} />
                    <label className="btn btn-outline-primary" htmlFor="role-school">🏛️ Graduate school</label>
                  </div>
                </fieldset>

                <TextField id="name" label={values.role === 'school' ? 'Contact person' : 'Full name'} required autoComplete="name"
                  value={values.name} onChange={handleChange} onBlur={handleBlur} error={err('name')} />
                {values.role === 'school' && (
                  <TextField id="schoolName" label="School / department name" required
                    value={values.schoolName} onChange={handleChange} onBlur={handleBlur} error={err('schoolName')} />
                )}
                <TextField id="email" label="Email" type="email" required autoComplete="email"
                  help={values.role === 'school' ? 'Use your official admissions email.' : 'Your university email works best.'}
                  value={values.email} onChange={handleChange} onBlur={handleBlur} error={err('email')} />
                <div className="row">
                  <TextField className="col-12 col-md-6" id="password" label="Password" type="password" required autoComplete="new-password"
                    help="At least 8 characters, with a letter and a number."
                    value={values.password} onChange={handleChange} onBlur={handleBlur} error={err('password')} />
                  <TextField className="col-12 col-md-6" id="confirm" label="Confirm password" type="password" required autoComplete="new-password"
                    value={values.confirm} onChange={handleChange} onBlur={handleBlur} error={err('confirm')} />
                </div>
                <div className="form-check mb-3">
                  <input className={`form-check-input ${err('terms') ? 'is-invalid' : ''}`} type="checkbox" id="terms" name="terms"
                    checked={values.terms} onChange={handleChange} onBlur={handleBlur} aria-invalid={!!err('terms')}
                    aria-describedby={err('terms') ? 'terms-error' : undefined} />
                  <label className="form-check-label" htmlFor="terms">
                    I understand match scores are guidance, not admission decisions.
                  </label>
                  {err('terms') && <div id="terms-error" className="invalid-feedback d-block">{errors.terms}</div>}
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                  {submitting ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Creating account…</>) : 'Create account'}
                </button>
              </form>
              <p className="mt-3 mb-0 small text-center">
                Already registered? <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
