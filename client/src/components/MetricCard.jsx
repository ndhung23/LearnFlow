function MetricCard({ eyebrow, title, value, subtitle, accent = "var(--lf-accent)" }) {
  return (
    <div className="surface-card metric-card h-100">
      <div className="metric-kicker" style={{ color: accent }}>
        {eyebrow}
      </div>
      <div className="metric-value">{value}</div>
      <div className="fw-semibold mb-1">{title}</div>
      <div className="text-muted small">{subtitle}</div>
    </div>
  );
}

export default MetricCard;
