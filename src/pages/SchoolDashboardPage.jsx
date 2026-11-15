import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DeadlineText from '../components/DeadlineText';
import InquiryItem from '../components/InquiryItem';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorState, FormAlert, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { formatMoney } from '../utils/format';
import { useAsync } from '../utils/useAsync';

/** School home: stats, program listings (edit / delete) and incoming inquiries. */
export default function SchoolDashboardPage() {
  const { user } = useAuth();
  const { state } = useLocation();
  const [flash, setFlash] = useState(state?.message || '');
  const [tab, setTab] = useState('programs');

  const programsReq = useAsync(
    () => api.listPrograms().then((all) => all.filter((p) => p.schoolId === user.schoolId)),
    [user.schoolId],
  );
  const inquiriesReq = useAsync(() => api.listInquiries({ schoolId: user.schoolId }), [user.schoolId]);

  const handleDelete = async (program) => {
    if (!window.confirm(`Delete “${program.title}”? Students will no longer see it.`)) return;
    try {
      await api.deleteProgram(program.id);
      programsReq.setData((list) => list.filter((p) => p.id !== program.id));
      setFlash(`“${program.title}” was deleted.`);
    } catch (e) {
      setFlash('');
      alert(`Could not delete: ${e.message}`);
    }
  };

  const handleReply = async (id, reply) => {
    await api.answerInquiry(id, reply);
    inquiriesReq.setData((list) => list.map((q) => (q.id === id ? { ...q, reply, status: 'Answered' } : q)));
  };

  const programs = programsReq.data || [];
  const inquiries = inquiriesReq.data || [];
  const open = inquiries.filter((q) => q.status !== 'Answered').length;

  return (
    <>
      <PageHeader title="School dashboard" subtitle={user.schoolName || user.name}>
        <Link to="/school/programs/new" className="btn btn-primary">+ Add program</Link>
      </PageHeader>
      <div className="container">
        <FormAlert type="success" onClose={() => setFlash('')}>{flash}</FormAlert>

        <div className="row g-3 mb-4" aria-label="Summary">
          {[
            { label: 'Active listings', value: programsReq.loading ? '…' : programs.length },
            { label: 'Inquiries', value: inquiriesReq.loading ? '…' : inquiries.length },
            { label: 'Awaiting reply', value: inquiriesReq.loading ? '…' : open },
          ].map((s) => (
            <div className="col-4" key={s.label}>
              <div className="card text-center h-100">
                <div className="card-body py-3">
                  <div className="fs-3 fw-bold">{s.value}</div>
                  <div className="small text-secondary">{s.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <ul className="nav nav-tabs mb-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button type="button" role="tab" id="tab-programs" aria-controls="panel-programs" aria-selected={tab === 'programs'}
              className={`nav-link ${tab === 'programs' ? 'active' : ''}`} onClick={() => setTab('programs')}>Programs</button>
          </li>
          <li className="nav-item" role="presentation">
            <button type="button" role="tab" id="tab-inquiries" aria-controls="panel-inquiries" aria-selected={tab === 'inquiries'}
              className={`nav-link ${tab === 'inquiries' ? 'active' : ''}`} onClick={() => setTab('inquiries')}>
              Inquiries {open > 0 && <span className="badge text-bg-danger ms-1">{open}<span className="visually-hidden"> unanswered</span></span>}
            </button>
          </li>
        </ul>

        {tab === 'programs' && (
          <section id="panel-programs" role="tabpanel" aria-labelledby="tab-programs">
            {programsReq.loading && <LoadingState label="Loading your programs…" />}
            {programsReq.error && <ErrorState error={programsReq.error} onRetry={programsReq.reload} />}
            {!programsReq.loading && !programsReq.error && programs.length === 0 && (
              <EmptyState icon="🏛️" title="No programs listed yet" message="Add your first program so students can find it."
                actionLabel="Add a program" actionTo="/school/programs/new" />
            )}
            {!programsReq.loading && !programsReq.error && programs.length > 0 && (
              <div className="table-responsive">
                <table className="table align-middle">
                  <caption className="visually-hidden">Your program listings</caption>
                  <thead>
                    <tr>
                      <th scope="col">Program</th>
                      <th scope="col" className="d-none d-md-table-cell">Tuition</th>
                      <th scope="col" className="d-none d-md-table-cell">Deadline</th>
                      <th scope="col" className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/programs/${p.id}`} className="fw-semibold">{p.title}</Link>
                          <div className="small text-secondary">{p.field} · {p.city}</div>
                          <div className="small d-md-none"><DeadlineText deadline={p.deadline} /></div>
                        </td>
                        <td className="d-none d-md-table-cell">{formatMoney(p.tuition)}</td>
                        <td className="d-none d-md-table-cell"><DeadlineText deadline={p.deadline} /></td>
                        <td className="text-end">
                          <div className="d-inline-flex flex-wrap gap-1 justify-content-end">
                            <Link to={`/school/programs/${p.id}/edit`} className="btn btn-sm btn-outline-primary">
                              Edit<span className="visually-hidden"> {p.title}</span>
                            </Link>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}>
                              Delete<span className="visually-hidden"> {p.title}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {tab === 'inquiries' && (
          <section id="panel-inquiries" role="tabpanel" aria-labelledby="tab-inquiries">
            {inquiriesReq.loading && <LoadingState label="Loading inquiries…" />}
            {inquiriesReq.error && <ErrorState error={inquiriesReq.error} onRetry={inquiriesReq.reload} />}
            {!inquiriesReq.loading && !inquiriesReq.error && inquiries.length === 0 && (
              <EmptyState icon="✉️" title="No inquiries yet" message="When students contact you about a program, their messages appear here." />
            )}
            {!inquiriesReq.loading && !inquiriesReq.error && inquiries.length > 0 && (
              <ul className="list-unstyled d-grid gap-3">
                {inquiries.map((q) => <li key={q.id}><InquiryItem inquiry={q} onReply={handleReply} /></li>)}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
