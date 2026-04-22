function EmptyState({ title, description, action }) {
  return (
    <div className="surface-card text-center py-5">
      <h3 className="h5 mb-2">{title}</h3>
      <p className="text-muted mb-0">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
