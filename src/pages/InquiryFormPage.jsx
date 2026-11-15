import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SelectField, TextArea, TextField } from '../components/FormFields';
import { ErrorState, FormAlert, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { maxLength, minLength, required, validate } from '../utils/validation';
import { useAsync } from '../utils/useAsync';

const TOPICS = ['Admission requirements', 'Scholarships and funding', 'Application deadline', 'Course content', 'Other'];
const MAX_MSG = 1000;

const RULES = {
  topic: [required('Topic')],
  subject: [required('Subject'), minLength(5, 'Subject'), maxLength(120, 'Subject')],
  message: [required('Message'), minLength(30, 'Message'), maxLength(MAX_MSG, 'Message')],
};

export default function InquiryFormPage() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { data: program, loading, error, reload } = useAsync(() => api.getProgram(id), [id]);
  const [values, setValues] = useState({ topic: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (e) => {
    const next = { ...values, [e.target.name]: e.target.value };
    setValues(next);
    if (touched[e.target.name]) setErrors(validate(next, RULES));
  };
  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(values, RULES));
  };

  const insertProfile = () => {
    if (!profile) return;
    const intro = `Hello, I am a ${profile.major} student with a GPA of ${profile.gpa}. I am interested in ${program.title} and would like to ask about `;
    const next = { ...values, message: intro + values.message };
    setValues(next);
    if (touched.message) setErrors(validate(next, RULES));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(values, RULES);
    setErrors(errs);
    setTouched({ topic: true, subject: true, message: true });
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    setStatus({ state: 'sending', message: '' });
    try {
      await api.sendInquiry({ ...values, programId: program.id, studentId: user.id, studentName: user.name });
      setStatus({ state: 'sent', message: '' });
    } catch (err) {
      setStatus({ state: 'error', message: err.message });
    }
  };

  if (loading) return <div className="container"><LoadingState label="Loading program…" /></div>;
  if (error) return <div className="container py-5"><ErrorState error={error} onRetry={reload} /></div>;

  if (status.state === 'sent') {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 text-center">
            <div className="display-4 mb-2" aria-hidden="true">✅</div>
            <h1 className="h3" tabIndex={-1} ref={(el) => el?.focus()}>Inquiry sent</h1>
            <p className="text-secondary">
              {program.school?.name} will reply to your inquiry about <strong>{program.title}</strong>. You can follow it on your inquiries page.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <Link to="/inquiries" className="btn btn-primary">View my inquiries</Link>
              <Link to="/programs" className="btn btn-outline-secondary">Back to programs</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sending = status.state === 'sending';

  return (
    <div className="container py-4">
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/programs">Programs</Link></li>
          <li className="breadcrumb-item"><Link to={`/programs/${program.id}`}>{program.title}</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Contact</li>
        </ol>
      </nav>
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3">Contact {program.school?.name}</h1>
              <p className="text-secondary">About: {program.title}</p>
              <FormAlert type="danger" onClose={() => setStatus({ state: 'idle', message: '' })}>
                {status.state === 'error' && <>Your inquiry was not sent. {status.message}</>}
              </FormAlert>

              <form onSubmit={handleSubmit} noValidate>
                <div className="row">
                  <SelectField className="col-12 col-md-5" id="topic" label="Topic" required options={TOPICS} placeholder="Choose a topic…"
                    value={values.topic} onChange={handleChange} onBlur={handleBlur} error={touched.topic && errors.topic} />
                  <TextField className="col-12 col-md-7" id="subject" label="Subject" required maxLength={120}
                    value={values.subject} onChange={handleChange} onBlur={handleBlur} error={touched.subject && errors.subject} />
                </div>
                <TextArea id="message" label="Message" required rows={7}
                  help={`${values.message.length}/${MAX_MSG} characters · at least 30`}
                  value={values.message} onChange={handleChange} onBlur={handleBlur} error={touched.message && errors.message} />
                {profile && (
                  <button type="button" className="btn btn-link btn-sm px-0 mb-3" onClick={insertProfile}>
                    + Insert a short intro from my profile
                  </button>
                )}
                <div className="d-flex flex-column flex-sm-row gap-2">
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? (<><span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />Sending…</>) : 'Send inquiry'}
                  </button>
                  <Link to={`/programs/${program.id}`} className="btn btn-outline-secondary">Cancel</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
