import useGsapReveal from '../hooks/useGsapReveal'
import { ConnectionLostCard, ContentLoadingCard } from '../components/ContentStates'

function AboutSlide({ slide, setRef, aboutSections, nextArrow, isLoading = false, hasError = false }) {
  const animationRef = useGsapReveal()

  if (isLoading) {
    return (
      <section
        id={slide.id}
        ref={(node) => {
          animationRef.current = node
          setRef(node)
        }}
        className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
      >
        <div className="layout-frame mx-auto grid w-full max-w-6xl gap-10 rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div data-gsap-reveal className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
              <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">{slide.title}</h2>
            </div>
            <div className="space-y-4">
              <p className="max-w-xl text-base leading-8 text-stone-300">{slide.description}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <ContentLoadingCard />
            <ContentLoadingCard />
            <ContentLoadingCard />
          </div>
        </div>
        {nextArrow}
      </section>
    )
  }

  if (hasError) {
    return (
      <section
        id={slide.id}
        ref={(node) => {
          animationRef.current = node
          setRef(node)
        }}
        className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
      >
        <div className="layout-frame mx-auto grid w-full max-w-6xl gap-10 rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
              <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">{slide.title}</h2>
            </div>
            <p className="max-w-xl text-base leading-8 text-stone-300">{slide.description}</p>
          </div>
          <ConnectionLostCard />
        </div>
        {nextArrow}
      </section>
    )
  }

  // Show empty state if no sections
  if (!aboutSections || aboutSections.length === 0) {
    return (
      <section
        id={slide.id}
        ref={(node) => {
          animationRef.current = node
          setRef(node)
        }}
        className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
      >
        <div className="layout-frame mx-auto grid w-full max-w-6xl gap-10 rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
          <div data-gsap-reveal className="flex flex-col justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
              <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">{slide.title}</h2>
            </div>
            <div className="space-y-4">
              <p className="max-w-xl text-base leading-8 text-stone-300">{slide.description}</p>
            </div>
          </div>
        </div>
        {nextArrow}
      </section>
    )
  }

  return (
    <section
      id={slide.id}
      ref={(node) => {
        animationRef.current = node
        setRef(node)
      }}
      className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
    >
      <div data-gsap-reveal className="layout-frame mx-auto grid w-full max-w-6xl gap-10 rounded-[2.5rem] bg-white/5 p-8 backdrop-blur-md lg:grid-cols-[0.9fr_1.1fr] lg:p-12">
        <div data-gsap-reveal data-gsap-delay="0.08" className="flex flex-col justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
            <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
              {slide.title}
            </h2>
          </div>
          <div className="space-y-4">
            <p className="max-w-xl text-base leading-8 text-stone-300">{slide.description}</p>
          </div>
        </div>

        <div data-gsap-stagger className="grid gap-4 md:grid-cols-1">
          {aboutSections.map((section, index) => (
            <div
              key={section.title}
              data-gsap-stagger-item
              className="layout-card rounded-[1.75rem] bg-stone-900/70 p-6 transition hover:-translate-y-1"
            >
              <h3 className="mt-3 font-serif text-xl text-stone-50 md:text-2xl">{section.title}</h3>
              {section.items ? (
                <ul className="mt-3 space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-stone-300">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm leading-7 text-stone-300">{section.content}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {nextArrow}
    </section>
  )
}

export default AboutSlide