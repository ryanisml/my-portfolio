import { useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import useGsapReveal from '../hooks/useGsapReveal'
import { getContact } from '../lib/api'
import { getApiBaseUrl, getRecaptchaSiteKey } from '../lib/runtimeConfig'
import { ConnectionLostCard, ContentLoadingCard, ShimmerLine } from '../components/ContentStates'

const API_URL = getApiBaseUrl()
const RECAPTCHA_SITE_KEY = getRecaptchaSiteKey()
const captchaReady = !!RECAPTCHA_SITE_KEY && RECAPTCHA_SITE_KEY !== 'your_recaptcha_site_key_here'

function ContactSlide({ slide, setRef }) {
  const animationRef = useGsapReveal()
  const [contact, setContact] = useState(null)
  const [contactStatus, setContactStatus] = useState('loading') // loading | ready | error
  const [captchaToken, setCaptchaToken] = useState(null)
  const [submitStatus, setSubmitStatus] = useState('idle') // idle | loading | success | error
  const [submitError, setSubmitError] = useState('')
  const recaptchaRef = useRef(null)
  const formRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    getContact()
      .then((data) => {
        if (isMounted) {
          setContact(data)
          setContactStatus('ready')
        }
      })
      .catch(() => {
        if (isMounted) {
          setContact(null)
          setContactStatus('error')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (contactStatus === 'loading') {
    return (
      <section
        id={slide.id}
        ref={(node) => {
          animationRef.current = node
          setRef(node)
        }}
        className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
      >
        <div data-gsap-reveal className="layout-frame mx-auto w-full max-w-6xl rounded-[2.5rem] bg-amber-300/8 p-8 backdrop-blur-md lg:p-12">
          <div data-gsap-reveal data-gsap-delay="0.08" className="mb-8">
            <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
            <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
              {slide.title}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200">{slide.description}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <ContentLoadingCard className="p-5" />
                <ContentLoadingCard className="p-5" />
                <ContentLoadingCard className="p-5" />
                <ContentLoadingCard className="p-5" />
              </div>
              <ContentLoadingCard className="p-6" />
            </div>

            <div className="layout-card rounded-[1.75rem] bg-stone-900/70 p-6">
              <ShimmerLine className="h-3 w-24" />
              <ShimmerLine className="mt-4 h-6 w-2/3" />
              <ShimmerLine className="mt-6 h-10 w-full" />
              <ShimmerLine className="mt-4 h-10 w-full" />
              <ShimmerLine className="mt-4 h-24 w-full" />
              <ShimmerLine className="mt-5 h-10 w-40" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (contactStatus === 'error' || !contact) {
    return (
      <section
        id={slide.id}
        ref={(node) => {
          animationRef.current = node
          setRef(node)
        }}
        className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
      >
        <div data-gsap-reveal className="layout-frame mx-auto w-full max-w-6xl rounded-[2.5rem] bg-amber-300/8 p-8 backdrop-blur-md lg:p-12">
          <div data-gsap-reveal data-gsap-delay="0.08" className="mb-8">
            <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
            <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
              {slide.title}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200">{slide.description}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ConnectionLostCard />
            <ConnectionLostCard />
          </div>
        </div>
      </section>
    )
  }

  const contactInfoItems = [
    ['Location', contact.location],
    ['Email', contact.email],
    ['Telephone', contact.phone],
    ['Address', contact.address],
  ]

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!captchaToken) {
      setSubmitError('Please complete the reCAPTCHA challenge.')
      return
    }

    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()

    setSubmitStatus('loading')
    setSubmitError('')

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, captchaToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.message || 'Failed to send message.')
        setSubmitStatus('error')
        recaptchaRef.current?.reset()
        setCaptchaToken(null)
        return
      }

      setSubmitStatus('success')
      formRef.current?.reset()
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } catch {
      setSubmitError('Could not reach the server. Please try again.')
      setSubmitStatus('error')
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    }
  }

  // Build Google Maps URL using latitude and longitude
  const mapsUrl = contact.latitude && contact.longitude
    ? `https://maps.google.com/maps?q=${contact.latitude},${contact.longitude}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(contact.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`

  return (
    <section
      id={slide.id}
      ref={(node) => {
        animationRef.current = node
        setRef(node)
      }}
      className={`${slide.sectionClass} relative flex min-h-screen snap-start items-center px-6 py-12 md:px-12 lg:px-20`}
    >
      <div data-gsap-reveal className="layout-frame mx-auto w-full max-w-6xl rounded-[2.5rem] bg-amber-300/8 p-8 backdrop-blur-md lg:p-12">
        <div data-gsap-reveal data-gsap-delay="0.08" className="mb-8">
          <p className="text-sm uppercase tracking-[0.45em] text-amber-300">{slide.eyebrow}</p>
          <h2 className="mt-5 font-serif text-3xl leading-tight text-stone-50 md:text-5xl">
            {slide.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-200">{slide.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div data-gsap-stagger className="grid gap-4 md:grid-cols-2">
              {contactInfoItems.map(([label, value]) => (
                <article
                  key={label}
                  data-gsap-stagger-item
                  className="layout-card rounded-[1.5rem] bg-stone-900/70 p-5 transition hover:-translate-y-1"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">{label}</p>
                  <p className="mt-3 text-sm leading-7 text-stone-100 break-words">{value}</p>
                </article>
              ))}
            </div>

            <article
              data-gsap-reveal
              data-gsap-delay="0.16"
              className="layout-card rounded-[1.75rem] bg-stone-900/70 p-6 transition hover:-translate-y-1"
            >
              <h3 className="font-serif text-xl text-stone-50 md:text-2xl">Google Maps</h3>
              <div className="mt-4 text-sm text-stone-300 mb-2">
                {contact.latitude && contact.longitude && (
                  <p>Coordinates: {contact.latitude.toFixed(4)}, {contact.longitude.toFixed(4)}</p>
                )}
              </div>
              <iframe
                title="Google Maps Location"
                src={mapsUrl}
                loading="lazy"
                className="h-56 w-full rounded-[1.25rem] border-0"
              />
            </article>
          </div>

          <form
            ref={formRef}
            onSubmit={handleSendMessage}
            data-gsap-reveal
            data-gsap-delay="0.12"
            className="layout-card rounded-[1.75rem] bg-stone-900/70 p-6 transition hover:-translate-y-1"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200">Direct Message</p>
            <h3 className="mt-3 font-serif text-xl text-stone-50 md:text-2xl">{contact.message}</h3>

            {submitStatus === 'success' && (
              <div className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                ✓ Message sent! I'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && submitError && (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {submitError}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-4">
              <label className="text-sm text-stone-200" htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-stone-50 outline-none transition placeholder:text-white/50 focus:border-amber-300/70 disabled:opacity-50"
                placeholder="Your name"
              />

              <label className="text-sm text-stone-200" htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-stone-50 outline-none transition placeholder:text-white/50 focus:border-amber-300/70 disabled:opacity-50"
                placeholder="you@example.com"
              />

              <label className="text-sm text-stone-200" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-stone-50 outline-none transition placeholder:text-white/50 focus:border-amber-300/70 disabled:opacity-50"
                placeholder="Tell me about your project..."
              />

              {captchaReady ? (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  theme="dark"
                  onChange={(token) => setCaptchaToken(token)}
                  onExpired={() => setCaptchaToken(null)}
                />
              ) : (
                <div className="flex items-start gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-300">
                  <span className="shrink-0">⚠️</span>
                  <span>reCAPTCHA is not configured — set <code className="font-mono">VITE_RECAPTCHA_SITE_KEY</code> to enable the contact form.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!captchaReady || !captchaToken || submitStatus === 'loading' || submitStatus === 'success'}
                className="mt-2 rounded-xl border border-amber-200/60 bg-amber-300/20 px-5 py-3 text-sm uppercase tracking-[0.2em] text-amber-100 transition hover:bg-amber-300/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitStatus === 'loading' ? 'Sending…' : submitStatus === 'success' ? 'Sent ✓' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactSlide