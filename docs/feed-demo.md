# Feed Reordering Demo

This artifact captures the in-memory scoring and reordering of the same seeded window for two users with different stacks.

## Alice (Frontend)
**Stack:** react, nextjs, typescript, zustand

```json
[
  {
    "id": 15,
    "title": "Zustand and React Hook Form Demo",
    "author": "carol_fullstack",
    "matchedTechnologies": [
      "react",
      "typescript",
      "zustand"
    ],
    "_score": 0.999992235889344
  },
  {
    "id": 1,
    "title": "React Dashboard for Analytics",
    "author": "alice_frontend",
    "matchedTechnologies": [
      "react",
      "nextjs",
      "typescript"
    ],
    "_score": 0.999992235889344
  },
  {
    "id": 9,
    "title": "TypeScript Utility Library",
    "author": "carol_fullstack",
    "matchedTechnologies": [
      "react",
      "typescript"
    ],
    "_score": 0.983154965459899
  },
  {
    "id": 13,
    "title": "Next.js Blog Platform",
    "author": "alice_frontend",
    "matchedTechnologies": [
      "react",
      "nextjs",
      "typescript"
    ],
    "_score": 0.8190519973898929
  },
  {
    "id": 7,
    "title": "Zustand State Management Demo",
    "author": "alice_frontend",
    "matchedTechnologies": [
      "react",
      "typescript",
      "zustand"
    ],
    "_score": 0.7595259986949464
  },
  {
    "id": 3,
    "title": "Fullstack Todo App",
    "author": "carol_fullstack",
    "matchedTechnologies": [
      "react",
      "typescript"
    ],
    "_score": 0.7047706620831851
  },
  {
    "id": 12,
    "title": "React Native Learning Project",
    "author": "frank_newbie",
    "matchedTechnologies": [
      "react"
    ],
    "_score": 0.499996117944672
  },
  {
    "id": 6,
    "title": "JavaScript Weather Widget",
    "author": "frank_newbie",
    "matchedTechnologies": [
      "react"
    ],
    "_score": 0.4690519973898929
  },
  {
    "id": 8,
    "title": "Postgres Query Optimizer CLI",
    "author": "bob_backend",
    "matchedTechnologies": [],
    "_score": 0.29999223588934404
  },
  {
    "id": 2,
    "title": "Express REST API Starter",
    "author": "bob_backend",
    "matchedTechnologies": [],
    "_score": 0.2831549654598991
  },
  {
    "id": 10,
    "title": "Python Data Pipeline",
    "author": "dave_pythonista",
    "matchedTechnologies": [],
    "_score": 0.2381039954165185
  },
  {
    "id": 11,
    "title": "CI Pipeline with Docker",
    "author": "erin_devops",
    "matchedTechnologies": [],
    "_score": 0.1889832664010064
  },
  {
    "id": 4,
    "title": "Django Blog Engine",
    "author": "dave_pythonista",
    "matchedTechnologies": [],
    "_score": 0.1889832664010064
  },
  {
    "id": 5,
    "title": "Dockerized Microservice Template",
    "author": "erin_devops",
    "matchedTechnologies": [],
    "_score": 0.14999611754355555
  },
  {
    "id": 14,
    "title": "Prisma Schema Design Sample",
    "author": "bob_backend",
    "matchedTechnologies": [],
    "_score": 0.059525998694946444
  }
]
```

## Bob (Backend)
**Stack:** nodejs, express, postgresql, prisma

```json
[
  {
    "id": 8,
    "title": "Postgres Query Optimizer CLI",
    "author": "bob_backend",
    "matchedTechnologies": [
      "nodejs",
      "postgresql"
    ],
    "_score": 0.9999922102178918
  },
  {
    "id": 2,
    "title": "Express REST API Starter",
    "author": "bob_backend",
    "matchedTechnologies": [
      "nodejs",
      "express",
      "postgresql"
    ],
    "_score": 0.9831549412292746
  },
  {
    "id": 14,
    "title": "Prisma Schema Design Sample",
    "author": "bob_backend",
    "matchedTechnologies": [
      "nodejs",
      "postgresql",
      "prisma"
    ],
    "_score": 0.7595259937602683
  },
  {
    "id": 10,
    "title": "Python Data Pipeline",
    "author": "dave_pythonista",
    "matchedTechnologies": [
      "postgresql"
    ],
    "_score": 0.5881039750410733
  },
  {
    "id": 3,
    "title": "Fullstack Todo App",
    "author": "carol_fullstack",
    "matchedTechnologies": [
      "nodejs"
    ],
    "_score": 0.4714373083744066
  },
  {
    "id": 4,
    "title": "Django Blog Engine",
    "author": "dave_pythonista",
    "matchedTechnologies": [
      "postgresql"
    ],
    "_score": 0.42231658356233814
  },
  {
    "id": 5,
    "title": "Dockerized Microservice Template",
    "author": "erin_devops",
    "matchedTechnologies": [
      "nodejs"
    ],
    "_score": 0.3833294384422792
  },
  {
    "id": 15,
    "title": "Zustand and React Hook Form Demo",
    "author": "carol_fullstack",
    "matchedTechnologies": [],
    "_score": 0.29999221021789174
  },
  {
    "id": 1,
    "title": "React Dashboard for Analytics",
    "author": "alice_frontend",
    "matchedTechnologies": [],
    "_score": 0.29999221021789174
  },
  {
    "id": 9,
    "title": "TypeScript Utility Library",
    "author": "carol_fullstack",
    "matchedTechnologies": [],
    "_score": 0.2831549412292747
  },
  {
    "id": 11,
    "title": "CI Pipeline with Docker",
    "author": "erin_devops",
    "matchedTechnologies": [],
    "_score": 0.18898325022900483
  },
  {
    "id": 12,
    "title": "React Native Learning Project",
    "author": "frank_newbie",
    "matchedTechnologies": [],
    "_score": 0.14999610510894587
  },
  {
    "id": 13,
    "title": "Next.js Blog Platform",
    "author": "alice_frontend",
    "matchedTechnologies": [],
    "_score": 0.11905198752053665
  },
  {
    "id": 6,
    "title": "JavaScript Weather Widget",
    "author": "frank_newbie",
    "matchedTechnologies": [],
    "_score": 0.11905198752053665
  },
  {
    "id": 7,
    "title": "Zustand State Management Demo",
    "author": "alice_frontend",
    "matchedTechnologies": [],
    "_score": 0.05952599376026833
  }
]
```
