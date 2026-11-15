/** Lists what fits (reasons) and what is missing (gaps) for one program. */
export default function FitDetails({ reasons, gaps, compact = false }) {
  const shownReasons = compact ? reasons.slice(0, 2) : reasons;
  const shownGaps = compact ? gaps.slice(0, 2) : gaps;
  return (
    <div className="row g-3 small">
      <div className="col-12 col-md-6">
        <h3 className="h6 text-success-emphasis">✓ Why it fits</h3>
        {shownReasons.length ? (
          <ul className="list-unstyled mb-0 fit-list">
            {shownReasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        ) : (
          <p className="text-secondary mb-0">No strong matches yet. Complete your profile to improve results.</p>
        )}
      </div>
      <div className="col-12 col-md-6">
        <h3 className="h6 text-danger-emphasis">! Gaps to close</h3>
        {shownGaps.length ? (
          <ul className="list-unstyled mb-0 gap-list">
            {shownGaps.map((g) => <li key={g}>{g}</li>)}
          </ul>
        ) : (
          <p className="text-secondary mb-0">None. You meet every listed requirement.</p>
        )}
      </div>
    </div>
  );
}
