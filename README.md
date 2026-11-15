# GradBridge: Frontend (Milestone 1)

CSCE 4502 Design of Web-based Systems, Fall 2026
Team: Mariam El Shahawy · Maha Shakshuki · Habiba Seif

GradBridge helps undergraduate students find master's programs that fit them. A student builds a profile once.
The app then ranks programs with a transparent scoring function, explains every match, lists the gaps, and lets the
student try "what if" changes. Students can save programs and contact schools. Schools manage their own listings
and answer inquiries.

> **Mock data notice (Milestone 1):** there is no backend yet. Programs, accounts, profiles, saved programs and
> inquiries are **sample data** stored in the browser's `localStorage` through `src/services/mockApi.js`. The
> mock API adds a 500 ms delay so loading states are visible. Every page that uses this data is labelled
> "Mock data" in the footer. In Milestone 2 the mock API is replaced by the real REST API, and CV extraction and
> match explanations move to the AI service.

---

## Tech stack and versions

| Dependency | Version |
|---|---|
| Node.js | 20.19+ or 22.12+ (developed on 22) |
| React / React DOM | 19.3.1 |
| React Router (`react-router-dom`) | 7.18.5 |
| Bootstrap (CSS framework) | 5.3.9 |
| Vite (build tool) | 8.3.8 |
| oxlint (linter) | 1.93.0 |

Exact versions are locked in `package-lock.json`.

## Installation and startup

```bash
# 1. Install dependencies (uses the exact versions in package-lock.json)
npm ci            # or: npm install

# 2. Start the development server
npm run dev       # open http://localhost:5173

# 3. Production build + local preview (optional)
npm run build
npm run preview   # open http://localhost:4173

# Lint
npm run lint
```

## Deployment (GitHub Pages)

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the app and publishes it to
`https://<user>.github.io/<repo>/`. The workflow passes the repository name as `BASE_PATH`, so React Router and
asset URLs work under that sub-path. `404.html` is a copy of `index.html`, so links to inner pages (for example
`/matches`) still load when opened directly or refreshed.

If the first run fails at "Configure Pages", open **Settings → Pages**, set **Source** to **GitHub Actions**, then
re-run the workflow from the **Actions** tab.

### Demo accounts

| Role | Email | Password |
|---|---|---|
| Student (profile pre-filled) | `student@demo.edu` | `Demo1234` |
| School (Northbridge University) | `school@demo.edu` | `Demo1234` |

The login page has "Fill student demo" and "Fill school demo" buttons. You can also register a new account.

### Demo controls (footer)

- **Simulate server error**: every mock request fails, so you can show error states and the **Try again** button.
- **Reset demo data**: clears the browser data and restores the original sample data.

---

## Acceptance check walkthrough

1. **Complete navigation path:** Home → *Log in* (student demo) → **My matches** → *View details* on a program →
   *Contact the school* → fill the form → **Inquiry sent** → *View my inquiries*.
2. **Valid form submission:** the inquiry form above, or **Profile** → change GPA → *Save changes* → green
   success message.
3. **Invalid input gives useful feedback:** submit *Log in*, *Sign up*, *Profile*, *Contact school* or
   *Add program* empty or with bad values (e.g. GPA `4.6`, email `abc`, a short password, a past deadline). Each
   field shows its own message, a summary alert appears, and focus moves to the first invalid field.
4. **Responsive:** the layout works at about 375 px, 768 px and 1440 px. See `screenshots/`.
5. **Loading / empty / error / success states:** spinners on every data load; empty states on Saved, Inquiries,
   no search results and no school programs; error state with retry via *Simulate server error*; success alerts
   after saving or sending.

## Project structure

```
src/
├── main.jsx                 # Entry: BrowserRouter + AuthProvider + Bootstrap CSS
├── App.jsx                  # Route table
├── components/              # Reusable UI (see docs/COMPONENTS_AND_ROUTES.md)
├── context/AuthContext.jsx  # Logged-in user, student profile, saved programs
├── data/mockPrograms.js     # MOCK DATA: programs, schools, demo users
├── pages/                   # One component per routed view
├── services/mockApi.js      # MOCK API: async functions with delay and simulated errors
├── styles/app.css           # Theme and small overrides on top of Bootstrap
└── utils/
    ├── matching.js          # Transparent weighted scoring + gap analysis
    ├── validation.js        # Reusable form validators
    ├── format.js            # Money and date formatting
    └── useAsync.js          # Hook for { data, loading, error, reload }
docs/COMPONENTS_AND_ROUTES.md
screenshots/                 # 375 / 768 / 1440 px captures
```

## Accessibility

- Semantic landmarks (`header`, `nav`, `main`, `footer`), a "Skip to main content" link, and focus moved to
  `<main>` after each route change.
- Every input has a `<label>`. Errors are linked with `aria-describedby` and `aria-invalid`. Status messages use
  `role="alert"` or `aria-live`.
- A high-contrast orange focus outline on all interactive elements (`:focus-visible`).
- Match scores and deadlines are shown in text as well as colour ("Strong fit", "25 days left").
- Respects `prefers-reduced-motion`.

## Matching logic (summary)

Score out of 100: **Field 35 · GPA 25 · English test 15 · Location 10 · Budget 10 · Deadline 5**. Each criterion
records a reason (what fits) or a gap (what is missing). The What-if simulator reruns the same function with
changed values. Scores are guidance, not predictions of admission.

## Known limitations (planned for Milestone 2)

- No real backend, authentication or password hashing. Sessions are kept in `sessionStorage` for the demo.
- CV upload checks the file type and size, but the extraction returns fixed sample values.
- Match explanations are rule-based sentences. An LLM will write them in Milestone 2.
- Registering a new school links it to the sample school "Northbridge University" so the dashboard has data.
