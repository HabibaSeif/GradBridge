import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { CheckboxGroup, SelectField, TextField } from '../components/FormFields';
import { ErrorState, FormAlert, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, FIELDS, INTERESTS } from '../data/mockPrograms';
import { api } from '../services/mockApi';
import { numberRange, required, validate } from '../utils/validation';
import { useAsync } from '../utils/useAsync';

const EMPTY = { major: '', gpa: '', ielts: '', toefl: '', interests: [], preferredCountries: [], budget: '' };
const MAX_CV_BYTES = 5 * 1024 * 1024;
const CV_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const RULES = {
  major: [required('Major')],
  gpa: [required('GPA'), numberRange(0, 4, 'GPA')],
  ielts: [numberRange(0, 9, 'IELTS score')],
  toefl: [numberRange(0, 120, 'TOEFL score')],
  interests: [required('At least one interest')],
  budget: [numberRange(0, 200000, 'Budget')],
};

/** Wrapper: loads the saved profile, then renders the form with it. */
export default function ProfilePage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.getProfile(user.id), [user.id]);
  const { state } = useLocation();

  return (
    <>
      <PageHeader title="My profile" subtitle="Your profile drives every match score. You only need to fill it in once." />
      <div className="container">
        {state?.message && <FormAlert type="info">{state.message}</FormAlert>}
        {loading && <LoadingState label="Loading your profile…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && <ProfileForm initial={{ ...EMPTY, ...(data || {}) }} isNew={!data} />}
      </div>
    </>
  );
}

function ProfileForm({ initial, isNew }) {
  const { saveProfile } = useAuth();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saveState, setSaveState] = useState({ state: 'idle', message: '' });
  const [cv, setCv] = useState({ file: null, state: 'idle', message: '' });

  const set = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    setSaveState({ state: 'idle', message: '' });
    if (touched[name]) setErrors(validate(next, RULES));
  };
  const handleChange = (e) => set(e.target.name, e.target.value);
  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(values, RULES));
  };
  const err = (k) => touched[k] && errors[k];

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return setCv({ file: null, state: 'idle', message: '' });
    if (!CV_TYPES.includes(file.type) && !/\.(pdf|docx)$/i.test(file.name)) {
      return setCv({ file: null, state: 'error', message: 'Please upload a PDF or Word (.docx) file.' });
    }
    if (file.size > MAX_CV_BYTES) {
      return setCv({ file: null, state: 'error', message: 'The file is larger than 5 MB.' });
    }
    setCv({ file, state: 'ready', message: '' });
  };

  const extractCv = async () => {
    setCv((c) => ({ ...c, state: 'reading', message: '' }));
    try {
      const extracted = await api.parseCv(cv.file);
      const next = {
        ...values,
        major: extracted.major,
        gpa: String(extracted.gpa),
        ielts: String(extracted.ielts),
        interests: Array.from(new Set([...values.interests, ...extracted.interests])),
      };
      setValues(next);
      setErrors(validate(next, RULES));
      setCv((c) => ({ ...c, state: 'done', message: 'We filled in your major, GPA, IELTS score and interests. Please review them before saving.' }));
    } catch (e) {
      setCv((c) => ({ ...c, state: 'error', message: e.message }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values, RULES);
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(RULES).map((k) => [k, true])));
    if (Object.keys(errs).length) {
      setSaveState({ state: 'invalid', message: `Please fix ${Object.keys(errs).length} field${Object.keys(errs).length > 1 ? 's' : ''} highlighted below.` });
      document.getElementById(Object.keys(errs)[0] === 'interests' ? 'interests-0' : Object.keys(errs)[0])?.focus();
      return;
    }
    setSaveState({ state: 'saving', message: '' });
    try {
      await saveProfile({
        ...values,
        gpa: Number(values.gpa),
        budget: values.budget === '' ? '' : Number(values.budget),
      });
      setSaveState({ state: 'saved', message: '' });
    } catch (e2) {
      setSaveState({ state: 'error', message: e2.message });
    }
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-4 order-lg-2">
        <section className="card shadow-sm" aria-labelledby="cv-heading">
          <div className="card-body">
            <h2 id="cv-heading" className="h5">Upload your CV <span className="badge text-bg-warning align-middle">Mock</span></h2>
            <p className="small text-secondary">
              We read your CV and pre-fill the form. In this prototype the extraction is simulated; Milestone 2 connects it to the AI service.
            </p>
            <label htmlFor="cv" className="form-label">CV file (PDF or DOCX, max 5 MB)</label>
            <input id="cv" type="file" accept=".pdf,.docx" className={`form-control ${cv.state === 'error' ? 'is-invalid' : ''}`}
              onChange={handleCvChange} aria-describedby="cv-status" aria-invalid={cv.state === 'error'} />
            <div id="cv-status" aria-live="polite" className="mt-2 small">
              {cv.state === 'error' && <span className="text-danger">{cv.message}</span>}
              {cv.state === 'done' && <span className="text-success">✓ {cv.message}</span>}
              {cv.state === 'reading' && <span><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Reading your CV…</span>}
            </div>
            <button type="button" className="btn btn-outline-primary w-100 mt-2" onClick={extractCv}
              disabled={!cv.file || cv.state === 'reading'}>
              Fill profile from CV
            </button>
          </div>
        </section>
      </div>

      <div className="col-12 col-lg-8 order-lg-1">
        <form className="card shadow-sm" onSubmit={handleSubmit} noValidate aria-labelledby="profile-form-heading">
          <div className="card-body p-4">
            <h2 id="profile-form-heading" className="h5 mb-3">Academic details</h2>
            {saveState.state === 'invalid' && <FormAlert type="danger">{saveState.message}</FormAlert>}
            {saveState.state === 'error' && <FormAlert type="danger">Your profile was not saved. {saveState.message}</FormAlert>}
            {saveState.state === 'saved' && (
              <FormAlert type="success">
                Profile saved. <Link to="/matches" className="alert-link">See your updated matches →</Link>
              </FormAlert>
            )}

            <div className="row">
              <SelectField className="col-12 col-md-6" id="major" label="Major / field of study" required options={FIELDS}
                placeholder="Choose your major…" value={values.major} onChange={handleChange} onBlur={handleBlur} error={err('major')} />
              <TextField className="col-12 col-md-6" id="gpa" label="GPA (4.0 scale)" type="number" step="0.01" min="0" max="4" required
                inputMode="decimal" value={values.gpa} onChange={handleChange} onBlur={handleBlur} error={err('gpa')} />
              <TextField className="col-6" id="ielts" label="IELTS overall" type="number" step="0.5" min="0" max="9"
                help="Optional. Leave empty if not taken." value={values.ielts} onChange={handleChange} onBlur={handleBlur} error={err('ielts')} />
              <TextField className="col-6" id="toefl" label="TOEFL iBT" type="number" step="1" min="0" max="120"
                help="Optional." value={values.toefl} onChange={handleChange} onBlur={handleBlur} error={err('toefl')} />
            </div>

            <CheckboxGroup id="interests" legend="Interests (choose at least one) *" options={INTERESTS}
              value={values.interests} onChange={(v) => { setTouched((t) => ({ ...t, interests: true })); set('interests', v); }}
              error={err('interests')} />

            <CheckboxGroup id="countries" legend="Preferred countries" options={COUNTRIES}
              value={values.preferredCountries} onChange={(v) => set('preferredCountries', v)}
              help="Leave empty if you are open to any country." />

            <TextField id="budget" label="Maximum tuition per year (USD)" type="number" min="0" step="500"
              help="Optional. Used to flag programs above your budget." value={values.budget} onChange={handleChange} onBlur={handleBlur} error={err('budget')} />

            <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
              <button type="submit" className="btn btn-primary" disabled={saveState.state === 'saving'}>
                {saveState.state === 'saving' ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving…</>) : isNew ? 'Save profile' : 'Save changes'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => { setValues(initial); setErrors({}); setTouched({}); setSaveState({ state: 'idle', message: '' }); }}>
                Undo changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
