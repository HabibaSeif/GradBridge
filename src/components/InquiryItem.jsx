import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/format';

/**
 * One inquiry. Students see their message and the reply; schools
 * (pass onReply) also get a validated reply form.
 */
export default function InquiryItem({ inquiry, onReply }) {
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const answered = inquiry.status === 'Answered';
  const replyId = `reply-${inquiry.id}`;

  const submit = async (e) => {
    e.preventDefault();
    if (reply.trim().length < 10) {
      setError('Reply must be at least 10 characters.');
      document.getElementById(replyId)?.focus();
      return;
    }
    setSending(true);
    setError('');
    try {
      await onReply(inquiry.id, reply.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="card shadow-sm">
      <div className="card-body">
        <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
          <div>
            <h2 className="h6 mb-0">{inquiry.subject}</h2>
            <p className="small text-secondary mb-0">
              {onReply ? `From ${inquiry.studentName}` : 'To'} · {' '}
              {inquiry.program ? <Link to={`/programs/${inquiry.program.id}`}>{inquiry.program.title}</Link> : 'Removed program'}
              {' '}· {inquiry.topic} · {formatDate(inquiry.date)}
            </p>
          </div>
          <span className={`badge align-self-start ${answered ? 'text-bg-success' : 'text-bg-secondary'}`}>{inquiry.status}</span>
        </div>
        <p className="mb-2 text-break">{inquiry.message}</p>
        {answered && (
          <div className="border-start border-3 border-success ps-3 small">
            <strong>Reply from the school:</strong> {inquiry.reply}
          </div>
        )}
        {onReply && !answered && (
          <form onSubmit={submit} noValidate className="mt-3">
            <label htmlFor={replyId} className="form-label small fw-semibold">Your reply</label>
            <textarea id={replyId} rows={3} className={`form-control ${error ? 'is-invalid' : ''}`} value={reply}
              onChange={(e) => setReply(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${replyId}-err` : undefined} />
            {error && <div id={`${replyId}-err`} className="invalid-feedback d-block">{error}</div>}
            <button type="submit" className="btn btn-sm btn-primary mt-2" disabled={sending}>
              {sending ? 'Sending…' : 'Send reply'}
            </button>
          </form>
        )}
      </div>
    </article>
  );
}
