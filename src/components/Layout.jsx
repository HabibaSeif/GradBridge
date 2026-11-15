import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';

/**
 * Shared page shell: skip link, navigation, main region and footer.
 * On every route change focus moves to <main> so keyboard and
 * screen-reader users start at the new page content.
 */
export default function Layout() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      <a href="#main" className="visually-hidden-focusable skip-link">Skip to main content</a>
      <NavBar />
      <main id="main" ref={mainRef} tabIndex={-1} className="flex-grow-1 outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
