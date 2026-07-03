interface MetricTileProps {
  label: string;
  value: string;
  variant?: 'teal' | 'orange';
  size?: 'lg' | 'md';
}

export function MetricTile({
  label,
  value,
  variant = 'teal',
  size = 'md',
}: MetricTileProps) {
  return (
    <div className={`tile tile--${variant} tile--${size}`}>
      <span className="tile__label">{label}</span>
      <span className="tile__value">{value}</span>
    </div>
  );
}
