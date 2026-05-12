import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { faArrowLeft, faArrowRight, faArrowUp, faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import heroImg from './assets/hero.png'
import { slides as staticSlides } from './data/portfolioData'
import { getAbout, getProjectCards, getSkillGroups, getSlides, getWorkExperiences, getSocialLinks } from './lib/api'
import AboutSlide from './slides/AboutSlide'
import ContactSlide from './slides/ContactSlide'
import IntroSlide from './slides/IntroSlide'
import ProjectsSlide from './slides/ProjectsSlide'
import SkillsSlide from './slides/SkillsSlide'
import WorkingExperienceSlide from './slides/WorkingExperienceSlide'
import { ConnectionLostCard, ContentLoadingCard } from './components/ContentStates'

function App() {
  gsap.registerPlugin(ScrollTrigger)

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return window.localStorage.getItem('portfolio-theme') ?? 'dark'
  })
  const [slides, setSlides] = useState(staticSlides)
  const [activeSlide, setActiveSlide] = useState(staticSlides[0]?.id || 'intro')
  const [aboutSections, setAboutSections] = useState([])
  const [projectCards, setProjectCards] = useState([])
  const [skillGroups, setSkillGroups] = useState([])
  const [workExperiences, setWorkExperiences] = useState([])
  const [socialLinks, setSocialLinks] = useState([])
  const [loadStates, setLoadStates] = useState({
    about: 'loading',
    projects: 'loading',
    skills: 'loading',
    experiences: 'loading',
    social: 'loading',
  })
  const [isContentHovered, setIsContentHovered] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const mainRef = useRef(null)
  const sectionRefs = useRef({})
  const footerRef = useRef(null)
  const hoverHideTimerRef = useRef(null)
  const autoReturnTimerRef = useRef(null)
  const autoReturnLockedRef = useRef(false)
  const activeSlideIndex = slides.findIndex((slide) => slide.id === activeSlide)
  const themedSlides = slides.map((slide) => ({
    ...slide,
    sectionClass: theme === 'light' ? slide.sectionClassLight : slide.sectionClassDark,
  }))

  useEffect(() => {
    window.localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    document.title = 'Portfolio - Ryan Ismail'
  }, [])

  useEffect(() => {
    let isMounted = true

    Promise.allSettled([
      getSlides(),
      getAbout(),
      getProjectCards(),
      getSkillGroups(),
      getWorkExperiences(),
      getSocialLinks(),
    ])
      .then(([slidesResult, aboutResult, projectsResult, skillsResult, experiencesResult, linksResult]) => {
        if (!isMounted) return

        const nextLoadStates = {
          about: aboutResult.status === 'fulfilled' ? 'ready' : 'error',
          projects: projectsResult.status === 'fulfilled' ? 'ready' : 'error',
          skills: skillsResult.status === 'fulfilled' ? 'ready' : 'error',
          experiences: experiencesResult.status === 'fulfilled' ? 'ready' : 'error',
          social: linksResult.status === 'fulfilled' ? 'ready' : 'error',
        }

        if (slidesResult.status === 'fulfilled' && Array.isArray(slidesResult.value) && slidesResult.value.length > 0) {
          const normalizedSlides = slidesResult.value
            .map((slide) => ({
              ...slide,
              id: slide.slideId || slide.id,
            }))
            .filter((slide) => Boolean(slide.id))

          if (normalizedSlides.length > 0) {
            setSlides(normalizedSlides)
            setActiveSlide(normalizedSlides[0].id)
          }
        }

        if (aboutResult.status === 'fulfilled' && Array.isArray(aboutResult.value?.sections)) {
          setAboutSections(aboutResult.value.sections)
        } else {
          setAboutSections([])
        }

        if (projectsResult.status === 'fulfilled' && Array.isArray(projectsResult.value)) {
          setProjectCards(projectsResult.value)
        } else {
          setProjectCards([])
        }

        if (skillsResult.status === 'fulfilled' && Array.isArray(skillsResult.value)) {
          setSkillGroups(skillsResult.value)
        } else {
          setSkillGroups([])
        }

        if (experiencesResult.status === 'fulfilled' && Array.isArray(experiencesResult.value)) {
          setWorkExperiences(experiencesResult.value)
        } else {
          setWorkExperiences([])
        }

        if (linksResult.status === 'fulfilled' && Array.isArray(linksResult.value)) {
          setSocialLinks(linksResult.value)
        } else {
          setSocialLinks([])
        }

        setLoadStates(nextLoadStates)
      })
      .catch((error) => {
        console.warn('Failed to load portfolio data from API.', error)
        setLoadStates({
          about: 'error',
          projects: 'error',
          skills: 'error',
          experiences: 'error',
          social: 'error',
        })
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSlide(entry.target.id)
          }
        })
      },
      {
        threshold: 0.45,
      },
    )

    const sections = Object.values(sectionRefs.current)
    sections.forEach((section) => observer.observe(section))

    return () => {
      sections.forEach((section) => observer.unobserve(section))
      observer.disconnect()
    }
  }, [])

  useEffect(
    () => () => {
      if (hoverHideTimerRef.current) {
        window.clearTimeout(hoverHideTimerRef.current)
      }
      if (autoReturnTimerRef.current) {
        window.clearTimeout(autoReturnTimerRef.current)
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

  useLayoutEffect(() => {
    if (!footerRef.current) return

    const context = gsap.context(() => {
      gsap.fromTo(
        '[data-footer-reveal]',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.09,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            scroller: mainRef.current,
            start: 'top 86%',
          },
        },
      )

      // Only animate footer items if they exist
      const footerItems = footerRef.current?.querySelectorAll('[data-footer-stagger-item]')
      if (footerItems && footerItems.length > 0) {
        gsap.fromTo(
          '[data-footer-stagger-item]',
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.2,
            scrollTrigger: {
              trigger: footerRef.current,
              scroller: mainRef.current,
              start: 'top 86%',
            },
          },
        )
      }
    }, footerRef)

    return () => context.revert()
  }, [socialLinks])

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

  const scrollToSlide = (slideId) => {
    const targetSection = sectionRefs.current[slideId]
    const scrollContainer = mainRef.current
    if (!targetSection || !scrollContainer) return

    scrollContainer.scrollTo({
      top: targetSection.offsetTop,
      behavior: 'smooth',
    })
  }

  const handleMainScroll = () => {
    // Auto-return to top disabled to allow free scrolling to bottom
  }

  const goToPreviousSlide = () => {
    if (activeSlideIndex <= 0) return
    const targetId = slides[activeSlideIndex - 1].id
    scrollToSlide(targetId)
    setActiveSlide(targetId)
  }

  const goToNextSlide = () => {
    if (activeSlideIndex >= slides.length - 1) return
    const targetId = slides[activeSlideIndex + 1].id
    scrollToSlide(targetId)
    setActiveSlide(targetId)
  }

  const shouldShowHoverControls = isTouchDevice || isContentHovered
  const showPrevButton = !isTouchDevice && activeSlideIndex > 0
  const showNextButton = !isTouchDevice && activeSlideIndex < slides.length - 1
  const isPrevDisabled = activeSlideIndex <= 0
  const isNextDisabled = activeSlideIndex >= slides.length - 1

  return (
    <div
      className={`relative h-screen overflow-hidden transition-colors ${theme === 'light' ? 'theme-light bg-stone-100 text-stone-900' : 'theme-dark bg-stone-950 text-stone-100'}`}
    >

      {shouldShowHoverControls && (
        <button
          type="button"
          onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
          onMouseEnter={handleContentEnter}
          onMouseLeave={handleContentLeave}
          className={`fixed right-4 top-4 z-30 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border text-base backdrop-blur-md transition md:right-8 md:top-8 ${theme === 'light' ? 'border-stone-800/20 bg-white/85 text-amber-600 hover:bg-white' : 'border-white/20 bg-black/35 text-amber-200 hover:border-amber-200/60'}`}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
        </button>
      )}

      {showPrevButton && (
        <button
          type="button"
          onClick={goToPreviousSlide}
          disabled={isPrevDisabled}
          className={`fixed bottom-6 left-4 z-20 flex touch-manipulation pointer-events-auto items-center gap-2 rounded-full border px-5 py-2 text-xs uppercase tracking-[0.25em] backdrop-blur-md transition md:bottom-8 md:left-8 ${theme === 'light' ? 'border-stone-800/20 bg-white/85 text-stone-800 shadow-[0_10px_28px_rgba(15,23,42,0.14)] hover:border-amber-500/60 hover:text-amber-700 hover:shadow-[0_12px_30px_rgba(217,119,6,0.2)]' : 'border-white/20 bg-black/35 text-white/85 shadow-[0_10px_28px_rgba(0,0,0,0.45)] hover:border-amber-200/50 hover:text-amber-200 hover:shadow-[0_12px_30px_rgba(251,191,36,0.22)]'} ${isPrevDisabled ? 'cursor-not-allowed opacity-45 hover:translate-x-0 hover:shadow-none' : ''}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-[11px]" />
          Previous
        </button>
      )}

      {showNextButton && (
        <button
          type="button"
          onClick={goToNextSlide}
          disabled={isNextDisabled}
          className={`fixed bottom-6 right-4 z-20 flex touch-manipulation pointer-events-auto items-center gap-2 rounded-full border px-5 py-2 text-xs uppercase tracking-[0.25em] backdrop-blur-md transition md:bottom-8 md:right-8 ${theme === 'light' ? 'border-amber-500/50 bg-amber-100/85 text-amber-800 shadow-[0_10px_28px_rgba(217,119,6,0.18)] hover:border-amber-600 hover:bg-amber-200/85 hover:shadow-[0_12px_30px_rgba(217,119,6,0.24)]' : 'border-amber-200/40 bg-amber-300/18 text-amber-100 shadow-[0_10px_28px_rgba(0,0,0,0.45)] hover:border-amber-200 hover:bg-amber-300/25 hover:shadow-[0_12px_30px_rgba(251,191,36,0.26)]'} ${isNextDisabled ? 'cursor-not-allowed opacity-45 hover:translate-x-0 hover:shadow-none' : ''}`}
        >
          Next
          <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
        </button>
      )}

      {shouldShowHoverControls && activeSlideIndex > 0 && (
        <button
          type="button"
          onClick={() => scrollToSlide(slides[0].id)}
          onMouseEnter={handleContentEnter}
          onMouseLeave={handleContentLeave}
          className={`fixed bottom-20 right-4 z-20 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border backdrop-blur-md transition md:bottom-24 md:right-8 ${theme === 'light' ? 'border-stone-800/20 bg-white/85 text-stone-800 shadow-[0_10px_28px_rgba(15,23,42,0.14)] hover:border-amber-500/60 hover:text-amber-700 hover:shadow-[0_12px_30px_rgba(217,119,6,0.2)]' : 'border-white/20 bg-black/35 text-white/85 shadow-[0_10px_28px_rgba(0,0,0,0.45)] hover:border-amber-200/50 hover:text-amber-200 hover:shadow-[0_12px_30px_rgba(251,191,36,0.22)]'}`}
          aria-label="Scroll to top"
        >
          <FontAwesomeIcon icon={faArrowUp} className="text-sm" />
        </button>
      )}

      <main
        ref={mainRef}
        data-scroll-container
        className="relative h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth"
        onScroll={handleMainScroll}
        onMouseEnter={handleContentEnter}
        onMouseLeave={handleContentLeave}
      >
        <IntroSlide
          slide={themedSlides[0]}
          setRef={(node) => {
            sectionRefs.current.intro = node
          }}
          imageSrc={heroImg}
          theme={theme}
          socialLinks={socialLinks}
          isSocialLoading={loadStates.social === 'loading'}
          hasSocialError={loadStates.social === 'error'}
        />

        <AboutSlide
          slide={themedSlides[1]}
          aboutSections={aboutSections}
          isLoading={loadStates.about === 'loading'}
          hasError={loadStates.about === 'error'}
          setRef={(node) => {
            sectionRefs.current.about = node
          }}
        />

        <WorkingExperienceSlide
          slide={themedSlides[2]}
          setRef={(node) => {
            sectionRefs.current.experience = node
          }}
          experiences={workExperiences}
          isLoading={loadStates.experiences === 'loading'}
          hasError={loadStates.experiences === 'error'}
        />

        <ProjectsSlide
          slide={themedSlides[3]}
          setRef={(node) => {
            sectionRefs.current.projects = node
          }}
          projectCards={projectCards}
          isLoading={loadStates.projects === 'loading'}
          hasError={loadStates.projects === 'error'}
        />

        <SkillsSlide
          slide={themedSlides[4]}
          setRef={(node) => {
            sectionRefs.current.skills = node
          }}
          skillGroups={skillGroups}
          isLoading={loadStates.skills === 'loading'}
          hasError={loadStates.skills === 'error'}
        />

        <ContactSlide
          slide={themedSlides[5]}
          setRef={(node) => {
            sectionRefs.current.contact = node
          }}
        />

        <footer
          id="social"
          ref={(node) => {
            sectionRefs.current.social = node
            footerRef.current = node
          }}
          className={`relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20 ${theme === 'light' ? 'bg-stone-100 text-stone-800' : 'bg-stone-950 text-stone-200'}`}
        >
          <div className={`layout-frame mx-auto w-full max-w-6xl rounded-[2.2rem] px-6 py-7 md:px-10 md:py-9 ${theme === 'light' ? 'bg-white/80' : 'bg-white/[0.04]'}`}>
            <p data-footer-reveal className="mb-5 text-center text-sm uppercase tracking-[0.28em] text-amber-300">Follow Me</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {loadStates.social === 'loading' && (
                <>
                  <ContentLoadingCard />
                  <ContentLoadingCard />
                  <ContentLoadingCard />
                </>
              )}

              {loadStates.social === 'error' && <ConnectionLostCard className="sm:col-span-2 lg:col-span-3" />}

              {loadStates.social === 'ready' &&
                socialLinks
                  .filter((link) => link.label !== 'GitHub' && link.label !== 'LinkedIn')
                  .map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      data-footer-stagger-item
                      className={`layout-card inline-flex items-center gap-3 rounded-2xl px-5 py-4 text-base font-medium transition hover:-translate-y-1 ${theme === 'light' ? 'bg-white text-stone-800 hover:text-amber-600' : 'bg-stone-900/65 text-stone-100 hover:text-amber-300'}`}
                    >
                      <span className={`grid h-11 w-11 place-items-center rounded-xl ${theme === 'light' ? 'bg-stone-100' : 'bg-stone-800/80'}`}>
                        <FontAwesomeIcon icon={link.icon} className="text-xl" />
                      </span>
                      {link.label}
                    </a>
                  ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
