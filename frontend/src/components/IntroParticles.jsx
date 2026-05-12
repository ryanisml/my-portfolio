import { memo } from 'react'

function IntroParticles({ theme }) {
  const lines = Array.from({ length: 20 }, (_, index) => {
    const left = 4 + index * 4.8
    const delay = (index % 6) * 0.45
    const duration = 4.8 + (index % 5) * 0.7
    const height = 18 + (index % 4) * 7

    return {
      id: `line-${index}`,
      left,
      delay,
      duration,
      height,
    }
  })

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={`absolute inset-0 ${theme === 'light' ? 'bg-gradient-to-t from-amber-100/35 via-transparent to-transparent' : 'bg-gradient-to-t from-black/35 via-transparent to-transparent'}`}
      />
      {lines.map((line) => (
        <span
          key={line.id}
          className={`rising-line ${theme === 'light' ? 'rising-line-light' : 'rising-line-dark'}`}
          style={{
            left: `${line.left}%`,
            animationDelay: `${line.delay}s`,
            animationDuration: `${line.duration}s`,
            height: `${line.height}vh`,
          }}
        />
      ))}
    </div>
  )
}

export default memo(IntroParticles)
