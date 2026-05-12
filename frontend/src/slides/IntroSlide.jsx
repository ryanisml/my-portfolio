import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import IntroParticles from '../components/IntroParticles'
import useGsapReveal from '../hooks/useGsapReveal'
import { ConnectionLostCard, ShimmerLine } from '../components/ContentStates'

const introTypewriterLines = [
  "Hi, I'm Ryan Ismail.",
  'FullStack Developer.',
  'System Analyst.',
  'I build innovative solutions.',
]

function IntroSlide({
  slide,
  setRef,
  nextArrow,
  imageSrc,
  theme,
  socialLinks = [],
  isSocialLoading = false,
  hasSocialError = false,
}) {
  const animationRef = useGsapReveal({ start: 'top 82%' })
  const [typedText, setTypedText] = useState('')
  const [lineIndex, setLineIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentLine = introTypewriterLines[lineIndex]

    if (!isDeleting && typedText === currentLine) {
      const pauseTimer = setTimeout(() => setIsDeleting(true), 1100)
      return () => clearTimeout(pauseTimer)
    }

    if (isDeleting && typedText === '') {
      setIsDeleting(false)
      setLineIndex((prevIndex) => (prevIndex + 1) % introTypewriterLines.length)
      return undefined
    }

    const typingTimer = setTimeout(
      () => {
        setTypedText((prevText) =>
          isDeleting
            ? currentLine.slice(0, prevText.length - 1)
            : currentLine.slice(0, prevText.length + 1),
        )
      },
      isDeleting ? 45 : 90,
    )

    return () => clearTimeout(typingTimer)
  }, [typedText, lineIndex, isDeleting])

  return (
    <section
      id={slide.id}
      ref={(node) => {
        animationRef.current = node
        setRef(node)
      }}
      className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center overflow-hidden px-6 py-12 md:px-12 lg:px-20`}
    >
      <IntroParticles theme={theme} />

      <div data-gsap-reveal className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div data-gsap-reveal data-gsap-delay="0.08" className="min-h-[220px] md:min-h-[280px]">
          <p className="mb-6 text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
          <h1 className="max-w-4xl font-serif text-3xl leading-tight text-stone-50 md:text-5xl lg:text-6xl">
            {typedText}
            <span className="type-cursor" aria-hidden="true">|</span>
          </h1>
        </div>

        <div
          data-gsap-reveal
          data-gsap-delay="0.16"
          data-gsap-y="36"
          className="layout-frame mx-auto w-full max-w-sm rounded-[2rem] bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-1"
        >
          <img
            src={imageSrc}
            alt="Profile"
            className="h-[360px] w-full rounded-[1.5rem] object-cover md:h-[440px]"
          />

          {/* Social Links */}
          <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-4">
            {isSocialLoading && (
              <div className="space-y-3">
                <ShimmerLine className="h-3 w-20" />
                <ShimmerLine className="h-8 w-full" />
                <ShimmerLine className="h-8 w-full" />
              </div>
            )}

            {hasSocialError && <ConnectionLostCard className="rounded-xl p-4" />}

            {!isSocialLoading && !hasSocialError && (
              <div className="grid gap-4">
                {socialLinks
                  .filter((link) => link.label === 'GitHub' || link.label === 'LinkedIn')
                  .sort((a, b) => {
                    const order = { LinkedIn: 0, GitHub: 1 }
                    return order[a.label] - order[b.label]
                  })
                  .map((link) => (
                    <p key={link.label} className="text-xs leading-relaxed text-stone-200 md:text-sm">
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.label}
                        className="flex items-start gap-2 break-all transition-colors hover:text-amber-300"
                      >
                        <FontAwesomeIcon icon={link.icon} className="mt-0.5 shrink-0 text-sm text-amber-300" />
                        <span>{link.href}</span>
                      </a>
                    </p>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {nextArrow}
    </section>
  )
}

export default IntroSlide