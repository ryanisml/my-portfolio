import useGsapReveal from '../hooks/useGsapReveal'
import { ConnectionLostCard, ContentLoadingCard } from '../components/ContentStates'

function ProjectsSlide({ slide, setRef, nextArrow, projectCards, isLoading = false, hasError = false }) {
  const animationRef = useGsapReveal()

  return (
    <section
      id={slide.id}
      ref={(node) => {
        animationRef.current = node
        setRef(node)
      }}
      className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
    >
      <div data-gsap-reveal className="mx-auto w-full max-w-6xl">
        <div data-gsap-reveal data-gsap-delay="0.08" className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
            <h2 className="mt-5 max-w-3xl font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
              {slide.title}
            </h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-stone-300">{slide.description}</p>
        </div>

        <div data-gsap-stagger className="grid gap-5 lg:grid-cols-3">
          {isLoading && (
            <>
              <ContentLoadingCard className="min-h-80" />
              <ContentLoadingCard className="min-h-80" />
              <ContentLoadingCard className="min-h-80" />
            </>
          )}

          {hasError && <ConnectionLostCard className="lg:col-span-3" />}

          {!isLoading &&
            !hasError &&
            projectCards.map((project, index) => (
              <a
                key={project.name}
                href={project.detailsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.name} details in a new tab`}
                data-gsap-stagger-item
                className="layout-card group flex min-h-80 flex-col justify-between rounded-[2rem] bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-amber-200/50 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-white/40">0{index + 1}</p>
                  <h3 className="mt-5 font-serif text-2xl text-stone-50">{project.name}</h3>
                  <p className="mt-4 text-sm leading-7 text-stone-300">{project.summary}</p>
                </div>
                <div className="mt-6 flex items-center justify-end border-t border-stone-300/20 pt-5 text-sm uppercase tracking-[0.25em] text-amber-200">
                  <span className="transition group-hover:translate-x-1 ">Open in new tab</span>
                </div>
              </a>
            ))}
        </div>
      </div>

      {nextArrow}
    </section>
  )
}

export default ProjectsSlide