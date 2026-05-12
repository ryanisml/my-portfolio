import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { useNavigate } from 'react-router-dom'
import useGsapReveal from '../hooks/useGsapReveal'

function NotFoundPage() {
  const pageRef = useRef(null)
  const animationRef = useGsapReveal()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '404 - Page Not Found'
  }, [])

  useLayoutEffect(() => {
    if (!pageRef.current) return undefined

    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-404-orb]',
        { autoAlpha: 0.2, scale: 0.92 },
        {
          autoAlpha: 0.45,
          scale: 1,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          stagger: 0.2,
        },
      )
    }, pageRef)

    return () => context.revert()
  }, [])

  return (
    <main
      ref={(node) => {
        pageRef.current = node
        animationRef.current = node
      }}
      data-scroll-container
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-950 px-6 py-16 text-stone-100"
    >
      <div
        data-404-orb
        className="pointer-events-none absolute -left-20 top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl"
      />
      <div
        data-404-orb
        className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl"
      />

      <section data-gsap-reveal className="layout-frame relative z-10 w-full max-w-2xl rounded-[2rem] bg-white/[0.04] p-8 text-center md:p-12">
        <div data-gsap-reveal data-gsap-delay="0.08">
          <p className="text-sm uppercase tracking-[0.45em] text-amber-300">404 Error</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">Page Not Found</h1>
          <p className="mt-5 text-base leading-8 text-stone-300 md:text-lg">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div data-gsap-stagger className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            data-gsap-stagger-item
            onClick={() => navigate('/')}
            className="cursor-pointer rounded-xl border border-amber-200/60 bg-amber-300/20 px-5 py-3 text-sm uppercase tracking-[0.2em] text-amber-100 transition hover:bg-amber-300/30"
          >
            Back to Home
          </button>
          <button
            type="button"
            data-gsap-stagger-item
            onClick={() => navigate(-1)}
            className="cursor-pointer rounded-xl border border-stone-200/30 bg-white/5 px-5 py-3 text-sm uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
          >
            Go Back
          </button>
        </div>
      </section>
    </main>
  )
}

export default NotFoundPage
