# ZenCode Codebase Walkthrough

## What ZenCode Is Today
ZenCode is currently a full-stack DSA practice platform with these working pillars:

- Cookie-based authentication with user and admin roles.
- A problem library that authenticated users can browse.
- An IDE-style problem page with a Monaco editor, sample test runner, hidden-test submission flow, and submission history.
- A profile page that summarizes solved progress and recent accepted questions.
- An admin panel for creating new problems.
- A session-only AI helper for problem discussion and code review.

ZenCode also contains some roadmap-style UI and copy for broader ideas like mock interviews or resume tooling, but those flows are not implemented as first-class routed features in the current codebase.

## Primary Use Cases

### 1. A learner signs in and practices DSA
The learner logs in, opens the problem list, picks a question, writes code, runs sample tests, submits against hidden tests, and watches their profile stats update over time.

### 2. An admin authors new problems
The admin opens the admin panel, fills out the problem form, optionally includes reference solutions, and saves a new question after the backend validates those solutions with Judge0.

### 3. A learner reviews progress
The learner visits the profile page to see how many problems have been solved, what percentage of the catalog is done, and which questions were most recently accepted.

### 4. A learner asks the AI assistant for guidance
Inside the problem page, the learner opens the AI tab and asks for hints, approach explanations, or code review help. The conversation lasts for the current page session only.

## Repository Shape

```text
ZenCode/
|-- Backend/
|   `-- src/
|       |-- config/        # database and Redis setup
|       |-- controllers/   # route handlers and business logic
|       |-- middleware/    # auth/admin request guards
|       |-- model/         # Mongoose schemas
|       |-- routes/        # Express route registration
|       |-- utils/         # validation + Judge0 helpers
|       `-- index.js       # backend bootstrap
|-- Frontend/
|   `-- src/
|       |-- api/           # thin API helpers
|       |-- assets/        # static visuals
|       |-- components/    # shared UI pieces
|       |-- pages/         # route-level screens
|       |-- store/         # Redux store setup
|       |-- utils/         # shared client helpers
|       |-- App.jsx        # route shell
|       |-- authSlice.js   # auth state + thunks
|       |-- index.css      # global styling system
|       `-- main.jsx       # frontend bootstrap
|-- CODEBASE_WALKTHROUGH.md
`-- Readme.md
```

## End-to-End Workflows

### App Boot And Session Restore
This is the first workflow that runs for almost every real user.

1. `Frontend/src/main.jsx` mounts the app inside `BrowserRouter` and Redux `Provider`.
2. `Frontend/src/App.jsx` dispatches `checkAuth()` on mount.
3. `checkAuth()` calls `GET /user/check` through `axiosClient`.
4. `Backend/src/middleware/auth.middleware.js` reads the `token` cookie, rejects blacklisted tokens from Redis, verifies the JWT, and loads the user from MongoDB.
5. If the cookie is valid, the backend returns the user payload.
6. The Redux auth slice marks the user as authenticated.
7. Protected routes such as `/problemset`, `/problem/:id`, `/profile`, and `/admin` become accessible.

Why this matters:

- The app does not keep auth state in local storage.
- The backend cookie is the real source of truth.
- Redux is only the client-side mirror of that session.

### Registration Flow

1. The user fills `Frontend/src/pages/Signupform.jsx`.
2. `react-hook-form` and Zod validate the payload on the client.
3. The page dispatches `registerUser()` from `Frontend/src/authSlice.js`.
4. The backend route `POST /user/register` lands in `registerUser` inside `Backend/src/controllers/UserAuth.controller.js`.
5. `Backend/src/utils/authValidator.js` checks names, password strength, age, gender, and email format.
6. The password is hashed with `bcrypt`.
7. A new user document is created in MongoDB.
8. A JWT is signed and stored in an HTTP-only cookie.
9. The frontend receives the user payload and treats the user as logged in immediately.
10. The UI redirects to `/problemset`.

### Login Flow

1. The user fills `Frontend/src/pages/Loginpage.jsx`.
2. The page dispatches `loginUser()`.
3. The backend route `POST /user/login` checks the email and compares the password with `bcrypt.compare`.
4. If credentials are valid, a new JWT is issued in the cookie.
5. Redux stores the returned user data and the user is redirected to `/problemset`.

### Logout Flow

1. The user clicks logout from `Frontend/src/components/Navbar.jsx`.
2. The frontend dispatches `logoutUser()`.
3. The backend route `POST /user/logout` decodes the JWT, stores it in Redis as blocked, and sets the Redis expiry to match the token expiry.
4. The cookie is cleared.
5. Redux resets the auth state.
6. The login page shows a success toast.

Why Redis exists:

- JWTs are stateless by default.
- Redis gives the app a practical way to invalidate a token before its natural expiry.

### Browsing The Problemset

1. `Frontend/src/pages/Problemset.jsx` loads after authentication.
2. It repeatedly calls `GET /problem/getAllProblems?page=n` until `hasMore` is false.
3. It separately calls `GET /problem/user` to fetch the current user's solved set.
4. The page groups problems by tag and then by difficulty.
5. It renders collapsible topic groups with solved badges.
6. Admin users also get delete controls and a shortcut into the admin page.

Important implementation detail:

- The backend paginates in chunks of 5, but the frontend chooses to pull every page up front and build a richer grouped view client-side.

### Opening A Problem

1. The user navigates to `/problem/:id`.
2. `Frontend/src/pages/Problempage.jsx` calls `GET /problem/problemById/:id`.
3. The backend `getProblemById` controller returns problem content needed by the IDE view.
4. The page stores the returned document in `problemData`.
5. It also picks the starter code for the currently selected language and seeds the Monaco editor.
6. In parallel, the page fetches the full problem id sequence from the paginated problem list so the previous/next buttons can work.

### Run Code Workflow
Run is the lightweight "check my sample cases" loop.

1. The user clicks `Run`.
2. `Frontend/src/pages/Problempage.jsx` calls `runCodeApi(problemId, code, language)`.
3. The frontend hits `POST /submission/run/:id`.
4. `Backend/src/controllers/submission.controller.js` validates the user, problem, code, and language.
5. If the problem defines `driverCode`, the backend wraps the user's solution with the language-specific prefix/suffix boilerplate.
6. The backend sends one Judge0 submission per visible test case through `submitBatch()`.
7. `submitToken()` polls Judge0 until all results are ready or a retry limit is hit.
8. The controller aggregates runtime, memory, and first failure information.
9. The response comes back to the frontend.
10. `BottomRight` switches from the test-case tab to the result tab automatically.

Key point:

- Run mode does not create a submission record in MongoDB.
- It is meant for feedback, not history.

### Submit Code Workflow
Submit is the graded workflow that affects user progress.

1. The user clicks `Submit`.
2. `Frontend/src/pages/Problempage.jsx` calls `submitCodeApi(problemId, code, language)`.
3. The frontend hits `POST /submission/submit/:id`.
4. The backend validates the request and creates a `submission` document immediately with `status: "pending"`.
5. The backend wraps code with driver boilerplate when available.
6. The backend sends hidden test cases to Judge0.
7. Results are polled and mapped into ZenCode statuses such as:
   - `accepted`
   - `wrong_answer`
   - `time_limit_exceeded`
   - `compilation_error`
   - `runtime_error`
8. The pending submission record is updated with runtime, memory, passed test count, and error output if any.
9. If the result is `accepted`, the backend checks whether this problem is already in `user.problemSolved`.
10. If not, the problem id is pushed into that array.
11. The frontend shows a submission popup and stores the structured result in local UI state.

Why there are two places for progress:

- `submission` stores the history of attempts.
- `user.problemSolved` acts as the fast lookup list for solved progress.

### Viewing Submission History

1. On the problem page, the user opens the `Submissions` tab in `LeftPanel`.
2. `LeftPanel.jsx` lazily calls `GET /submission/getSubmission/:id`.
3. The backend returns submissions for the current user and current problem, sorted newest first.
4. The UI renders a timeline-style list with status, language, runtime, memory, and timestamp.

### Profile Stats Workflow

1. `Frontend/src/pages/Profile.jsx` calls `GET /problem/user`.
2. The backend `solvedProblemByUser` controller:
   - loads `user.problemSolved`
   - counts total problems in the catalog
   - calculates progress percentage
   - aggregates the latest accepted submissions to build the recent solved list
3. The frontend animates solved count and progress ring with GSAP.
4. The page refreshes stats every 15 seconds and also refreshes on window focus / tab visibility regain.

### Admin Problem Creation Workflow

1. An admin opens `/admin`.
2. `Frontend/src/pages/Adminpage.jsx` collects:
   - problem metadata
   - examples
   - test cases
   - starter code
   - optional driver code
   - optional editorial
   - optional reference solutions
3. The page posts the form to `POST /problem/create`.
4. `createProblem` in `Backend/src/controllers/problem.controller.js` normalizes the incoming shape.
5. If reference solutions are present, the backend runs them through Judge0 against the visible test cases before saving.
6. If validation passes, the problem is inserted into MongoDB.

Why the reference-solution validation exists:

- It protects admins from accidentally publishing a broken official answer.
- It also catches mismatched test data early.

### AI Assistant Workflow

1. On the problem page, the user opens the `AI Assistant` tab.
2. `Frontend/src/components/Chatbot.jsx` initializes a Gemini chat session.
3. The system prompt includes:
   - the "DSA only" rule set
   - Socratic teaching behavior
   - the current problem title and description
4. Each user message is also bundled with the latest editor code when available.
5. The response is shown in the chat UI using Markdown rendering.

Important current behavior:

- Chat history is not persisted in the database.
- Switching away or reloading the page starts a fresh session.

## Backend Deep Dive

### Backend Bootstrap
`Backend/src/index.js` is the server entry point.

Responsibilities:

- Load environment variables.
- Start Redis and MongoDB connections.
- Register shared middleware:
  - `express.json()`
  - `cookieParser()`
  - `cors(...)`
- Mount routers:
  - `/user`
  - `/problem`
  - `/submission`

### Middleware

#### `auth.middleware.js`
Protects normal user routes.

What it does:

1. Reads `req.cookies.token`.
2. Checks Redis to reject blacklisted tokens.
3. Verifies the JWT with `JWT_SECRET`.
4. Loads the user from Mongo.
5. Attaches:
   - `req.userId`
   - `req.result`

#### `admin.middleware.js`
Protects admin-only routes.

What it does:

1. Reads the same auth cookie.
2. Checks Redis.
3. Verifies the JWT.
4. Rejects any token where `decoded.role !== "admin"`.

### Data Models

#### User Model
File: `Backend/src/model/user.js`

Main fields:

- `firstname`
- `lastname`
- `age`
- `emailId`
- `password`
- `role`
- `gender`
- `problemSolved`

What matters most:

- `emailId` is unique and immutable.
- `problemSolved` stores problem ids for solved-progress views.

#### Problem Model
File: `Backend/src/model/problem.js`

Main fields:

- `title`
- `difficulty`
- `tags`
- `companies`
- `description`
- `examples`
- `visibleTestCase`
- `hiddenTestCase`
- `initialCode`
- `driverCode`
- `problemCreator`
- `referenceSolution`
- `editorial`

What matters most:

- `visibleTestCase` feeds Run mode.
- `hiddenTestCase` feeds Submit mode.
- `initialCode` seeds the editor.
- `driverCode` is meant to wrap user code before Judge0 execution.

#### Submission Model
File: `Backend/src/model/submission.js`

Main fields:

- `userId`
- `problemId`
- `code`
- `language`
- `status`
- `runtime`
- `memory`
- `errorMessage`
- `testCasesPassed`
- `testCasesTotal`

Indexes:

- `{ userId: 1, problemId: 1 }`
- `{ userId: 1, createdAt: -1 }`

### Backend Route Map

#### Auth Routes
File: `Backend/src/routes/auth.routes.js`

- `POST /user/register`
- `POST /user/login`
- `POST /user/logout`
- `POST /user/admin/register`
- `DELETE /user/delete/:id`
- `PATCH /user/profile`
- `POST /user/reset-password`
- `GET /user/check`

#### Problem Routes
File: `Backend/src/routes/problem.routes.js`

Admin:

- `POST /problem/create`
- `PUT /problem/update/:id`
- `DELETE /problem/delete/:id`
- `DELETE /problem/cleanup`

Authenticated user:

- `GET /problem/user`
- `GET /problem/problemById/:id`
- `GET /problem/getAllProblems`
- `GET /problem/submission/:id`

#### Submission Routes
File: `Backend/src/routes/submission.routes.js`

- `POST /submission/submit/:id`
- `POST /submission/run/:id`
- `GET /submission/getSubmission/:id`

### Judge0 Helper Layer
File: `Backend/src/utils/problem.utils.js`

This file provides:

- `getLanguageId(lang)` to translate frontend language keys into Judge0 language ids.
- `submitBatch(submissionArray)` to send many submissions at once.
- `submitToken(tokens)` to poll Judge0 until results are ready.

Notable behavior:

- It retries on rate limiting (`429`).
- It slowly increases poll delays.
- It throws if Judge0 stays busy for too long.

## Frontend Deep Dive

### Frontend Bootstrap

#### `main.jsx`
Wraps the app with:

- `Provider` from Redux
- `BrowserRouter`
- `StrictMode`

#### `App.jsx`
Acts as the route shell and session restore point.

Routes today:

- `/` -> `Homepage`
- `/login` -> `Loginpage`
- `/signup` -> `Signupform`
- `/problemset` -> `Problemset`
- `/admin` -> `Adminpage`
- `/profile` -> `Profile`
- `/problem/:id` -> `Problempage`

Protected-route strategy:

- If the session check says the user is not authenticated, protected routes redirect to `/login`.

### Global Client State

#### `authSlice.js`
Holds:

- `user`
- `isAuthenticated`
- `loading`
- `error`

Async thunks:

- `registerUser`
- `loginUser`
- `checkAuth`
- `logoutUser`
- `updateProfile`
- `resetPassword`

### Shared Client Utilities

#### `utils/axiosClient.js`
One shared Axios instance for the whole app.

Important settings:

- `baseURL` comes from `VITE_API_BASE_URL` with a localhost fallback.
- `withCredentials: true` ensures cookies are sent with every request.

#### `api/submission.js`
Thin wrappers around the submission endpoints so page code can stay UI-focused.

### Route-Level Screens

#### `Homepage.jsx`
The public landing page.

What it really does today:

- Presents the brand and practice-focused value proposition.
- Uses GSAP and motion animations.
- Links users toward signup or the problemset.

Important note:

- Some cards and links on this page describe future-looking tools that are not backed by actual routes in `App.jsx`.

#### `Loginpage.jsx`
Handles sign-in and post-logout toast messages passed through navigation state.

#### `Signupform.jsx`
Handles account creation with Zod + `react-hook-form`.

#### `Problemset.jsx`
The main catalog page for learners.

Responsibilities:

- Fetch every problem.
- Fetch solved progress.
- Group questions by tag and difficulty.
- Offer random-problem navigation.
- Expose admin delete actions when the logged-in user is an admin.

#### `Problempage.jsx`
The main IDE screen.

Core state:

- `problemData`
- `code`
- `language`
- `output`
- `isRunning`
- `submissionPopup`
- `problemSequence`

It coordinates:

- problem fetch
- previous/next navigation
- run/submit actions
- popup feedback
- child panels

#### `Profile.jsx`
The progress dashboard and account settings page.

Responsibilities:

- show solved count and total problems
- animate the progress ring
- show the latest 5 accepted solves
- edit profile info
- reset password

#### `Adminpage.jsx`
The content authoring form for admins.

It uses:

- Zod for validation
- `react-hook-form`
- multiple `useFieldArray` sections for dynamic collections

### Shared UI Components

#### `Navbar.jsx`
Reusable top nav with auth-aware actions.

#### `Loader.jsx`
Reusable lightweight loading state.

#### `Timer.jsx`
Small local timer used on the problem page.

#### `LeftPanel.jsx`
Hosts four tabs:

- Description
- Editorial
- Submissions
- AI Assistant

#### `UpperRightPanel.jsx`
Wraps Monaco Editor and language switching.

#### `BottomRight.jsx`
Shows sample test cases by default and flips to judge results after actions.

#### `Chatbot.jsx`
Creates a Gemini chat session with the current problem statement and editor contents.

## Styling System

### `Frontend/src/index.css`
This is where the global look and feel lives.

It defines:

- imported fonts
- dark theme defaults
- scrollbar styling
- animation classes
- glass-panel helpers
- grid overlay helper
- shared mono font helper

### `Frontend/src/App.css`
Minimal app-wide helpers only.

The codebase intentionally keeps most styling next to the JSX via Tailwind utility classes.

## External Services And Environment Variables

### Backend Environment Expectations

- `DB_URL` -> Mongo connection string
- `JWT_SECRET` -> JWT signing key
- `REDIS_PASS` -> Redis password
- `RAPID_API_KEY` -> Judge0 RapidAPI key
- `PORT` -> optional server port override
- Judge0 retry tuning:
  - `JUDGE0_SUBMIT_RETRIES`
  - `JUDGE0_MAX_POLL_RETRIES`
  - `JUDGE0_INITIAL_POLL_DELAY_MS`
  - `JUDGE0_POLL_INTERVAL_MS`
  - `JUDGE0_MAX_POLL_INTERVAL_MS`

### Frontend Environment Expectations

- `VITE_API_BASE_URL` -> backend base URL
- `VITE_GEMINI_API_KEY` -> Gemini API key for the assistant
- `VITE_GEMINI_MODEL` -> optional model override

## Current Gaps And Quirks Worth Knowing
These are not guesses. They come directly from the current source code.

### 1. Homepage copy is ahead of the routed product
The homepage advertises ideas like mock interviews, resume tools, and aptitude flows, but those routes are not present in `Frontend/src/App.jsx`.

### 2. Admin form collects more fields than the backend currently persists
`Frontend/src/pages/Adminpage.jsx` collects `hints`, `constraints`, and `driverCode`.

Current backend reality:

- `problem` schema does not define `hints` or `constraints`, so they are not stored.
- `createProblem` does not save `driverCode`, even though the schema supports it and the submission controller tries to use it later.

This means:

- hints and constraints entered in the admin form do not survive problem creation
- driver wrappers are not available for newly created problems unless they are added later through update flows

### 3. `getProblemById` returns `referenceSolution`
The backend sends `referenceSolution` back to authenticated clients in `getProblemById`.

Even if the current UI does not render it plainly, that data is still leaving the server.

### 4. `deleteUser` ignores the `:id` route parameter
The route is declared as `DELETE /user/delete/:id`, but the controller deletes `req.userId`, not `req.params.id`.

In practice:

- the authenticated user deletes their own account
- the path parameter is currently misleading

### 5. Profile join date usually falls back
`Profile.jsx` looks for `user.createdAt`, but the auth endpoints only return a trimmed user payload without `createdAt`.

Result:

- the profile page normally shows `Joined Recently`

### 6. AI chat history is intentionally not persisted anymore
The assistant is now page-session-only. Reloading the page or remounting the component resets the conversation.

## Suggested Reading Order For New Contributors

If you are new to the project, this order gives the fastest real understanding:

1. `Frontend/src/App.jsx`
2. `Frontend/src/authSlice.js`
3. `Backend/src/index.js`
4. `Backend/src/routes/*.js`
5. `Backend/src/controllers/submission.controller.js`
6. `Backend/src/controllers/problem.controller.js`
7. `Frontend/src/pages/Problemset.jsx`
8. `Frontend/src/pages/Problempage.jsx`
9. `Frontend/src/components/LeftPanel.jsx`
10. `Frontend/src/components/UpperRightPanel.jsx`
11. `Frontend/src/components/BottomRight.jsx`
12. `Frontend/src/components/Chatbot.jsx`

That sequence mirrors the real product journey:

- restore session
- browse problems
- open a problem
- code
- run
- submit
- review results
- ask AI for help

## Short Summary
ZenCode is already strong in one specific lane: authenticated DSA practice with a clean IDE flow, Judge0-backed execution, progress tracking, and admin-authored problem content.

If you are editing the codebase, the safest mental model is:

- backend owns truth
- Redux mirrors auth state
- the problem page is the center of gravity
- Judge0 is the external execution engine
- Gemini is a session-scoped helper, not a saved conversation system
