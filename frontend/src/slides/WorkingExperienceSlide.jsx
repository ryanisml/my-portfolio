import useGsapReveal from '../hooks/useGsapReveal'
import { ConnectionLostCard, ContentLoadingCard } from '../components/ContentStates'

function WorkingExperienceSlide({ slide, setRef, experiences, isLoading = false, hasError = false }) {
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
        <div data-gsap-reveal data-gsap-delay="0.08" className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
            <h2 className="mt-5 max-w-3xl font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
              {slide.title}
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-stone-300">{slide.description}</p>
        </div>

        <div data-gsap-stagger className="space-y-5">
          {isLoading && (
            <>
              <ContentLoadingCard />
              <ContentLoadingCard />
            </>
          )}

          {hasError && <ConnectionLostCard />}

          {!isLoading &&
            !hasError &&
            experiences.map((item) => (
              <article
                key={`${item.company}-${item.role}`}
                data-gsap-stagger-item
                className="layout-card rounded-[2rem] bg-white/[0.05] p-6 transition hover:-translate-y-1 md:p-7"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">{item.company}</p>
                    <h3 className="mt-2 font-serif text-2xl text-stone-50">{item.role}</h3>
                  </div>
                  <p className="text-sm uppercase tracking-[0.2em] text-amber-200">{item.period}</p>
                </div>

                <ul className="mt-6 space-y-3">
                  {item.highlights.map((point) => {
                    const mainText = typeof point === 'string' ? point : point.title
                    const subHighlights = typeof point === 'string' ? [] : (point.subHighlights ?? [])

                    return (
                      <li
                        key={mainText}
                        className="text-stone-300"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-2 h-2 w-2 rounded-full bg-amber-300" />
                          <span className="text-sm leading-7 md:text-base">{mainText}</span>
                        </div>

                        {subHighlights.length > 0 && (
                          <ul className="ml-8 mt-2 space-y-2">
                            {subHighlights.map((subPoint) => (
                              <li key={subPoint} className="flex items-start gap-2 text-sm leading-6 text-stone-300/90">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-200/90" />
                                <span>{subPoint}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </article>
            ))}
        </div>
      </div>
    </section>
  )
}

export default WorkingExperienceSlide
