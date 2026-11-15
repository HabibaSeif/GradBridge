import { EmptyState } from '../components/StatusViews';

export default function NotFoundPage() {
  return (
    <div className="container py-5">
      <EmptyState icon="🧭" title="Page not found" message="The page you are looking for does not exist or has moved."
        actionLabel="Go to the home page" actionTo="/" />
    </div>
  );
}
