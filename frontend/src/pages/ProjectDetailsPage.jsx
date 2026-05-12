import { useEffect, useMemo, useRef, useState } from 'react'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate, useParams } from 'react-router-dom'
import useGsapReveal from '../hooks/useGsapReveal'
import { getProjectDetails } from '../lib/api'

function ProjectDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [details, setDetails] = useState(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)
  const animationRef = useGsapReveal({ once: true, start: 'top 95%' })
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [autoplayResetKey, setAutoplayResetKey] = useState(0)
  const [isContentHovered, setIsContentHovered] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const hoverHideTimerRef = useRef(null)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem('portfolio-theme') ?? 'dark'
  })
  const isLight = theme === 'light'

  const images = useMemo(() => {
    if (!details) return []
    if (Array.isArray(details.images) && details.images.length > 0) return details.images
    return details.coverImage ? [details.coverImage] : []
  }, [details])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [slug])

  useEffect(() => {
    const slugLabel = slug
      ? decodeURIComponent(slug)
          .split('-')
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')
      : 'Project Details'

    document.title = details ? `${details.name} - Project Details` : `${slugLabel} - Project Details`
  }, [details, slug])

  useEffect(() => {
    let isMounted = true

    setIsLoadingDetails(true)
    setDetails(null)

    getProjectDetails(slug)
      .then((data) => {
        if (!isMounted) return
        setDetails(data)
      })
      .catch((error) => {
        if (!isMounted) return
        console.warn('Failed to load project details from API.', error)
        setDetails(null)
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoadingDetails(false)
      })

    return () => {
      isMounted = false
    }
  }, [slug])

  useEffect(() => {
    window.localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(
    () => () => {
      if (hoverHideTimerRef.current) {
        window.clearTimeout(hoverHideTimerRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    const updateInputMode = (event) => setIsTouchDevice(event.matches)

    setIsTouchDevice(mediaQuery.matches)
    mediaQuery.addEventListener('change', updateInputMode)

    return () => {
      mediaQuery.removeEventListener('change', updateInputMode)
    }
  }, [])

  useEffect(() => {
    if (!images.length) {
      return undefined
    }

    const autoplayTimer = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length)
    }, 3600)

    return () => window.clearInterval(autoplayTimer)
  }, [images.length, autoplayResetKey])

  const goToPreviousImage = () => {
    if (images.length <= 1) return
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)
    setAutoplayResetKey((prev) => prev + 1)
  }

  const goToNextImage = () => {
    if (images.length <= 1) return
    setActiveImageIndex((prev) => (prev + 1) % images.length)
    setAutoplayResetKey((prev) => prev + 1)
  }

  const handleDismissPage = () => {
    if (typeof window === 'undefined') {
      navigate('/')
      return
    }

    window.close()

    window.setTimeout(() => {
      if (!window.closed) {
        navigate('/')
      }
    }, 120)
  }

  const handleContentEnter = () => {
    if (hoverHideTimerRef.current) {
      window.clearTimeout(hoverHideTimerRef.current)
      hoverHideTimerRef.current = null
    }
    setIsContentHovered(true)
  }

  const handleContentLeave = () => {
    if (hoverHideTimerRef.current) {
      window.clearTimeout(hoverHideTimerRef.current)
    }
    hoverHideTimerRef.current = window.setTimeout(() => {
      setIsContentHovered(false)
      hoverHideTimerRef.current = null
    }, 140)
  }

  const shouldShowHoverControls = isTouchDevice || isContentHovered

  if (!details) {
    return (
      <main
        className={`flex min-h-screen items-center justify-center px-6 py-12 transition-colors ${isLight ? 'theme-light bg-stone-100 text-stone-900' : 'theme-dark bg-stone-950 text-stone-100'}`}
        onMouseEnter={handleContentEnter}
        onMouseLeave={handleContentLeave}
      >
        {shouldShowHoverControls && (
          <button
            type="button"
            onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
            onMouseEnter={handleContentEnter}
            className={`fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border text-base backdrop-blur-md transition md:right-8 md:top-8 ${isLight ? 'border-stone-800/20 bg-white/85 text-amber-600 hover:bg-white' : 'border-white/20 bg-black/35 text-amber-200 hover:border-amber-200/60'}`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
        )}

        {shouldShowHoverControls && (
          <button
            type="button"
            onClick={handleDismissPage}
            onMouseEnter={handleContentEnter}
            className={`fixed left-4 top-4 z-30 cursor-pointer rounded-xl border px-4 py-2 text-xs uppercase tracking-[0.3em] backdrop-blur-md transition md:left-8 md:top-8 ${isLight ? 'border-stone-800/20 bg-white/85 text-stone-700 hover:border-amber-500/60 hover:text-amber-700' : 'border-amber-200/40 bg-black/35 text-amber-200 hover:border-amber-200/70 hover:text-amber-100'}`}
          >
            Close Page
          </button>
        )}

        <div
          className={`layout-frame w-full max-w-xl rounded-3xl p-8 text-center ${isLight ? 'border-stone-200/80 bg-white/80' : 'bg-white/[0.04]'}`}
        >
          {isLoadingDetails ? (
            <div className="space-y-4 text-left" aria-live="polite" role="status">
              <div className="loading-shimmer h-3 w-36 rounded-xl" />
              <div className="loading-shimmer h-10 w-4/5 rounded-xl" />
              <div className="loading-shimmer h-4 w-full rounded-xl" />
              <div className="loading-shimmer h-4 w-11/12 rounded-xl" />
              <div className="loading-shimmer h-52 w-full rounded-2xl" />
              <div className="grid gap-3 md:grid-cols-3">
                <div className="loading-shimmer h-28 w-full rounded-2xl" />
                <div className="loading-shimmer h-28 w-full rounded-2xl" />
                <div className="loading-shimmer h-28 w-full rounded-2xl" />
              </div>
            </div>
          ) : (
            <>
              <p className={`text-xs uppercase tracking-[0.35em] ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>
                Project Not Found
              </p>
              <h1 className={`mt-4 font-serif text-3xl ${isLight ? 'text-stone-900' : ''}`}>
                The project page does not exist.
              </h1>
              <p className={`mt-4 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                Check the URL or return to the portfolio landing page.
              </p>
            </>
          )}
          {!isLoadingDetails && (
            <button
              type="button"
              onClick={handleDismissPage}
              className={`mt-8 inline-flex cursor-pointer rounded-xl border px-5 py-3 text-sm uppercase tracking-[0.2em] transition ${isLight ? 'border-amber-500/70 bg-amber-100 text-amber-800 hover:bg-amber-200/80' : 'border-amber-200/60 bg-amber-300/20 text-amber-100 hover:bg-amber-300/30'}`}
            >
              Dismiss Page
            </button>
          )}
        </div>
      </main>
    )
  }

  return (
    <main
      ref={(node) => {
        animationRef.current = node
      }}
      className={`min-h-screen px-6 py-12 transition-colors md:px-12 lg:px-20 ${isLight ? 'theme-light bg-stone-100 text-stone-900' : 'theme-dark bg-stone-950 text-stone-100'}`}
      onMouseEnter={handleContentEnter}
      onMouseLeave={handleContentLeave}
    >
      <div className="mx-auto w-full max-w-6xl">
        {shouldShowHoverControls && (
          <button
            type="button"
            onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
            onMouseEnter={handleContentEnter}
            className={`fixed right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border text-base backdrop-blur-md transition md:right-8 md:top-8 ${isLight ? 'border-stone-800/20 bg-white/85 text-amber-600 hover:bg-white' : 'border-white/20 bg-black/35 text-amber-200 hover:border-amber-200/60'}`}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
        )}

        {shouldShowHoverControls && (
          <button
            type="button"
            onClick={handleDismissPage}
            onMouseEnter={handleContentEnter}
            className={`fixed left-4 top-4 z-30 cursor-pointer rounded-xl border px-4 py-2 text-xs uppercase tracking-[0.3em] backdrop-blur-md transition md:left-8 md:top-8 ${isLight ? 'border-stone-800/20 bg-white/85 text-stone-700 hover:border-amber-500/60 hover:text-amber-700' : 'border-amber-200/40 bg-black/35 text-amber-200 hover:border-amber-200/70 hover:text-amber-100'}`}
          >
            Close Page
          </button>
        )}

        <article
          data-gsap-reveal
          className={`layout-frame mt-6 rounded-[2rem] p-6 md:p-10 ${isLight ? 'border-stone-200/80 bg-white/80' : 'bg-white/[0.04]'}`}
        >
          <div data-gsap-reveal data-gsap-delay="0.08">
            <p className={`text-sm uppercase tracking-[0.45em] ${isLight ? 'text-amber-700' : 'text-amber-300'}`}>Project Details</p>
            <h1 className={`mt-4 font-serif text-3xl leading-tight md:text-5xl ${isLight ? 'text-stone-900' : 'text-stone-50'}`}>{details.name}</h1>
            <p className={`mt-5 max-w-3xl text-base leading-8 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>{details.summary}</p>
          </div>

          <div
            data-gsap-reveal
            data-gsap-delay="0.12"
            className={`layout-card mt-8 overflow-hidden rounded-[1.4rem] ${isLight ? 'border-stone-200/80 bg-stone-100/90' : 'bg-stone-900/70'}`}
          >
            <div className="relative">
              {images.length > 0 ? (
                <div className="aspect-video w-full overflow-hidden">
                  <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${activeImageIndex * 100}%)` }}
                  >
                    {images.map((imageSrc, index) => (
                      <div key={imageSrc} className="h-full w-full shrink-0">
                        <img
                          src={imageSrc}
                          alt={`${details.name} preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex aspect-video w-full items-center justify-center text-sm uppercase tracking-[0.2em] ${isLight ? 'bg-stone-200 text-stone-600' : 'bg-stone-800/60 text-stone-300'}`}
                >
                  Loading image...
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? 'border-stone-500/35 bg-white/90 text-stone-700 hover:bg-white' : 'border-white/30 bg-black/45 text-white hover:bg-black/65'}`}
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={goToNextImage}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] transition ${isLight ? 'border-stone-500/35 bg-white/90 text-stone-700 hover:bg-white' : 'border-white/30 bg-black/45 text-white hover:bg-black/65'}`}
                  >
                    Next
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 px-4 py-3">
                {images.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(index)
                      setAutoplayResetKey((prev) => prev + 1)
                    }}
                    className={`cursor-pointer h-2.5 w-2.5 rounded-full transition ${
                      index === activeImageIndex
                        ? isLight
                          ? 'bg-amber-600'
                          : 'bg-amber-300'
                        : isLight
                          ? 'bg-stone-400/50 hover:bg-stone-500/70'
                          : 'bg-white/35 hover:bg-white/60'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div data-gsap-stagger className="mt-8 grid gap-5 lg:grid-cols-3">
            <section
              data-gsap-stagger-item
              className={`layout-card rounded-2xl p-5 ${isLight ? 'border-stone-200/80 bg-white/80' : 'bg-white/[0.04]'}`}
            >
              <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>Key Responsibilities</p>
              <ul className={`mt-4 space-y-3 text-sm leading-7 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                {details.responsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className={`mt-2 h-1.5 w-1.5 rounded-full ${isLight ? 'bg-amber-600' : 'bg-amber-300'}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section
              data-gsap-stagger-item
              className={`layout-card rounded-2xl p-5 ${isLight ? 'border-stone-200/80 bg-white/80' : 'bg-white/[0.04]'}`}
            >
              <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>Impact</p>
              <ul className={`mt-4 space-y-3 text-sm leading-7 ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                {details.impacts.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className={`mt-2 h-1.5 w-1.5 rounded-full ${isLight ? 'bg-amber-600' : 'bg-amber-300'}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section
              data-gsap-stagger-item
              className={`layout-card rounded-2xl p-5 ${isLight ? 'border-stone-200/80 bg-white/80' : 'bg-white/[0.04]'}`}
            >
              <p className={`text-xs uppercase tracking-[0.3em] ${isLight ? 'text-amber-700' : 'text-amber-200'}`}>Technology Used</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {details.technologies.map((tech) => (
                  <span
                    key={tech}
                    className={`layout-pill rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.2em] ${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-300/10 text-amber-100'}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          </div>

          <div data-gsap-stagger className="mt-8 flex flex-wrap gap-3">
            <a
              href={details.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-gsap-stagger-item
              className={`cursor-pointer rounded-xl border px-5 py-3 text-sm uppercase tracking-[0.2em] transition ${isLight ? 'border-amber-500/70 bg-amber-100 text-amber-800 hover:bg-amber-200/80' : 'border-amber-200/60 bg-amber-300/20 text-amber-100 hover:bg-amber-300/30'}`}
            >
              Open Live Preview
            </a>
            <a
              href={details.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-gsap-stagger-item
              className={`cursor-pointer rounded-xl border px-5 py-3 text-sm uppercase tracking-[0.2em] transition ${isLight ? 'border-stone-300/80 bg-white text-stone-700 hover:bg-stone-100' : 'border-stone-200/30 bg-white/5 text-stone-100 hover:bg-white/10'}`}
            >
              Open Repository
            </a>
            <a
              href={images[activeImageIndex]}
              target="_blank"
              rel="noopener noreferrer"
              data-gsap-stagger-item
              className={`cursor-pointer rounded-xl border px-5 py-3 text-sm uppercase tracking-[0.2em] transition ${isLight ? 'border-stone-300/80 bg-white text-stone-700 hover:bg-stone-100' : 'border-stone-200/30 bg-white/5 text-stone-100 hover:bg-white/10'}`}
            >
              Open Image in New Tab
            </a>
          </div>
        </article>
      </div>
    </main>
  )
}

export default ProjectDetailsPage
