# CodeCritic

### Peer Code Review Platform

CodeCritic is a developer-focused peer code review platform developed as part of the **Software Engineering Professionals Program**.

The platform allows developers to submit their projects for peer review, receive structured feedback from other developers, review other developers' work, and earn **Karma points** for their contributions.

The project is designed as a full-stack web application consisting of a responsive frontend, backend REST APIs, database layer, authentication, and a personalized recommendation feed.

---

## Table of Contents

* [Overview](#overview)
* [Objectives](#objectives)
* [Key Features](#key-features)
* [User Roles](#user-roles)
* [System Workflow](#system-workflow)
* [Review Request Workflow](#review-request-workflow)
* [Review Workflow](#review-workflow)
* [Karma System](#karma-system)
* [Recommendation Feed](#recommendation-feed)
* [Reviewer Reputation and Profile Insights](#reviewer-reputation-and-profile-insights)
* [Request Status Lifecycle](#request-status-lifecycle)
* [Technology Stack](#technology-stack)
* [System Architecture](#system-architecture)
* [Repository Structure](#repository-structure)
* [Database Design](#database-design)
* [API Design](#api-design)
* [Authentication and Authorization](#authentication-and-authorization)
* [Validation and Security](#validation-and-security)
* [Responsive Design](#responsive-design)
* [Development Setup](#development-setup)
* [Environment Variables](#environment-variables)
* [Git Workflow](#git-workflow)
* [Project Documentation](#project-documentation)
* [Testing](#testing)
* [Deployment](#deployment)
* [Project Requirements](#project-requirements)
* [Team Contributions](#team-contributions)
* [Future Improvements](#future-improvements)

---

# Overview

CodeCritic is an MVP peer code-review platform where developers can help each other improve their software projects through structured peer feedback.

A user can submit a project by providing:

* Project title
* Project description
* GitHub repository URL
* Technology tags
* Custom review criteria

Other authenticated developers can then review the submitted project by:

* Providing written feedback
* Describing what was done well
* Identifying areas for improvement
* Providing optional learning/resource links
* Rating each review criterion out of 10

For every completed review, the reviewer receives **+2 Karma points**.

The platform also includes a personalized recommendation feed that intelligently reorders review requests based on the logged-in user's technical interests and other ranking factors.

---

# Objectives

The main objectives of CodeCritic are to:

1. Provide a platform for developers to request peer code reviews.
2. Enable developers to provide structured and meaningful feedback.
3. Encourage participation through a Karma-based contribution system.
4. Provide a public feed of available review requests.
5. Personalize the feed for authenticated users.
6. Allow developers to discover projects related to their technology stack.
7. Provide public developer profiles.
8. Demonstrate a complete full-stack software engineering solution.
9. Implement secure authentication and backend validation.
10. Demonstrate collaborative software development through GitHub.

---

# Key Features

## Core Features

* Public review request feed
* Review request search
* Review request filtering
* Review request details
* Public user profiles
* User registration and authentication
* User profile management
* Project review request creation
* Custom review criteria
* Peer reviews
* Criterion-based ratings
* Written feedback
* Optional resource links
* Karma points
* Personalized feed
* Review history
* Received review history

## Mandatory Challenge Feature

### Feature 01 — Personalized Recommendation Feed

Authenticated users receive a personalized version of the review request feed.

The recommendation engine must:

* Match review requests against the user's technology stack.
* Prioritize relevant technologies.
* Include at least one additional ranking improvement designed by the team.
* Produce a demonstrably different ordering for different users.
* Be explainable and defensible during the final assessment.

The additional ranking factor selected by the team will be documented here once finalized.

**Current ranking strategy:**

> To be defined and documented by the development team.

---

## Optional Challenge Feature

### Feature 02 — Reviewer Reputation & Profile Insights

The optional profile enhancement provides additional information about a developer's reviewing activity and contribution history.

The profile can include:

* Username
* Technology stack
* Bio
* GitHub profile
* Total Karma
* Number of reviews given
* Number of reviews received
* Additional reviewer insights

Possible additional insights include:

* Most frequently reviewed technologies
* Review activity over time
* Review contribution statistics
* Technology-specific review activity

The final implementation and calculation logic will be documented after development.

---

# User Roles

CodeCritic contains two primary access states.

## Visitor

A visitor is a user who has not authenticated.

Visitors can:

* Browse review requests
* Search review requests
* Filter review requests
* Open review request details
* View public user profiles

Visitors cannot:

* Create review requests
* Submit reviews
* Earn Karma
* Manage their own account

---

## Authenticated User

Authenticated users log in through Clerk.

An authenticated user can act as both a:

* Submitter
* Reviewer

Authenticated users can:

* Create review requests
* Define review criteria
* Review other users' projects
* Provide feedback
* Rate review criteria
* Earn Karma
* View their Karma
* View personalized recommendations
* View their own requests
* View reviews they have given
* View reviews they have received
* Manage their own profile

There is no separate administrator or moderator role in the MVP.

---

# System Workflow

The overall platform workflow is:

```text
User
 │
 ├── Visitor
 │     ├── Browse Feed
 │     ├── Search
 │     ├── Filter
 │     ├── View Request
 │     └── View Profile
 │
 └── Authenticated User
       │
       ├── Create Review Request
       │       ├── Project Details
       │       ├── GitHub URL
       │       ├── Technology Tags
       │       └── Review Criteria
       │
       ├── Browse Personalized Feed
       │
       ├── Review Other Projects
       │       ├── Written Feedback
       │       ├── Resource Links
       │       └── Criterion Ratings
       │
       └── Earn +2 Karma
```

---

# Review Request Workflow

A review request follows this process:

### Step 1 — Create Request

An authenticated user creates a review request.

Required information includes:

* Project title
* Project description
* Feedback/review description
* GitHub repository URL
* One or more technology tags
* Between 1 and 5 custom review criteria

### Step 2 — Publish

After successful validation, the request becomes available on the public feed.

### Step 3 — Discovery

Visitors and authenticated users can:

* Browse
* Search
* Filter
* Open the request

### Step 4 — Receive Reviews

Other authenticated users can submit reviews for the request.

### Step 5 — View Feedback

The request owner can view reviews received for their project.

---

# Review Workflow

A reviewer must be authenticated to submit a review.

The reviewer:

1. Opens another user's review request.
2. Starts the review process.
3. Provides written feedback.
4. Describes what was done well.
5. Describes areas requiring improvement.
6. Optionally provides resource links.
7. Rates every criterion defined by the submitter.
8. Submits the review.
9. Receives +2 Karma.

The submitted review then becomes visible to the project submitter.

---

# Karma System

Karma represents a user's contribution to the CodeCritic community.

## Karma Rule

A reviewer receives:

**+2 Karma per successfully submitted review**

Karma is:

* Fixed
* Not weighted
* Not dynamically calculated
* Not removed after being earned

The backend must ensure that Karma cannot be obtained without a genuine review submission.

### Example

```text
User starts with:

Karma = 10

User submits a valid review:

Karma = 12

User submits another valid review:

Karma = 14
```

Karma updates must be handled securely on the backend.

---

# Recommendation Feed

The personalized recommendation feed is the mandatory flagship feature of CodeCritic.

## Logged-Out Feed

Visitors see:

```text
All Review Requests
        ↓
Sorted by Most Recent
```

---

## Logged-In Feed

Authenticated users receive:

```text
All Review Requests
        ↓
Recommendation / Ranking Engine
        ↓
Technology Relevance
        ↓
Additional Ranking Factor
        ↓
Personalized Ordering
```

The system must prioritize review requests that are relevant to the user's technology stack.

For example:

```text
User Technology Stack:
React
Java
PostgreSQL

Available Requests:

Request A → React, TypeScript
Request B → Python, Django
Request C → Java, Spring Boot
Request D → C++
```

The personalized feed should prioritize requests related to:

```text
React / Java / PostgreSQL
```

over unrelated technologies.

The team must additionally implement at least one ranking improvement beyond simple technology matching.

The final ranking algorithm will be documented in:

```text
/docs/architecture/Recommendation-Engine.md
```

---

# Reviewer Reputation and Profile Insights

If Feature 02 is implemented, the public profile will be available through:

```text
/profile/:username
```

The profile can display:

* Username
* Technology stack
* Bio
* GitHub link
* Total Karma
* Reviews given
* Reviews received
* Reviewer insights

All statistics must be calculated from real database data.

The calculation logic will be documented in the API and database documentation.

---

# Request Status Lifecycle

Review requests have two states.

| Status     | Description                                              |
| ---------- | -------------------------------------------------------- |
| `PENDING`  | Request has been posted but has not received any reviews |
| `REVIEWED` | Request has received one or more reviews                 |

The status is determined by the system.

```text
PENDING
   │
   │ First review submitted
   ▼
REVIEWED
```

There is no rejection, deletion, or moderation workflow in the MVP.

---

# Technology Stack

> This section will be updated according to the final technology stack selected by the team.

## Frontend

* Framework: TBD
* Language: TBD
* Styling: TBD
* State Management: TBD

## Backend

* Framework: TBD
* Programming Language: TBD
* API Architecture: REST API

## Database

* Database: TBD
* Database Design: Relational Database

## Authentication

* Clerk Authentication

## Version Control

* Git
* GitHub

## Deployment

* Frontend: TBD
* Backend: TBD
* Database: TBD

---

# System Architecture

CodeCritic follows a client-server architecture.

```text
                    ┌───────────────────┐
                    │       User        │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │    Frontend       │
                    │   Web Application │
                    └─────────┬─────────┘
                              │
                         REST API
                              │
                              ▼
                    ┌───────────────────┐
                    │      Backend      │
                    │    REST API       │
                    └───────┬─────┬─────┘
                            │     │
                 ┌──────────┘     └──────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │    Database     │         │ Clerk Auth      │
        │                 │         │                 │
        │ Users           │         │ Authentication  │
        │ Requests        │         │ Identity        │
        │ Reviews         │         └─────────────────┘
        │ Criteria        │
        │ Technologies    │
        │ Karma           │
        └─────────────────┘
```

The exact architecture will be refined as implementation progresses.

---

# Repository Structure

The project uses a single repository containing both frontend and backend components.

```text
CodeCritic/
│
├── frontend/
│   └── Frontend application
│
├── backend/
│   └── Backend REST API
│
├── docs/
│   ├── database/
│   │   └── ER-Diagram.md
│   │
│   ├── api/
│   │   └── API-Design.md
│   │
│   └── architecture/
│       ├── System-Architecture.md
│       └── Recommendation-Engine.md
│
├── .gitignore
├── README.md
└── LICENSE
```

---

# Database Design

The database will contain entities required to support the core CodeCritic functionality.

Expected major entities include:

* User
* Review Request
* Technology
* Review Request Technology
* Review Criterion
* Review
* Criterion Rating
* Resource Link

The final ER diagram and relationship definitions will be maintained under:

```text
/docs/database/
```

The database design will be created before implementation and refined as the system evolves.

---

# API Design

The backend exposes REST APIs for frontend communication.

Expected API areas include:

```text
Authentication / Users
Review Requests
Technologies
Reviews
Criteria
Profiles
Karma
Recommendation Feed
```

Example endpoint structure:

```text
/api/users
/api/users/:id
/api/review-requests
/api/review-requests/:id
/api/reviews
/api/reviews/:id
/api/profiles/:username
/api/feed
```

The final API contract will be documented under:

```text
/docs/api/API-Design.md
```

---

# Authentication and Authorization

Authentication is handled through **Clerk**.

The backend associates the authenticated Clerk identity with a corresponding user record in the application's database.

The authentication flow is:

```text
User
  │
  ▼
Clerk Login
  │
  ▼
Authenticated Identity
  │
  ▼
Backend
  │
  ▼
Application User Record
```

Authentication is required for:

* Creating review requests
* Submitting reviews
* Earning Karma
* Managing personal profile information

Public access is allowed for:

* Feed browsing
* Searching
* Filtering
* Viewing review requests
* Viewing public profiles

---

# Validation and Security

All important validation must be performed on the backend.

Frontend validation alone is not considered sufficient.

The backend must validate:

* Required fields
* String lengths
* GitHub repository URLs
* Technology tags
* Number of review criteria
* Criterion ratings
* Review ownership
* Request ownership
* Authentication status
* Authorization
* Duplicate or invalid submissions
* Karma transactions

Users must not be able to modify another user's:

* Profile
* Review request
* Review
* Karma

The system must also ensure that Karma cannot be awarded without a valid review.

---

# Responsive Design

The frontend must support:

* Mobile
* Tablet
* Desktop

The interface should provide a consistent and usable experience across different screen sizes.

---

# Development Setup

## Prerequisites

Before running the project locally, install the required development tools for the selected technology stack.

The following are required conceptually:

* Git
* Node.js or the required frontend runtime
* Backend runtime/SDK
* Database server
* Code editor
* Clerk account/configuration

Exact versions will be documented once the technology stack is finalized.

---

## Clone the Repository

```bash
git clone https://github.com/Chathunga02/CodeCritic.git
cd CodeCritic
```

---

## Frontend Setup

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the required environment file:

```text
.env
```

Add the required frontend environment variables.

Then start the development server:

```bash
npm run dev
```

---

## Backend Setup

Open another terminal:

```bash
cd backend
```

Follow the backend-specific dependency installation and configuration instructions.

The backend will expose the REST API for the frontend.

---

# Environment Variables

Environment variables must never be committed to GitHub.

Example frontend configuration:

```env
CLERK_PUBLISHABLE_KEY=
API_BASE_URL=
```

Example backend configuration:

```env
DATABASE_URL=
CLERK_SECRET_KEY=
```

The exact environment variables will be documented according to the selected stack.

A `.env.example` file should be committed instead of the actual `.env` file.

Example:

```text
frontend/
├── .env.example
└── .env

backend/
├── .env.example
└── .env
```

---

# Git Workflow

All team members must contribute visibly to the repository.

The recommended workflow is:

```text
main
 │
 ├── feature/frontend-...
 ├── feature/backend-...
 ├── feature/database-...
 ├── feature/recommendation-...
 └── feature/testing-...
```

Recommended process:

1. Create a feature branch.
2. Implement the assigned feature.
3. Commit changes using meaningful commit messages.
4. Push the branch.
5. Create a Pull Request.
6. Review the Pull Request.
7. Resolve requested changes.
8. Merge into the main branch.

Example:

```bash
git checkout -b feature/review-request-api

git add .

git commit -m "feat: implement review request API"

git push -u origin feature/review-request-api
```

---

# Commit Convention

The team should use clear and meaningful commit messages.

Examples:

```text
feat: add review request creation
feat: implement personalized feed
feat: add karma calculation

fix: validate review criteria
fix: prevent duplicate review submission

docs: update API documentation
docs: add database ER diagram

test: add review API tests

refactor: improve recommendation scoring
```

---

# Project Documentation

Important design documents will be maintained under the `docs` directory.

```text
docs/
│
├── database/
│   └── ER-Diagram.md
│
├── api/
│   └── API-Design.md
│
├── architecture/
│   ├── System-Architecture.md
│   └── Recommendation-Engine.md
│
└── requirements/
    └── SRS.md
```

The documentation should be updated whenever major design decisions change.

---

# Testing

Testing will be performed at multiple levels.

## Frontend Testing

Frontend testing will cover:

* UI components
* Forms
* Validation
* User interactions
* Feed behavior
* Responsive behavior

## Backend Testing

Backend testing will cover:

* REST API endpoints
* Business logic
* Authentication
* Authorization
* Validation
* Database operations
* Karma calculations
* Recommendation logic

## Integration Testing

Integration testing will verify communication between:

```text
Frontend
    ↓
Backend API
    ↓
Database
    ↓
Clerk Authentication
```

## Recommendation Engine Testing

The personalized feed must be tested with different users and technology stacks to demonstrate that the ordering changes according to user relevance.

Example:

```text
User A:
React, Java

User B:
Python, Django

Same available review requests
            ↓
Different personalized ordering
```

---

# Deployment

The final application must be deployed and accessible through a public URL.

Deployment information will be added here:

```text
Frontend URL:
TBD

Backend URL:
TBD

Database:
TBD
```

The deployed project link will be submitted as required by the final project assessment.

---

# Project Requirements

The project must satisfy the following major requirements:

* [ ] Public review request feed
* [ ] Review request search
* [ ] Review request filtering
* [ ] Review request details
* [ ] Public user profiles
* [ ] Clerk authentication
* [ ] User profile management
* [ ] Review request creation
* [ ] Technology tags
* [ ] Custom review criteria
* [ ] Peer review submission
* [ ] Criterion ratings
* [ ] Written feedback
* [ ] Optional resource links
* [ ] +2 Karma per valid review
* [ ] Review request status lifecycle
* [ ] Backend validation
* [ ] Authorization
* [ ] Responsive frontend
* [ ] Personalized recommendation feed
* [ ] Additional ranking improvement
* [ ] Demonstrable recommendation engine
* [ ] Database/ER documentation
* [ ] API documentation
* [ ] Deployment
* [ ] Visible contribution from all team members

### Optional

* [ ] Reviewer reputation insights
* [ ] Review activity analytics
* [ ] Technology-based reviewer statistics

---

# Team Contributions

All team members are expected to contribute visibly through GitHub.

Contribution evidence includes:

* Commits
* Feature branches
* Pull Requests
* Code reviews
* Documentation
* Testing
* Bug fixes
* Architecture/design contributions

Every team member should understand the complete system and be able to explain and modify any part of the project during the final walkthrough.

---

# Future Improvements

Potential future improvements include:

* Real-time notifications
* Advanced recommendation algorithms
* Reviewer reputation scoring
* Badges and achievements
* More advanced search
* AI-assisted code review
* Review quality scoring
* Developer following system
* Project bookmarking
* Email notifications
* Moderation tools
* Advanced analytics

These features are outside the current MVP unless explicitly selected by the team.

---

# Project Status

**Current Status:** Initial Repository Setup

The project is currently in the planning and setup phase.

Upcoming milestones:

```text
1. Repository Setup
2. Finalize Technology Stack
3. Database / ER Design
4. API Design
5. System Architecture
6. Frontend Setup
7. Backend Setup
8. Authentication Integration
9. Core Feature Development
10. Personalized Recommendation Engine
11. Testing
12. Deployment
13. Final Documentation
14. Final Walkthrough Preparation
```

---

# License

This project is developed as part of the Software Engineering Professionals Program.

License information will be updated according to the team's final project requirements.
