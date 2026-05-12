function ShimmerLine({ className = '' }) {
  return <div className={`loading-shimmer rounded-xl ${className}`} aria-hidden="true" />
}

function ConnectionLostCard({ className = '' }) {
  return (
    <div
      className={`layout-card rounded-[1.75rem] border border-red-400/40 bg-red-500/10 p-6 text-red-200 ${className}`}
      role="status"
      aria-live="polite"
    >
      <p className="text-xs uppercase tracking-[0.28em] text-red-300/90">Data Status</p>
      <p className="mt-3 text-sm leading-7">Connection has been lost.</p>
    </div>
  )
}

function ContentLoadingCard({ className = '' }) {
  return (
    <div className={`layout-card rounded-[1.75rem] bg-white/[0.04] p-6 ${className}`}>
      <ShimmerLine className="h-3 w-24" />
      <ShimmerLine className="mt-4 h-6 w-3/4" />
      <ShimmerLine className="mt-4 h-3 w-full" />
      <ShimmerLine className="mt-3 h-3 w-5/6" />
      <ShimmerLine className="mt-3 h-3 w-2/3" />
    </div>
  )
}

export { ConnectionLostCard, ContentLoadingCard, ShimmerLine }