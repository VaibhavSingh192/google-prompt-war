export function SkeletonCard() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading analysis">
      {[66, 100, 80, 55].map((w, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height: i === 1 ? "60px" : "12px",
            width: `${w}%`,
            borderRadius: i === 1 ? "12px" : "999px",
          }}
        />
      ))}
    </div>
  );
}
