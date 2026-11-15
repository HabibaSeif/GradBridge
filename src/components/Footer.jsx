import { useState } from 'react';
import { failMode, resetMockData } from '../services/mockApi';

/**
 * Footer with the mock-data notice required for Milestone 1 and two
 * demo controls: simulate a server error, and reset the mock data.
 */
export default function Footer() {
  const [fail, setFail] = useState(failMode.get());

  const toggleFail = (e) => {
    failMode.set(e.target.checked);
    setFail(e.target.checked);
  };

  const reset = () => {
    resetMockData();
    sessionStorage.clear();
    window.location.assign(import.meta.env.BASE_URL);
  };

  return (
    <footer className="border-top bg-body-tertiary mt-5 py-4">
      <div className="container small d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
        <div>
          <strong>GradBridge</strong> · CSCE 4502 Milestone 1 prototype.
          <br />
          <span className="badge text-bg-warning me-1">Mock data</span>
          Programs, accounts and inquiries are sample data stored in your browser. Match scores are guidance, not
          predictions of admission.
        </div>
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="form-check form-switch m-0">
            <input className="form-check-input" type="checkbox" role="switch" id="fail-toggle" checked={fail} onChange={toggleFail} />
            <label className="form-check-label" htmlFor="fail-toggle">Simulate server error</label>
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={reset}>
            Reset demo data
          </button>
        </div>
      </div>
    </footer>
  );
}
