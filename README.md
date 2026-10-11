# SwasthyaSetu – Smart Voice-First Rural Healthcare Platform

## Purpose
A voice-first healthcare communication platform where rural patients can describe their health concerns naturally in their own language. AI helps convert and structure that information, and a doctor/healthcare professional provides the final medical guidance.
"Aapki awaaz, doctor tak. Doctor ki salah, patient tak."

## Current Phase
**Phase 0 – Foundation**
This phase establishes the foundational project structure, basic styling, routing, and the initial patient UI mockup. Advanced AI, STT, LLM integrations, complete doctor dashboard, authentication, and offline syncing are INTENTIONALLY NOT IMPLEMENTED in this phase.

## Tech Stack
* **Frontend:** React, Vite, React Router, Tailwind CSS, Lucide React
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose

## Folder Structure
```
SwasthyaSetu/
│
├── frontend/             # React application (Patient App)
│   ├── src/
│   │   ├── components/   # Reusable UI components (VoiceButton, StatusBadge, Button)
│   │   ├── layouts/      # Page wrappers (PatientLayout)
│   │   ├── pages/        # Main screens (Welcome, PatientHome)
│   │   ├── routes/       # React Router setup
│   │   └── App.jsx       # Root component
│   └── ...
│
├── backend/              # Node.js API server
│   ├── server.js         # Main entry point and API routes
│   └── .env              # Environment variables (PORT, MONGODB_URI)
│
└── README.md
```

## Installation & Setup

1. **Clone/Download the repository**
2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

## Environment Variables
Create a `.env` file in the `backend/` folder if it doesn't exist:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/swasthyasetu
NODE_ENV=development
```

## Run Commands

**Run Frontend:**
```bash
cd frontend
npm run dev
```
Runs at `http://localhost:5173`

**Run Backend:**
```bash
cd backend
npm run dev
```
Runs at `http://localhost:5000`

## Current Features
* Foundational MERN-oriented structure with separated frontend and backend.
* Mobile-first responsive UI built with Tailwind CSS.
* Simple Hindi-first language strategy.
* Custom, accessible `VoiceButton` component with animated interaction states (Idle, Listening, Processing, Completed, Error).
* Reusable `StatusBadge` and `Button` components.
* Basic routing (`/welcome`, `/patient/home`).
* Backend health check endpoint (`/api/health`) and MongoDB connection setup.

## Not Yet Implemented (Planned for Future Phases)
* Real Speech-to-Text (STT) processing
* LLM integration for structuring complaints
* Doctor dashboard and related API endpoints
* Authentication and user management
* Offline synchronization functionality
* Translation and Text-to-Speech APIs

## Phase 1

Completed:
- Patient app UI/UX
- Hindi-first patient experience
- Voice-first home screen
- Patient profile UI
- Doctor advice UI
- Health history UI
- Status UI
- Mock Listen/TTS interaction
- Responsive mobile-first design
- Route scroll-to-top
- Accessibility foundations

Not implemented yet:
- Real STT
- AI/NLP
- Backend patient APIs
- Authentication
- Doctor dashboard
- Offline sync
- Real TTS

## Phase 2

Completed:
- Voice-first patient registration UI
- Mock voice information extraction
- Structured patient information review
- Confirmation before accepting information
- Editable patient information
- Basic field validation
- Mock uncertainty handling
- Frontend profile state
- Personalized patient home greeting

Not implemented yet:
- Real STT
- Real AI/NLP
- Real MongoDB persistence
- Authentication
- OTP
- Backend patient APIs
- Doctor communication

## Phase 3

Completed:
- Voice-first health complaint UI
- Natural-language complaint mock flow
- Original patient statement display
- Structured complaint review
- Patient confirmation
- Complaint correction flow
- Mock uncertainty handling
- Mock error handling
- Optional manual text input
- PatientContext complaint state
- Health history integration
- Complaint status UI

Not implemented yet:
- Real STT
- Real AI/NLP
- Real complaint persistence
- Doctor dashboard
- Doctor communication
- Translation
- TTS
- Offline sync
- Medical diagnosis

## Phase 4

Completed:
- Real browser-based Web Speech API integration (`hi-IN`)
- Transcribed patient statement handling with interim updates
- AI-assisted structured extraction mock/abstraction (`complaintAI.js`)
- Controlled state refactoring for `VoiceButton`
- Fallback text input integrated into the processing pipeline
- Uncertainty handling via UI confirmation loops
- Extended `PatientContext` with `inputMethod` and `language`
- History timeline tracking `inputMethod` tag

Not implemented yet (Medical Safety Boundary / Phase 5+):
- Medical diagnosis engine
- Treatment/prescription generation
- Real LLM API connection (kept in isolated abstraction to avoid frontend secret exposure)
- Doctor dashboard
- Authentication
- MongoDB backend database

## Phase 5

Completed:
- Backend Express Foundation
- MongoDB connection using Mongoose (Local tested, Atlas compatible)
- REST APIs for Patients and Complaints (`/api/patients`, `/api/complaints`, `/api/patients/:id/timeline`)
- Patient Context backend integration with local fallback mechanism for resilience
- `Patient` and `Complaint` database schemas with structural validation
- Frontend API service wrapper (`api.js`)
- History component successfully fetches Timeline records dynamically
- Clean failure states preserving local edits in case of backend DB outages

## Phase 6

Completed:
- Doctor Dashboard UI with complaint summaries
- Complaint Review Interface showing original patient statement and AI structuration
- DoctorResponse MongoDB model and related REST APIs
- Full Doctor Workflow (`READY_FOR_DOCTOR` → `UNDER_REVIEW` → `RESPONDED`)
- Integration with Patient UI to surface real doctor guidance, precautions, medicines, and follow-ups dynamically
- Protection against duplicate submissions and robust loading states

## Phase 7

Completed:
- Free Browser Text-to-Speech (TTS) via `window.speechSynthesis` (No external API or cost)
- `hi-IN` Hindi audio voice targeting
- Fallback for devices without speech synthesis support
- Aggregation of doctor guidance, precautions, medicines, and follow-up text into a cohesive, uninterrupted audio speech
- Graceful speech termination and component unmount safety handling

Not implemented yet:
- Automatic translation from English to Hindi (If the doctor types English, the browser will read it as English)
- Doctor authentication and RBAC (intentionally deferred to security phase)
- Offline advanced sync logic
