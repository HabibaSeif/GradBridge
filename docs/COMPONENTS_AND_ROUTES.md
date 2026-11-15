# Components and routes

## Routes (React Router v7, `src/App.jsx`)

All routes render inside `<Layout>` (navigation bar, main region, footer).

| Path | Page component | Access | Purpose |
|---|---|---|---|
| `/` | `LandingPage` | Public | Value proposition, how it works, calls to action |
| `/login` | `LoginPage` | Public | Validated login form, demo-account helpers |
| `/register` | `RegisterPage` | Public | Student or school sign-up (`?role=school` preselects school) |
| `/programs` | `ProgramsPage` | Public | Search, filter and sort; filters kept in the URL query |
| `/programs/:id` | `ProgramDetailsPage` | Public | Requirements, personal fit, save, contact |
| `/programs/:id/inquire` | `InquiryFormPage` | Student | Validated inquiry form with a success screen |
| `/profile` | `ProfilePage` | Student | Academic profile form and CV upload (mock extraction) |
| `/matches` | `MatchesPage` | Student | Ranked matches with explanation, reasons and gaps |
| `/what-if` | `WhatIfPage` | Student | Sliders that re-rank programs without saving (`?program=id` highlights one) |
| `/saved` | `SavedPage` | Student | Shortlist sorted by deadline |
| `/inquiries` | `InquiriesPage` | Student | Sent inquiries and school replies |
| `/school` | `SchoolDashboardPage` | School | Stats, listings (edit/delete), inquiries with reply form |
| `/school/programs/new` | `ProgramFormPage` | School | Add a program (validated) |
| `/school/programs/:id/edit` | `ProgramFormPage` | School | Edit an existing program |
| `*` | `NotFoundPage` | Public | 404 page |

`ProtectedRoute` sends guests to `/login` and returns them to the page they asked for after login. It sends a
user with the wrong role to their own home page.

## Reusable components (`src/components/`)

| Component | Responsibility | Key props | Reused in |
|---|---|---|---|
| `Layout` | Page shell: skip link, `NavBar`, `<main>` + `<Outlet>`, `Footer`; moves focus on route change | none | All routes |
| `NavBar` | Responsive navigation; links change by role; mobile toggle | none (reads auth context) | Layout |
| `Footer` | Mock-data notice, "Simulate server error" switch, data reset | none | Layout |
| `ProtectedRoute` | Role-based route guard | `role` | App |
| `PageHeader` | Page title, subtitle, action buttons | `title`, `subtitle`, `children` | 9 pages |
| `ProgramCard` | Program summary card with facts, optional score, actions | `program`, `match`, `wide`, `children` | Programs, Matches, Saved |
| `MatchScore` | Score ring with a text label (not colour alone) | `score`, `size` | ProgramCard, Program details |
| `FitDetails` | "Why it fits" and "Gaps to close" lists | `reasons`, `gaps`, `compact` | Matches, Program details |
| `SaveButton` | Save/unsave toggle with `aria-pressed`; sends guests to login | `program`, `size` | ProgramCard, Program details |
| `DeadlineText` | Deadline date with "N days left" or "Closed" wording | `deadline` | ProgramCard, Program details, School dashboard |
| `InquiryItem` | One inquiry; the school view adds a validated reply form | `inquiry`, `onReply?` | Inquiries, School dashboard |
| `FormFields` → `TextField`, `TextArea`, `SelectField`, `CheckboxGroup` | Accessible, controlled inputs with label, help and error | `id`, `label`, `value`, `onChange`, `error`, `help`, `required` | All forms |
| `StatusViews` → `LoadingState`, `EmptyState`, `ErrorState`, `FormAlert` | Loading, empty, error and success states | see file | All data pages |

## State and logic

| Module | Role |
|---|---|
| `context/AuthContext.jsx` | Global state: `user`, `profile`, `profileReady`, `saved` and actions `login`, `register`, `logout`, `saveProfile`, `toggleSaved` |
| `utils/useAsync.js` | Hook returning `{ data, loading, error, reload, setData }` for any mock API call |
| `services/mockApi.js` | Mock REST layer (Promise + delay + optional failure). Replaced by real API calls in Milestone 2 |
| `utils/matching.js` | `scoreProgram`, `rankPrograms`, `buildExplanation`: transparent weighted scoring |
| `utils/validation.js` | Composable validators: `required`, `email`, `password`, `numberRange`, `futureDate`, … |

## Forms and validation

| Form | Controlled fields | Validation examples |
|---|---|---|
| Login | email, password | Required; email format; server error "Email or password is incorrect" |
| Register | role, name, school name, email, password, confirm, terms | Password ≥ 8 characters with a letter and a number; passwords must match; terms must be accepted; duplicate email |
| Profile | major, GPA, IELTS, TOEFL, interests, countries, budget + CV file | GPA 0–4; IELTS 0–9; TOEFL 0–120; at least one interest; CV must be PDF/DOCX ≤ 5 MB |
| Inquiry | topic, subject, message | Required; subject 5–120 characters; message 30–1000 characters with a live counter |
| Add/Edit program | 14 fields | Deadline must be in the future; GPA range; English minimums only when the switch is on; description 40–800 characters |
| Inquiry reply | reply | At least 10 characters |

Validation runs on blur and again on submit. On a failed submit, a summary alert appears and focus moves to the
first invalid field.
