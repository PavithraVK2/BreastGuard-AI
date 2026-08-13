# Breast Cancer AI Classification - Product Requirements Document

## Original Problem Statement
Breast Cancer AI Classification using SVM (Support Vector Machine). A complete medical dashboard system with:
- Flask-based web app (adapted to React + FastAPI in our stack)
- SVM machine learning model for cancer classification
- User authentication (email/password + Google OAuth)
- 30-feature prediction input form
- Medical dashboard with statistics
- Prediction history tracking
- Medical blue theme UI

## Architecture
- **Frontend**: React 19 + React Router 7 + Tailwind CSS + shadcn/ui components
- **Backend**: FastAPI + Motor (async MongoDB) + scikit-learn (SVM)
- **Database**: MongoDB (test_database)
- **ML Model**: SVM with RBF kernel, StandardScaler, 98.25% accuracy
- **Authentication**: JWT-style session tokens + Emergent-managed Google OAuth

## User Personas
1. **Medical Doctors**: Primary users who input patient tumor measurements for AI analysis
2. **Medical Researchers**: Use the platform for research and prediction validation
3. **Healthcare Administrators**: Track prediction statistics and history

## Core Requirements (Static)
1. User authentication with both email/password and Google OAuth
2. SVM-based classification of breast cancer (Benign/Malignant)
3. 30-feature input organized in Mean, Standard Error, Worst groups
4. Prediction results with confidence scores
5. Historical tracking of all predictions
6. Model performance visibility

## What's Been Implemented (2026-02-07)
- ✅ SVM model training with sklearn breast cancer dataset (98.25% accuracy)
- ✅ Model serialization (svm_model.pkl + scaler.pkl)
- ✅ Backend API endpoints:
  - Auth: register, login, Google OAuth callback, me, logout
  - Predictions: create, list
  - Dashboard: stats
  - Model: info
- ✅ Test user seeding on startup (doctor@test.com, admin@test.com)
- ✅ Frontend pages:
  - Landing page with hero and feature cards
  - Login page with tabs (Login/Register) + Google OAuth
  - Auth callback handler for Google OAuth
  - Dashboard with 4 stat cards and recent predictions
  - Prediction form with 30 features in 3 categorized groups
  - Prediction result page with diagnosis and recommendations
  - History page with search and detailed table
  - About AI page with model details and performance metrics
- ✅ Protected routes with authentication check
- ✅ Medical blue theme (#0284C7) with Outfit and IBM Plex Sans fonts
- ✅ Security: password_hash excluded from user API responses

## Update — 2026-02-20 (Rebrand + Diagnostics Portal restyle)
- ✅ Rebranded app from "OncoVision AI" → **"OncoSVM AI"** across Navbar, Landing, Login, PredictionForm.
- ✅ New custom SVG logo (`/app/frontend/src/components/Logo.js`) — dual teal/sapphire crescent waves.
- ✅ Landing page converted to strict single-viewport (h-screen + overflow-hidden), compact hero + 3 feature cards.
- ✅ Prediction page redesigned as **"SVM Diagnostics Portal"** with subtitle "Simulate AI Support Vector Machine classification using full cell nuclei biopsy characteristics".
- ✅ Removed the Live Analysis Preview panel from the prediction sidebar (per new design reference).
- ✅ Sidebar restructured: Inference Model Engine (with nested Interactive Preset Assist warning) + Biopsy Inspection Standard dark card.

## Update — 2026-02-20 (Auth polish + emergent-brand strip)
- ✅ Slider sizes reduced globally (`h-1.5→h-1`, thumb `h-4→h-3`).
- ✅ Removed all visible "Emergent" branding from `public/index.html` (title, meta, floating badge script).
- ✅ About route now protected — unauthenticated visits redirect to /login.
- ✅ E2E verified via curl: login + predict returns `Benign` @ 99.99%.

## Update — 2026-02-20 (Logo revert + AI Analyzer)
- ✅ Reverted to Lucide `Activity` (heart-rate) icon across Navbar, Landing, Login.
- ✅ Removed the v1.2 Active badge from Navbar and Landing.
- ✅ Removed public About link from Landing (About stays protected).
- ✅ PredictionResult page rebuilt with **AI Analyzer — Reasoning** (top 5 driving features w/ benign↔malignant bars) + **Recommended Next Steps** (5 clinical actions per class) + clinical disclaimer.

## Update — 2026-02-20 (Multilingual AI chat + Feature Glossary)
- ✅ Added **OncoBot** floating chat widget on every authenticated page:
  - Text + voice input (Web Speech Recognition), voice output (Speech Synthesis).
  - 6 languages: English, Tamil, Hindi, Spanish, French, German.
  - Backend `/api/chat` powered by Gemini 3-flash via `emergentintegrations` (`EMERGENT_LLM_KEY`).
  - System prompt makes the bot aware of every app page & guides new users through a 4-step walkthrough.
  - Chat history persisted per session in `chat_messages` collection.
- ✅ New **Feature Glossary** page (`/glossary`) — Nav item between Records and SVM Mechanics. Plain-language reference for all 30 biopsy features across Mean / SE / Worst tabs with searchable cards.
- ✅ Verified: chat replies correctly in English, Tamil (தமிழ்) and Hindi (हिन्दी).

## Prioritized Backlog

### P0 (Critical - none remaining)
- All core functionality is complete

### P1 (High Priority - Future Enhancements)
- PDF export of prediction reports
- Data visualization charts (Chart.js) on dashboard
- Bulk prediction upload via CSV
- Email notifications for high-risk predictions

### P2 (Nice to Have)
- Dark mode support
- Multi-language support
- Advanced filtering in history
- Prediction comparison tool
- Doctor-to-doctor sharing of predictions

## Next Tasks
- Add data visualization charts to dashboard
- Add PDF report generation
- Add bulk prediction feature
