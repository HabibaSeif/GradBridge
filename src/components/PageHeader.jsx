/** Consistent page title block with optional subtitle and actions. */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header bg-body-tertiary border-bottom mb-4">
      <div className="container py-4 d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-end">
        <div>
          <h1 className="h2 mb-1">{title}</h1>
          {subtitle && <p className="text-secondary mb-0">{subtitle}</p>}
        </div>
        {children && <div className="d-flex flex-wrap gap-2">{children}</div>}
      </div>
    </div>
  );
}
