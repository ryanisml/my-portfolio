import useGsapReveal from '../hooks/useGsapReveal'
import { ConnectionLostCard, ContentLoadingCard } from '../components/ContentStates'

function SkillsSlide({ slide, setRef, nextArrow, skillGroups, isLoading = false, hasError = false }) {
  const animationRef = useGsapReveal()
  const normalizedGroups = Array.isArray(skillGroups)
    ? skillGroups
      .map((group, index) => {
        if (Array.isArray(group)) {
          return {
            groupId: index,
            cardName: `Track ${String(index + 1).padStart(2, '0')}`,
            skills: group,
          }
        }

        return {
          groupId: group?.groupId ?? index,
          cardName: group?.cardName || `Track ${String(index + 1).padStart(2, '0')}`,
          skills: Array.isArray(group?.skills) ? group.skills : [],
        }
      })
      .slice(0, 10)
    : []

  return (
    <section
      id={slide.id}
      ref={(node) => {
        animationRef.current = node
        setRef(node)
      }}
      className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
    >
      <div data-gsap-reveal className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div data-gsap-reveal data-gsap-delay="0.08">
          <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
          <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
            {slide.title}
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-stone-300">{slide.description}</p>
        </div>

        <div data-gsap-stagger className="space-y-5">
          {isLoading && (
            <>
              <ContentLoadingCard />
              <ContentLoadingCard />
              <ContentLoadingCard />
            </>
          )}

          {hasError && <ConnectionLostCard />}

          {!isLoading &&
            !hasError &&
            normalizedGroups.map((group, index) => (
              <div
                key={`${group.groupId}-${group.cardName}`}
                data-gsap-stagger-item
                className="layout-card rounded-[2rem] bg-white/[0.04] p-6 backdrop-blur-md transition hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">{group.cardName || `Track ${String(index + 1).padStart(2, '0')}`}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="layout-pill rounded-full bg-amber-300/10 px-4 py-2 text-sm text-amber-100 transition hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {nextArrow}
    </section>
  )
}

export default SkillsSlide