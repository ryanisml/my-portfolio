import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function useGsapReveal(options = {}) {
  const {
    start = 'top 86%',
    duration = 0.6,
    y = 24,
    stagger = 0.1,
    once = true,
  } = options
  const scopeRef = useRef(null)

  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope || !(scope instanceof Element)) return undefined

    const scroller = scope.closest('[data-scroll-container]') ?? undefined

    const context = gsap.context(() => {
      const groups = gsap.utils.toArray(scope.querySelectorAll('[data-gsap-stagger]'))

      groups.forEach((group) => {
        if (!(group instanceof Element)) return
        const items = gsap.utils.toArray(group.querySelectorAll('[data-gsap-stagger-item]'))
        if (!items.length) return

        gsap.fromTo(
          items,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration,
            ease: 'power3.out',
            stagger,
            scrollTrigger: {
              trigger: group,
              start,
              once,
              scroller,
            },
          },
        )
      })

      const reveals = gsap.utils.toArray(scope.querySelectorAll('[data-gsap-reveal]'))

      reveals.forEach((element) => {
        if (!(element instanceof Element)) return
        const delayAttr = Number(element.getAttribute('data-gsap-delay') ?? 0)
        const revealY = Number(element.getAttribute('data-gsap-y') ?? y)
        const revealDuration = Number(element.getAttribute('data-gsap-duration') ?? duration)

        gsap.fromTo(
          element,
          { autoAlpha: 0, y: revealY },
          {
            autoAlpha: 1,
            y: 0,
            duration: revealDuration,
            delay: Number.isNaN(delayAttr) ? 0 : delayAttr,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start,
              once,
              scroller,
            },
          },
        )
      })
    }, scope)

    ScrollTrigger.refresh()

    return () => context.revert()
  }, [duration, once, stagger, start, y])

  return scopeRef
}

export default useGsapReveal
