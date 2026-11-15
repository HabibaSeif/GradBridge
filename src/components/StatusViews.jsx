import { Link } from 'react-router-dom';

/** Spinner with screen-reader text. Used while mock requests load. */
export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-secondary" role="status" aria-live="polite">
      <div className="spinner-border text-primary mb-3" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** Shown when a list has no items. */
export function EmptyState({ icon = '📭', title, message, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state text-center py-5 px-3 border rounded-3 bg-body-tertiary">
      <div className="fs-1 mb-2" aria-hidden="true">{icon}</div>
      <h2 className="h5">{title}</h2>
      {message && <p className="text-secondary mb-3">{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="btn btn-outline-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}

/** Error banner with an optional retry button. */
export function ErrorState({ error, onRetry }) {
  return (
    <div className="alert alert-danger d-flex flex-column flex-sm-row align-items-sm-center gap-2" role="alert">
      <div className="flex-grow-1">
        <strong>Something went wrong.</strong> {error?.message || String(error)}
      </div>
      {onRetry && (
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

/** Dismissible success / error message after a form action. */
export function FormAlert({ type = 'success', children, onClose }) {
  if (!children) return null;
  return (
    <div className={`alert alert-${type} alert-dismissible`} role={type === 'danger' ? 'alert' : 'status'} aria-live="polite">
      {children}
      {onClose && <button type="button" className="btn-close" aria-label="Dismiss message" onClick={onClose} />}
    </div>
  );
}
