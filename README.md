# TaskFlow

A frontend-only implementation of the TaskFlow take-home assignment for the Zomato engineering recruitment process. The app covers the core flows from the brief: authentication, projects, project detail, task management, filtering, protected routes, responsive UI, and dark mode. It is built against a mocked API because the assignment explicitly allows frontend candidates to work from the provided mock API spec instead of building a real backend.

## 1. Overview

TaskFlow is a small task management app where users can:

- register and log in
- view accessible projects
- create new projects
- open a project and see its tasks
- filter tasks by status and assignee
- create, edit, update, and delete tasks

This submission is intentionally frontend-only. The assignment allows frontend candidates to build against the provided mock API spec, so I used that route and focused on shipping a complete, polished UI rather than stretching into a half-finished full stack build.

### Tech stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- MSW (Mock Service Worker)
- Docker

## 2. Architecture Decisions

I kept the app fairly simple on purpose.

The biggest decision was to build this as a frontend-only submission. Since the assignment explicitly supports that path, it felt better to spend time on correctness, UX, loading/error handling, and overall polish instead of trying to squeeze in a rushed backend.

I used MSW to mock the API in the browser. That let me keep the frontend architecture close to a real app: there is still an API layer, request/response handling, auth storage, protected routes, query invalidation, and optimistic updates. The difference is that the backend responses are simulated from the browser rather than coming from a real server.

TanStack Query handles server-state concerns like fetching, caching, invalidation, and optimistic UI updates. That helped keep page components cleaner and made the task status update flow much easier to reason about.

For forms, I used React Hook Form with Zod. That combination gave me simple form state management, client-side validation, and predictable error handling without a lot of boilerplate.

For styling, I used Tailwind CSS with shadcn/ui. That helped me move quickly while still keeping the UI consistent. I also added dark mode with persisted theme state because it was a low-risk improvement that made the app feel more complete.

### Tradeoffs

A few tradeoffs were intentional:

- This is not backed by a real server or database. That is acceptable here because this is a frontend-only submission using the provided mock API path.
- Auth is mock auth, persisted in localStorage for demo purposes.
- The mock database is also stored in localStorage, so created projects/tasks persist across refreshes on the same browser.
- Delete confirmation uses the browser's built-in confirm dialog instead of a custom modal, mainly to keep the implementation small and dependable.
- Assignee data comes from mocked users instead of a real team/member service.

## 3. Running Locally

### Option A: Docker

```bash
git clone https://github.com/sksahil139/taskflow_frontend_zomato_assignmatetask.git
cd taskflow_frontend
cp .env.example .env
docker compose up --build
```

App available at http://localhost:3000

### Option B: Local development

```bash
npm install
cp .env.example .env
npm run dev
```

App available at http://localhost:5173