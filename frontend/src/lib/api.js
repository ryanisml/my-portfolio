import {
  faFacebook,
  faGithub,
  faGoogle,
  faInstagram,
  faLinkedin,
  faSteam,
  faXTwitter,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons'
import { faGlobe } from '@fortawesome/free-solid-svg-icons'
import { getApiBaseUrl } from './runtimeConfig'

const baseUrl = getApiBaseUrl()

const socialIconMap = {
  faInstagram,
  faLinkedin,
  faGithub,
  faXTwitter,
  faGoogle,
  faFacebook,
  faYoutube,
  faSteam,
}

function mapSocialLinkIcon(link) {
  const resolvedIcon = socialIconMap[link.icon] ?? faGlobe

  return {
    ...link,
    icon: resolvedIcon,
  }
}

async function fetchJson(path) {
  const response = await fetch(`${baseUrl}${path}`)

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`

    try {
      const errorBody = await response.json()
      throw new Error(errorBody.message || fallbackMessage)
    } catch {
      throw new Error(fallbackMessage)
    }
  }

  return response.json()
}

export function getSlides() {
  return fetchJson('/api/slides')
}

export function getAbout() {
  return fetchJson('/api/about')
}

export function getProjectCards() {
  return fetchJson('/api/projects')
}

export function getProjectDetails(slug) {
  return fetchJson(`/api/projects/${slug}`)
}

export function getSkillGroups() {
  return fetchJson('/api/skills')
}

export function getWorkExperiences() {
  return fetchJson('/api/experiences')
}

export function getSocialLinks() {
  return fetchJson('/api/social-links').then((links) => {
    if (!Array.isArray(links)) return []
    return links.map(mapSocialLinkIcon)
  })
}

export function getContact() {
  return fetchJson('/api/contact')
}

export function getCredentials() {
  return fetchJson('/api/credentials')
}
