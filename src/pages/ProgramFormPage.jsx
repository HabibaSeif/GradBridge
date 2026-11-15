import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { CheckboxGroup, SelectField, TextArea, TextField } from '../components/FormFields';
import { EmptyState, ErrorState, FormAlert, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, FIELDS, INTERESTS } from '../data/mockPrograms';
import { api } from '../services/mockApi';
import { futureDate, maxLength, minLength, numberRange, required, validate } from '../utils/validation';
import { useAsync } from '../utils/useAsync';

const DEGREES = ['MSc', 'MA', 'MEng', 'MBA', 'MPH', 'MRes'];

const EMPTY = {
  title: '', field: '', degreeType: 'MSc', country: '', city: '', tuition: '', minGpa: '',
  needsEnglish: true, ielts: '6.5', toefl: '90', deadline: '', durationMonths: '12', tags: [], description: '',
};

const RULES = {
  title: [required('Program title'), minLength(5, 'Program title'), maxLength(100, 'Program title')],
  field: [required('Field')],
  degreeType: [required('Degree type')],
  country: [required('Country')],
  city: [required('City')],
  tuition: [required('Tuition'), numberRange(0, 100000, 'Tuition')],
  minGpa: [required('Minimum GPA'), numberRange(0, 4, 'Minimum GPA')],
  ielts: [(v, all) => (all.needsEnglish ? required('IELTS minimum')(v) || numberRange(4, 9, 'IELTS minimum')(v) : '')],
  toefl: [(v, all) => (all.needsEnglish ? required('TOEFL minimum')(v) || numberRange(0, 120, 'TOEFL minimum')(v) : '')],
  deadline: [required('Deadline'), futureDate],
  durationMonths: [required('Duration'), numberRange(6, 48, 'Duration')],
  description: [required('Description'), minLength(40, 'Description'), maxLength(800, 'Description')],
};

function toForm(p) {
  return {
    ...EMPTY,
    ...p,
    tuition: String(p.tuition),
    minGpa: String(p.minGpa),
    durationMonths: String(p.durationMonths),
    needsEnglish: !!p.languageReq,
    ielts: p.languageReq ? String(p.languageReq.ielts) : EMPTY.ielts,
    toefl: p.languageReq ? String(p.languageReq.toefl) : EMPTY.toefl,
  };
}

/** Add (/school/programs/new) or edit (/school/programs/:id/edit) a listing. */
export default function ProgramFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isEdit = !!id;
  const { data, loading, error, reload } = useAsync(() => (isEdit ? api.getProgram(id) : Promise.resolve(null)), [id]);

  const title = isEdit ? 'Edit program' : 'Add a program';
  let body;
  if (loading) body = <LoadingState label="Loading program…" />;
  else if (error?.message === 'NOT_FOUND') body = <EmptyState icon="🗂️" title="Program not found" actionLabel="Back to dashboard" actionTo="/school" />;
  else if (error) body = <ErrorState error={error} onRetry={reload} />;
  else if (isEdit && data.schoolId !== user.schoolId) body = <EmptyState icon="🔒" title="You can only edit your own school’s programs" actionLabel="Back to dashboard" actionTo="/school" />;
  else body = <ProgramForm key={id || 'new'} initial={data ? toForm(data) : EMPTY} existing={data} />;

  return (
    <>
      <PageHeader title={title} subtitle="Fields marked * are required. Students see this information on the program page." />
      <div className="container">{body}</div>
    </>
  );
}

function ProgramForm({ initial, existing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const set = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name] || status.state === 'invalid') setErrors(validate(next, RULES));
  };
  const handleChange = (e) => set(e.target.name, e.target.type === 'checkbox' ? e.target.checked : e.target.value);
  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(values, RULES));
  };
  const err = (k) => touched[k] && errors[k];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values, RULES);
    setErrors(errs);
    setTouched(Object.fromEntries(Object.keys(RULES).map((k) => [k, true])));
    if (Object.keys(errs).length) {
      setStatus({ state: 'invalid', message: `Please fix ${Object.keys(errs).length} field(s) highlighted below.` });
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setStatus({ state: 'saving', message: '' });
    const program = {
      ...(existing ? { id: existing.id } : {}),
      schoolId: user.schoolId,
      title: values.title.trim(),
      field: values.field,
      degreeType: values.degreeType,
      country: values.country,
      city: values.city.trim(),
      tuition: Number(values.tuition),
      minGpa: Number(values.minGpa),
      languageReq: values.needsEnglish ? { ielts: Number(values.ielts), toefl: Number(values.toefl) } : null,
      deadline: values.deadline,
      durationMonths: Number(values.durationMonths),
      tags: values.tags,
      description: values.description.trim(),
    };
    try {
      await api.saveProgram(program);
      navigate('/school', { state: { message: existing ? `“${program.title}” was updated.` : `“${program.title}” is now listed.` } });
    } catch (e2) {
      setStatus({ state: 'error', message: e2.message });
    }
  };

  return (
    <form className="card shadow-sm" onSubmit={handleSubmit} noValidate>
      <div className="card-body p-4">
        {status.state === 'invalid' && <FormAlert type="danger">{status.message}</FormAlert>}
        {status.state === 'error' && <FormAlert type="danger">The program was not saved. {status.message}</FormAlert>}

        <h2 className="h5">Basics</h2>
        <div className="row">
          <TextField className="col-12 col-md-8" id="title" label="Program title" required placeholder="e.g. MSc Data Science"
            value={values.title} onChange={handleChange} onBlur={handleBlur} error={err('title')} />
          <SelectField className="col-12 col-md-4" id="degreeType" label="Degree type" required options={DEGREES}
            value={values.degreeType} onChange={handleChange} onBlur={handleBlur} error={err('degreeType')} />
          <SelectField className="col-12 col-md-4" id="field" label="Field" required options={FIELDS} placeholder="Choose…"
            value={values.field} onChange={handleChange} onBlur={handleBlur} error={err('field')} />
          <SelectField className="col-6 col-md-4" id="country" label="Country" required options={COUNTRIES} placeholder="Choose…"
            value={values.country} onChange={handleChange} onBlur={handleBlur} error={err('country')} />
          <TextField className="col-6 col-md-4" id="city" label="City" required
            value={values.city} onChange={handleChange} onBlur={handleBlur} error={err('city')} />
        </div>

        <h2 className="h5 mt-2">Requirements and costs</h2>
        <div className="row">
          <TextField className="col-6 col-md-3" id="minGpa" label="Minimum GPA" type="number" step="0.1" min="0" max="4" required
            value={values.minGpa} onChange={handleChange} onBlur={handleBlur} error={err('minGpa')} />
          <TextField className="col-6 col-md-3" id="tuition" label="Tuition / year (USD)" type="number" min="0" step="100" required
            value={values.tuition} onChange={handleChange} onBlur={handleBlur} error={err('tuition')} />
          <TextField className="col-6 col-md-3" id="deadline" label="Application deadline" type="date" required
            value={values.deadline} onChange={handleChange} onBlur={handleBlur} error={err('deadline')} />
          <TextField className="col-6 col-md-3" id="durationMonths" label="Duration (months)" type="number" min="6" max="48" required
            value={values.durationMonths} onChange={handleChange} onBlur={handleBlur} error={err('durationMonths')} />
        </div>
        <div className="form-check form-switch mb-2">
          <input className="form-check-input" type="checkbox" role="switch" id="needsEnglish" name="needsEnglish"
            checked={values.needsEnglish} onChange={handleChange} />
          <label className="form-check-label" htmlFor="needsEnglish">An English test is required</label>
        </div>
        {values.needsEnglish && (
          <div className="row">
            <TextField className="col-6 col-md-3" id="ielts" label="IELTS minimum" type="number" step="0.5" min="4" max="9" required
              value={values.ielts} onChange={handleChange} onBlur={handleBlur} error={err('ielts')} />
            <TextField className="col-6 col-md-3" id="toefl" label="TOEFL iBT minimum" type="number" min="0" max="120" required
              value={values.toefl} onChange={handleChange} onBlur={handleBlur} error={err('toefl')} />
          </div>
        )}

        <h2 className="h5 mt-2">Description</h2>
        <CheckboxGroup id="tags" legend="Topics (helps match students’ interests)" options={INTERESTS}
          value={values.tags} onChange={(v) => set('tags', v)} />
        <TextArea id="description" label="Program description" required rows={5}
          help={`${values.description.length}/800 characters · at least 40`}
          value={values.description} onChange={handleChange} onBlur={handleBlur} error={err('description')} />

        <div className="d-flex flex-column flex-sm-row gap-2">
          <button type="submit" className="btn btn-primary" disabled={status.state === 'saving'}>
            {status.state === 'saving' ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Saving…</>) : existing ? 'Save changes' : 'Publish program'}
          </button>
          <Link to="/school" className="btn btn-outline-secondary">Cancel</Link>
        </div>
      </div>
    </form>
  );
}
