import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const projects = [
  {
    slug: 'lorem-project-one',
    name: 'Lorem Project One',
    summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
    coverImage: 'https://placehold.co/1200x720/png?text=Nova+Commerce',
    liveUrl: 'https://example.com/nova-commerce',
    repoUrl: 'https://github.com/yourname/nova-commerce',
    responsibilities: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    ],
    impacts: [
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
      'Mollit anim id est laborum, lorem ipsum dolor sit amet consectetur.',
    ],
    technologies: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
    images: [
      'https://placehold.co/1200x720/png?text=Nova+Commerce+01',
      'https://placehold.co/1200x720/png?text=Nova+Commerce+02',
      'https://placehold.co/1200x720/png?text=Nova+Commerce+03',
    ],
  },
  {
    slug: 'lorem-project-two',
    name: 'Lorem Project Two',
    summary: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    coverImage: 'https://placehold.co/1200x720/png?text=Atlas+Metrics',
    liveUrl: 'https://example.com/atlas-metrics',
    repoUrl: 'https://github.com/yourname/atlas-metrics',
    responsibilities: [
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
      'Qui officia deserunt mollit anim id est laborum in lorem.',
    ],
    impacts: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do.',
      'Eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam quis nostrud exercitation ullamco.',
    ],
    technologies: ['Lorem', 'Ipsum', 'Tempor', 'Labore', 'Magna'],
    images: [
      'https://placehold.co/1200x720/png?text=Atlas+Metrics+01',
      'https://placehold.co/1200x720/png?text=Atlas+Metrics+02',
      'https://placehold.co/1200x720/png?text=Atlas+Metrics+03',
    ],
  },
  {
    slug: 'lorem-project-three',
    name: 'Lorem Project Three',
    summary: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    coverImage: 'https://placehold.co/1200x720/png?text=Signal+Studio',
    liveUrl: 'https://example.com/signal-studio',
    repoUrl: 'https://github.com/yourname/signal-studio',
    responsibilities: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.',
      'Eiusmod tempor incididunt ut labore et dolore magna aliqua ut.',
      'Enim ad minim veniam quis nostrud exercitation ullamco laboris.',
    ],
    impacts: [
      'Nisi ut aliquip ex ea commodo consequat duis aute irure.',
      'Dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Eu fugiat nulla pariatur excepteur sint occaecat cupidatat.',
    ],
    technologies: ['Lorem', 'Ipsum', 'Dolor', 'Fugiat', 'Pariatur'],
    images: [
      'https://placehold.co/1200x720/png?text=Signal+Studio+01',
      'https://placehold.co/1200x720/png?text=Signal+Studio+02',
      'https://placehold.co/1200x720/png?text=Signal+Studio+03',
    ],
  },
]

async function resetAndSeed() {
  await prisma.workExperienceSubHighlight.deleteMany()
  await prisma.workExperienceHighlight.deleteMany()
  await prisma.workExperience.deleteMany()
  await prisma.socialLink.deleteMany()
  await prisma.skill.deleteMany()
  await prisma.slide.deleteMany()
  await prisma.projectTechnology.deleteMany()
  await prisma.projectImpact.deleteMany()
  await prisma.projectResponsibility.deleteMany()
  await prisma.projectImage.deleteMany()
  await prisma.project.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.credential.deleteMany()
  await prisma.aboutItem.deleteMany()
  await prisma.aboutSection.deleteMany()
  await prisma.about.deleteMany()

  // Seed slides
  const slides = [
    {
      slideId: 'intro',
      eyebrow: 'Welcome',
      title: '',
      description: '',
      accent: 'Intro statement',
      sectionClassDark: 'bg-stone-950',
      sectionClassLight: 'bg-amber-100',
      sortOrder: 0,
    },
    {
      slideId: 'about',
      eyebrow: 'About',
      title: 'I am still growing and learning, but I have a story to tell.',
      description:
        'This section gives you experience and background about me, but it’s not a resume dump. It’s a chance to share the story of how I got here and what I care about.',
      accent: 'Profile narrative',
      sectionClassDark: 'bg-slate-900',
      sectionClassLight: 'bg-sky-100',
      sortOrder: 1,
    },
    {
      slideId: 'experience',
      eyebrow: 'Working Experience',
      title: 'I focus on impact and outcomes, not just responsibilities.',
      description:
        'This section is telling the story about my career journey, showing how I’ve grown and what I’ve accomplished at each role.',
      accent: 'Career timeline',
      sectionClassDark: 'bg-cyan-950',
      sectionClassLight: 'bg-cyan-100',
      sortOrder: 2,
    },
    {
      slideId: 'projects',
      eyebrow: 'Selected Work',
      title: 'I highlight the projects and results that show my impact and growth.',
      description:
        'This section highlights the projects and results I’ve delivered at each role, showing how I contributed to the team and company goals.',
      accent: 'Project highlights',
      sectionClassDark: 'bg-zinc-900',
      sectionClassLight: 'bg-rose-100',
      sortOrder: 3,
    },
    {
      slideId: 'skills',
      eyebrow: 'Capabilities',
      title: 'I have a range of skills and expertise that I bring to the table.',
      description:
        'This section highlights the skills and capabilities I bring to the table, showing how I contribute to projects and teams.',
      accent: 'Stack overview',
      sectionClassDark: 'bg-emerald-950',
      sectionClassLight: 'bg-emerald-100',
      sortOrder: 4,
    },
    {
      slideId: 'credentials',
      eyebrow: 'Certification & Organization',
      title: 'I stay active through certifications and community involvement.',
      description:
        'This section highlights the certifications I pursue and the organizations where I contribute and keep growing.',
      accent: 'Credentials and community',
      sectionClassDark: 'bg-teal-950',
      sectionClassLight: 'bg-teal-100',
      sortOrder: 5,
    },
    {
      slideId: 'contact',
      eyebrow: 'Contact',
      title: 'I love to connect and collaborate, so let’s get in touch!',
      description:
        'This section provides a clear call to action for how to get in touch with me, whether it’s through email, LinkedIn, or another method.',
      accent: 'Contact details',
      sectionClassDark: 'bg-amber-950',
      sectionClassLight: 'bg-orange-100',
      sortOrder: 6,
    },
    {
      slideId: 'social',
      eyebrow: 'Follow Me',
      title: '',
      description: '',
      accent: 'Social links',
      sectionClassDark: 'bg-stone-950',
      sectionClassLight: 'bg-stone-100',
      sortOrder: 7,
    },
  ]

  for (const slide of slides) {
    await prisma.slide.create({ data: slide })
  }

  // Seed skills
  const skillGroups = [
    {
      cardName: 'Frontend Core',
      skills: ['React', 'Vite', 'TypeScript', 'Tailwind CSS'],
    },
    {
      cardName: 'Backend & Data',
      skills: ['Node.js', 'Express', 'Prisma', 'PostgreSQL'],
    },
    {
      cardName: 'Tooling & Workflow',
      skills: ['GSAP', 'Figma', 'REST APIs', 'Docker'],
    },
  ]

  for (const [groupId, group] of skillGroups.entries()) {
    for (const [sortOrder, skillName] of group.skills.entries()) {
      await prisma.skill.create({
        data: {
          skillName,
          groupId,
          groupName: group.cardName,
          sortOrder,
        },
      })
    }
  }

  // Seed work experiences
  const experiences = [
    {
      role: 'Lorem Ipsum Engineer',
      company: 'Lorem Corp',
      period: '2022 - Present',
      highlights: [
        {
          title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.',
          subHighlights: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          ],
        },
        {
          title: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.',
          subHighlights: [
            'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
            'Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.',
          ],
        },
      ],
    },
    {
      role: 'Dolor Sit Developer',
      company: 'Adipiscing Inc',
      period: '2019 - 2022',
      highlights: [
        {
          title: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
          subHighlights: [
            'Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.',
            'Mollit anim id est laborum lorem ipsum dolor sit amet consectetur.',
          ],
        },
        {
          title: 'Nisi ut aliquip ex ea commodo consequat duis aute irure dolor.',
          subHighlights: [
            'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.',
            'Tempor incididunt ut labore et dolore magna aliqua ut enim ad.',
          ],
        },
      ],
    },
    {
      role: 'Consectetur Adipiscing Specialist',
      company: 'Eiusmod Tempor',
      period: '2016 - 2019',
      highlights: [
        {
          title: 'Ut labore et dolore magna aliqua enim ad minim veniam quis.',
          subHighlights: [
            'Nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
            'Consequat duis aute irure dolor in reprehenderit in voluptate velit.',
          ],
        },
        {
          title: 'Esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
          subHighlights: [
            'Cupidatat non proident sunt in culpa qui officia deserunt mollit anim.',
            'Id est laborum lorem ipsum dolor sit amet consectetur adipiscing elit.',
          ],
        },
      ],
    },
  ]

  for (const [expSortOrder, exp] of experiences.entries()) {
    const experience = await prisma.workExperience.create({
      data: {
        role: exp.role,
        company: exp.company,
        period: exp.period,
        sortOrder: expSortOrder,
      },
    })

    for (const [highlightSortOrder, highlight] of exp.highlights.entries()) {
      const createdHighlight = await prisma.workExperienceHighlight.create({
        data: {
          experienceId: experience.id,
          title: highlight.title,
          sortOrder: highlightSortOrder,
        },
      })

      for (const [subSortOrder, subItem] of highlight.subHighlights.entries()) {
        await prisma.workExperienceSubHighlight.create({
          data: {
            highlightId: createdHighlight.id,
            item: subItem,
            sortOrder: subSortOrder,
          },
        })
      }
    }
  }

  // Seed credentials (Certification & Organization slide)
  const credentials = [
    { category: 'certification', title: 'Google Data Analytics Professional Certificate', sortOrder: 0 },
    { category: 'certification', title: 'Meta Front-End Developer Certificate', sortOrder: 1 },
    { category: 'certification', title: 'AWS Cloud Practitioner (In Progress)', sortOrder: 2 },
    { category: 'organization', title: 'Core Member, Google Developer Student Clubs', sortOrder: 0 },
    { category: 'organization', title: 'Volunteer Mentor, Campus Web Development Community', sortOrder: 1 },
    { category: 'organization', title: 'Member, Indonesia Frontend Developer Circle', sortOrder: 2 },
  ]

  for (const item of credentials) {
    await prisma.credential.create({ data: item })
  }

  // Seed social links
  const socialLinks = [
    { label: 'Instagram', href: 'https://instagram.com/ryanisml', icon: 'faInstagram' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ryanisml', icon: 'faLinkedin' },
    { label: 'GitHub', href: 'https://github.com/ryanisml', icon: 'faGithub' },
    { label: 'X', href: 'https://x.com/ryanisml', icon: 'faXTwitter' },
    { label: 'Google', href: 'https://www.google.com/search?q=your+name+portfolio', icon: 'faGoogle' },
    { label: 'Facebook', href: 'https://facebook.com/your-name', icon: 'faFacebook' },
    { label: 'YouTube', href: 'https://youtube.com/@your-name', icon: 'faYoutube' },
    { label: 'Steam', href: 'https://steamcommunity.com/id/your-name', icon: 'faSteam' },
  ]

  for (const link of socialLinks) {
    await prisma.socialLink.create({ data: link })
  }

  // Seed projects (existing)
  for (const project of projects) {
    await prisma.project.create({
      data: {
        slug: project.slug,
        name: project.name,
        summary: project.summary,
        coverImage: project.coverImage,
        liveUrl: project.liveUrl,
        repoUrl: project.repoUrl,
        images: {
          create: project.images.map((imageUrl, index) => ({
            imageUrl,
            sortOrder: index,
          })),
        },
        responsibilities: {
          create: project.responsibilities.map((item, index) => ({
            item,
            sortOrder: index,
          })),
        },
        impacts: {
          create: project.impacts.map((item, index) => ({
            item,
            sortOrder: index,
          })),
        },
        technologies: {
          create: project.technologies.map((techName, index) => ({
            techName,
            sortOrder: index,
          })),
        },
      },
    })
  }

  // Seed about information
  await prisma.about.create({
    data: {
      sections: {
        create: [
          {
            title: 'Profile',
            content:
              'I am a product-focused developer who enjoys turning complex ideas into clean, useful digital experiences. My work sits at the intersection of design quality, frontend engineering, and measurable business outcomes.',
            sortOrder: 0,
          },
          {
            title: 'Education',
            sortOrder: 1,
            items: {
              create: [
                { item: 'B.S. in Computer Science - State University', sortOrder: 0 },
                { item: 'UX Research and Product Design Certification', sortOrder: 1 },
                { item: 'Continuous learning through practical product builds', sortOrder: 2 },
              ],
            },
          },
          {
            title: 'Interests',
            content: 'Outside work, I enjoy typography, photography walks, and reverse-engineering thoughtfully crafted products.',
            sortOrder: 2,
          },
        ],
      },
    },
  })

  // Seed contact information
  await prisma.contact.create({
    data: {
      email: 'ryan@ismail.id',
      phone: '+62 822-4020-6742',
      address: 'Jl. Kemakmuran',
      location: 'Samarinda, Indonesia',
      latitude: -0.5021,
      longitude: 117.1536,
      message: 'You can ask me about everything!',
    },
  })
}

resetAndSeed()
  .then(async () => {
    console.log('Seed complete')
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error('Seed failed', error)
    await prisma.$disconnect()
    process.exit(1)
  })
