import useGsapReveal from '../hooks/useGsapReveal'
import { ConnectionLostCard, ContentLoadingCard } from '../components/ContentStates'

function CertificationOrganizationSlide({
  slide,
  setRef,
  nextArrow,
  certifications = [],
  organizations = [],
  isLoading = false,
  hasError = false,
}) {
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

        <div data-gsap-stagger className="grid gap-5 lg:grid-cols-2">
          {isLoading && (
            <>
              <ContentLoadingCard />
              <ContentLoadingCard />
            </>
          )}

          {hasError && <ConnectionLostCard className="lg:col-span-2" />}

          {!isLoading && !hasError && (
            <>
              <article data-gsap-stagger-item className="layout-card rounded-[2rem] bg-white/[0.05] p-6 transition hover:-translate-y-1 md:p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Certification</p>
                <ul className="mt-5 space-y-3">
                  {certifications.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-stone-300 md:text-base">
                      <span className="mt-2 h-2 w-2 rounded-full bg-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>

              <article data-gsap-stagger-item className="layout-card rounded-[2rem] bg-white/[0.05] p-6 transition hover:-translate-y-1 md:p-7">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">Organization</p>
                <ul className="mt-5 space-y-3">
                  {organizations.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-7 text-stone-300 md:text-base">
                      <span className="mt-2 h-2 w-2 rounded-full bg-amber-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </>
          )}
        </div>
      </div>

      {nextArrow}
    </section>
  )
}

export default CertificationOrganizationSlide