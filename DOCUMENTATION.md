# ZenCode Full-Stack Documentation

**Overview**
ZenCode is a full-stack coding practice platform. The frontend is a React app (Redux for auth state) and the backend is an Express API backed by MongoDB and Redis. Users can register/login, browse problems, solve them in an IDE-style interface, run and submit code (Judge API), and see submissions.

**Frontend Entry And Routing**
- `Frontend/src/main.jsx`: App entry. Creates the React root, wraps the app in `Provider` (Redux) and `BrowserRouter`.
- `Frontend/src/App.jsx`: Top-level routing and session check. On mount it dispatches `checkAuth()` to restore the session from cookies, and guards protected routes (problemset, problem page, admin, learning path, profile).

**Frontend State**
- `Frontend/src/store/store.js`: Redux store configuration and root reducer setup.
- `Frontend/src/authSlice.js`: Auth state and async thunks.
- `registerUser(userData)`: POST `/user/register`, stores `user` on success.
- `loginUser(credentials)`: POST `/user/login`, stores `user` on success.
- `checkAuth()`: GET `/user/check`, keeps session active if cookie is valid.
- `logoutUser()`: POST `/user/logout`, clears auth state on success.

**Frontend Utilities**
- `Frontend/src/utils/axiosClient.js`: Axios instance with `baseURL` set to the backend and `withCredentials` enabled (cookies).
- `Frontend/src/api/submission.js`: Client wrapper for run/submit/history calls.
- `runCodeApi(problemId, code, language)`: POST `/submission/run/:id`.
- `submitCodeApi(problemId, code, language)`: POST `/submission/submit/:id`.
- `getSubmissionsApi(problemId)`: GET `/submission/getSubmission/:id`.
- `Frontend/src/api/gemini.js`: Raw fetch helper for Gemini.
- `generateGeminiContent({ apiKey, prompt, model, temperature, maxOutputTokens })`: Calls Gemini REST API and returns text.

**Frontend Pages**
`Frontend/src/pages/Homepage.jsx`  
Purpose: Marketing-style landing page with CTA buttons and overview sections.

`Frontend/src/pages/Loginpage.jsx`  
Purpose: User login and toast feedback.
- `pushToast(payload)`: Shows a temporary toast message.
- `onSubmit(data)`: Dispatches `loginUser`, shows success or error, redirects.
- `useEffect` (auth redirect): If already authenticated, go to `/problemset`.
- `useEffect` (toast from navigation): Reads a toast from `location.state`.
- `useEffect` (cleanup): Clears pending toast timers on unmount.

`Frontend/src/pages/Signupform.jsx`  
Purpose: User registration.
- `onSubmit(data)`: Dispatches `registerUser`, removes confirmation field.
- `useEffect` (auth redirect): If authenticated, go to `/problemset`.

`Frontend/src/pages/Problemset.jsx`  
Purpose: Lists problems with filters, tags, and sorting.
- `useEffect` (auth guard): Redirects to login if session is not valid.
- `useEffect` (fetchProblems): Loads the first page of problems from `/problem/getAllProblems`.
- `loadMore()`: Fetches next page and appends to list.
- `toggleFavorite(id)`: Local “bookmark” toggle.
- `clearFilters()`: Resets search and filters.

`Frontend/src/pages/Problempage.jsx`  
Purpose: IDE-like problem-solving page with run/submit.
- `useEffect` (fetchProblemData): Loads problem details from `/problem/problemById/:id`.
- `useEffect` (sync language): Swaps editor starter code when language changes.
- `getErrorMessage(error, fallback)`: Normalizes error output for UI.
- `handleRun()`: Calls `runCodeApi` and updates output panel.
- `handleSubmit()`: Calls `submitCodeApi` and updates output + popup.

`Frontend/src/pages/Adminpage.jsx`  
Purpose: Admin form to create problems.
- Uses `react-hook-form` with a Zod schema for deep validation.
- `onSubmit(data)`: POSTs to `/problem/create`.

`Frontend/src/pages/Profile.jsx`  
Purpose: Shows user stats, progress, and quick links.
- `useMemo` (progress): Reads learning path completion from `localStorage`.

`Frontend/src/pages/LearningPath.jsx`  
Purpose: Guided learning path with completion tracking (local storage).

`Frontend/src/pages/Leaderboard.jsx`  
Purpose: Static/stub leaderboard UI.

**Frontend Components**
`Frontend/src/components/Navbar.jsx`  
Purpose: App navigation and user actions.
- `handleLogout()`: Dispatches `logoutUser` and navigates with toast.

`Frontend/src/components/LeftPanel.jsx`  
Purpose: Problem statement, editorial, submissions history, AI tab.
- `useEffect` (fetch submissions): Calls `getSubmissionsApi` when the “Submissions” tab is active.
- Renders problem metadata and examples from `problemData`.

`Frontend/src/components/UpperRightPanel.jsx`  
Purpose: Monaco editor panel.
- `handleEditorDidMount(editor)`: Stores editor ref.
- `useEffect` (ResizeObserver): Re-layouts editor on size changes.

`Frontend/src/components/BottomRight.jsx`  
Purpose: Testcases and result view.
- `useEffect` (tab switch): Moves to “Result” tab when output arrives.

`Frontend/src/components/Timer.jsx`  
Purpose: Simple running timer for the IDE header.

`Frontend/src/components/AiPanel.jsx`  
Purpose: Gemini chat UI with saved local key.
- `buildProblemContext(problem)`: Formats problem details into a prompt.
- `buildPrompt()`: Builds the full prompt using options.
- `handleSaveKey()`: Saves Gemini key to `localStorage`.
- `handleClearKey()`: Clears Gemini key from `localStorage`.
- `handleSend()`: Calls `generateGeminiContent` and appends messages.
- `handleClearChat()`: Clears conversation history.

**Backend Entry And Configuration**
- `Backend/src/index.js`: Express app setup, JSON parsing, cookie parser, CORS, routes, and server start.
- `Backend/src/config/database.js`: Connects to MongoDB using `DB_URL`.
- `Backend/src/config/redis.js`: Creates a Redis client for session blocklist.

**Backend Middleware**
- `Backend/src/middleware/auth.middleware.js`: Validates JWT from cookies, checks Redis blocklist, loads user, and attaches `req.userId` and `req.result`.
- `Backend/src/middleware/admin.middleware.js`: Same as auth, but also enforces `role === "admin"`.

**Backend Models**
- `Backend/src/model/user.js`: User schema with profile info and `problemSolved` references.
- `Backend/src/model/problem.js`: Problem schema with tests, editorial, starter code, and reference solutions.
- `Backend/src/model/submission.js`: Submission schema with status, runtime, memory, and test counts.

**Backend Utilities**
- `Backend/src/utils/authValidator.js`: Validates registration payload (name, age, gender, password, email).
- `Backend/src/utils/problem.utils.js`:
- `getLanguageId(lang)`: Maps language name to Judge API ID.
- `submitBatch(submissions)`: Sends batch submissions to Judge API.
- `submitToken(tokens)`: Polls Judge API until all results are ready.

**Backend Controllers**
`Backend/src/controllers/UserAuth.controller.js`  
- `registerUser(req, res)`: Validates, hashes password, creates user, sets JWT cookie.
- `loginUser(req, res)`: Verifies credentials and sets JWT cookie.
- `logoutUser(req, res)`: Blocklists token in Redis and clears cookie.
- `adminRegister(req, res)`: Registers an admin user and sets cookie.
- `deleteUser(req, res)`: Deletes user and their submissions.

`Backend/src/controllers/problem.controller.js`  
- `createProblem(req, res)`: Validates reference solutions by running visible tests, then stores problem.
- `getProblemById(req, res)`: Fetches full problem details for the IDE page.
- `problemFetchAll(req, res)`: Paginates problem list for the problemset page.
- `updateProblem(req, res)`: Updates a problem; re-validates reference solutions when provided.
- `solvedProblemByUser(req, res)`: Returns user’s solved problems.
- `deleteProblem(req, res)`: Deletes a problem by id.
- `getSubmission(req, res)`: Returns submissions for a specific problem (legacy route).

`Backend/src/controllers/submission.controller.js`  
- `submitCode(req, res)`: Runs hidden tests, stores submission, and returns metrics.
- `runCode(req, res)`: Runs visible tests and returns immediate metrics.
- `getSubmission(req, res)`: Returns submissions for the current user and problem.

**Backend Routes**
- `Backend/src/routes/auth.routes.js`: `/user/*` endpoints.
- `POST /user/register`: Register user.
- `POST /user/login`: Login user.
- `POST /user/logout`: Logout (auth required).
- `GET /user/check`: Validate session (auth required).
- `POST /user/admin/register`: Admin registration (admin required).
- `DELETE /user/delete/:id`: Delete user (auth required).

- `Backend/src/routes/problem.routes.js`: `/problem/*` endpoints.
- `POST /problem/create`: Create a problem (admin required).
- `PUT /problem/update/:id`: Update a problem (admin required).
- `DELETE /problem/delete/:id`: Delete a problem (admin required).
- `GET /problem/problemById/:id`: Fetch problem details (auth required).
- `GET /problem/getAllProblems`: Paginated list (auth required).
- `GET /problem/user`: Solved problems (auth required).
- `GET /problem/submission`: Legacy submission list (auth required).

- `Backend/src/routes/submission.routes.js`: `/submission/*` endpoints.
- `POST /submission/run/:id`: Run code on visible tests (auth required).
- `POST /submission/submit/:id`: Submit code on hidden tests (auth required).
- `GET /submission/getSubmission/:id`: Submission history for a problem (auth required).

**Full Data Flow**
Auth flow:
1. User registers or logs in from the frontend.
2. Backend sets a signed JWT cookie.
3. Frontend `checkAuth()` runs on app load to restore the session.
4. Auth-required routes use cookies via `withCredentials`.

Problem browsing:
1. `Problemset` calls `/problem/getAllProblems`.
2. Backend paginates and returns titles, tags, difficulty.
3. User selects a problem and navigates to `/problem/:id`.

Solve and submit:
1. `Problempage` fetches the full problem via `/problem/problemById/:id`.
2. `runCode` sends code to Judge API using visible tests.
3. `submitCode` runs hidden tests, stores a `submission`, and returns status.
4. `LeftPanel` fetches submission history from `/submission/getSubmission/:id`.

AI assistant:
1. `AiPanel` builds a prompt including problem + code context.
2. `generateGeminiContent` calls the Gemini REST API.
3. Results are shown in a threaded chat UI.

**Environment Variables**
Backend uses:
- `DB_URL`: MongoDB connection string.
- `JWT_SECRET`: JWT signing key.
- `PORT`: Express port (defaults to 3000).
- `CLIENT_URL`: Allowed CORS origin.
- `REDIS_PASS`: Redis password.
- `RAPID_API_KEY`: Judge API key.

Frontend uses:
- `axiosClient.baseURL`: Set in `Frontend/src/utils/axiosClient.js`.

