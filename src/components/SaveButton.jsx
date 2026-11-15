import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Save / unsave toggle. Guests are sent to log in; schools don't see it. */
export default function SaveButton({ program, size = 'sm' }) {
  const { user, isSaved, toggleSaved } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user?.role === 'school') return null;

  const saved = isSaved(program.id);

  const handleClick = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/programs/${program.id}`, message: 'Log in as a student to save programs.' } });
      return;
    }
    setBusy(true);
    setError('');
    try {
      await toggleSaved(program.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="d-inline-flex flex-column">
      <button
        type="button"
        className={`btn btn-${size} ${saved ? 'btn-success' : 'btn-outline-secondary'}`}
        onClick={handleClick}
        disabled={busy}
        aria-pressed={saved}
      >
        {busy ? (
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
        ) : saved ? (
          '★ Saved'
        ) : (
          '☆ Save'
        )}
        <span className="visually-hidden"> {program.title}</span>
      </button>
      {error && <span className="small text-danger" role="alert">Couldn’t update. Try again.</span>}
    </span>
  );
}
