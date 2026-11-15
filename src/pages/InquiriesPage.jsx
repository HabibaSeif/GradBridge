import { Link } from 'react-router-dom';
import InquiryItem from '../components/InquiryItem';
import PageHeader from '../components/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/mockApi';
import { useAsync } from '../utils/useAsync';

/** Inquiries the student has sent and any replies from schools. */
export default function InquiriesPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useAsync(() => api.listInquiries({ studentId: user.id }), [user.id]);

  return (
    <>
      <PageHeader title="My inquiries" subtitle="Messages you have sent to schools and their replies.">
        <Link to="/programs" className="btn btn-outline-primary">Contact another school</Link>
      </PageHeader>
      <div className="container">
        {loading && <LoadingState label="Loading inquiries…" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {!loading && !error && data.length === 0 && (
          <EmptyState icon="✉️" title="No inquiries yet"
            message="Open any program and choose “Contact the school” to ask a question."
            actionLabel="Browse programs" actionTo="/programs" />
        )}
        {!loading && !error && data.length > 0 && (
          <ul className="list-unstyled d-grid gap-3">
            {data.map((q) => <li key={q.id}><InquiryItem inquiry={q} /></li>)}
          </ul>
        )}
      </div>
    </>
  );
}
