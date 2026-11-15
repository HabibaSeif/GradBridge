import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STUDENT_LINKS = [
  { to: '/programs', label: 'Programs' },
  { to: '/matches', label: 'My matches' },
  { to: '/what-if', label: 'What-if' },
  { to: '/saved', label: 'Saved' },
  { to: '/inquiries', label: 'Inquiries' },
];
const SCHOOL_LINKS = [
  { to: '/school', label: 'Dashboard', end: true },
  { to: '/school/programs/new', label: 'Add program' },
  { to: '/programs', label: 'Browse programs' },
];
const GUEST_LINKS = [{ to: '/programs', label: 'Programs' }];

/** Responsive top navigation. Collapses into a menu button below 992px. */
export default function NavBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const close = () => setOpen(false);

  const links = user?.role === 'student' ? STUDENT_LINKS : user?.role === 'school' ? SCHOOL_LINKS : GUEST_LINKS;

  const handleLogout = () => {
    close();
    logout();
    navigate('/', { state: { message: 'You have been logged out.' } });
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top" aria-label="Main navigation">
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" onClick={close}>
            <span className="brand-mark" aria-hidden="true">GB</span>
            GradBridge
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="main-nav"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="main-nav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {links.map((l) => (
                <li className="nav-item" key={l.to}>
                  <NavLink className="nav-link" to={l.to} end={l.end} onClick={close}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center pb-2 pb-lg-0">
              {user ? (
                <>
                  {user.role === 'student' && (
                    <NavLink to="/profile" className="nav-link" onClick={close}>
                      <span aria-hidden="true">👤 </span>
                      {user.name}
                    </NavLink>
                  )}
                  {user.role === 'school' && <span className="navbar-text small">{user.schoolName || user.name}</span>}
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline-primary btn-sm" onClick={close}>Log in</Link>
                  <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Sign up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
