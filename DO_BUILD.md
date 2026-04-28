# MAI | DO Mode — Complete Build Guide

> **What you'll build:** A production-ready, FSM-driven journey engine that walks Indian voters through 6 real-life electoral situations with full-screen immersive steps, checklists, and a Gemini fallback helper.

> **Time estimate:** 1.5 – 2 full days
> **Difficulty:** Intermediate
> **Outcome:** Six complete voter journeys, deployed and stunning

---

## Table of Contents

1. [Overview & The DO Philosophy](#1-overview)
2. [Mental Model — Why FSM Beats Chatbot Here](#2-mental-model)
3. [Final Architecture](#3-architecture)
4. [Phase 1 — The Journey Data Model](#4-phase-1)
5. [Phase 2 — All 6 Journey Definitions](#5-phase-2)
6. [Phase 3 — The FSM Engine (Hooks)](#6-phase-3)
7. [Phase 4 — The Component Library](#7-phase-4)
8. [Phase 5 — The Full-Screen Journey Player](#8-phase-5)
9. [Phase 6 — The Journey Selector (DO Home)](#9-phase-6)
10. [Phase 7 — Checklist & Interactive Elements](#10-phase-7)
11. [Phase 8 — Gemini Fallback Helper](#11-phase-8)
12. [Phase 9 — Lightweight Persistence](#12-phase-9)
13. [Phase 10 — Polish & Animations](#13-phase-10)
14. [Phase 11 — Testing & Edge Cases](#14-phase-11)
15. [Troubleshooting Playbook](#15-troubleshooting)

---

<a id="1-overview"></a>
## 1. Overview & The DO Philosophy

### What DO mode does

DO mode is fundamentally different from ASK. In ASK, the user has a question. In DO, the user has a **task**.

Examples:
- *"I just turned 18 and want to register to vote"* → First-time voter journey
- *"My name disappeared from the voter list"* → Missing name diagnostic
- *"I moved from Chennai to Bengaluru"* → Inter-constituency transfer
- *"It's election day and I'm scared I'll mess up"* → Election day companion

A chatbot can't reliably guide someone through a multi-step bureaucratic process. They'll forget steps, miss deadlines, or get confused. DO mode solves this with **deterministic, step-by-step journeys** — like a wizard, but immersive and beautiful.

### The aesthetic direction — "App, not website"

ASK feels like reading a curated journal. DO feels like using a focused mobile app. One screen. One step. One decision at a time. No sidebars. No scrolling distractions. Just **full-screen presence**.

**Visual cues:**
- Each step takes the entire viewport
- Step counter + progress dot pattern at top
- Large editorial typography for headings
- Generous whitespace
- One primary action button at bottom (always)
- Smooth horizontal slide transitions between steps
- Subtle haptic-like feedback (visual ripple) on tap

**What we reject:**
- Cards stacked on a page
- Multiple steps visible at once
- Sidebar progress trees
- Wizard-style "Step 3 of 7" pill UI
- Generic form layouts

### Why this scores well

For judges, DO mode demonstrates:
- **Code Quality** — Data-driven FSM is architecturally sophisticated
- **Real utility** — solves actual voter problems, not just educational
- **Accessibility** — full-screen + voice + checklist supports all users
- **Google Services** — Firestore for persistence, Gemini fallback, Calendar API for deadlines
- **Testing** — FSM transitions are unit-testable

---

<a id="2-mental-model"></a>
## 2. Mental Model — Why FSM Beats Chatbot Here

**Read this before building. It's the architectural insight that separates a great submission from a generic one.**

### The problem with chatbots for processes

If you asked Gemini: *"Walk me through registering as a first-time voter"*, you'd get a wall of text. The user reads it once, gets overwhelmed, forgets steps 4–7, and bounces.

A bureaucratic process needs:
- **Order** — Step 3 must come after step 2
- **Branches** — "Are you 18 or older?" → different paths
- **Validation** — Can't continue without acknowledging the requirement
- **Resumability** — Walk away, come back, continue from step 5
- **Determinism** — Same inputs always produce the same path

Chatbots are *probabilistic*. Government processes are *deterministic*. We must match the medium to the message.

### What an FSM actually is

A Finite State Machine is just:
- A set of **states** (steps)
- A set of **transitions** (rules for moving between states)
- A current **state pointer**

In our case:
```
State A: "Are you 18+?"
   → Yes → State B: "Have address proof?"
   → No  → State Z: "Wait until you turn 18"

State B: "Have address proof?"
   → Yes → State C: "Fill Form 6 online"
   → No  → State D: "Here's the list of accepted proofs"
```

That's it. No magic. Just a JSON description of the journey.

### Why we represent journeys as data, not code

If we hardcoded each journey as React components, adding a 7th journey means writing more components. Maintenance hell.

Instead, we make journeys **pure data** (JSON). Adding a new journey = adding a new JSON file. The same engine renders all of them.

This is the same principle as:
- Markdown vs. hardcoded HTML
- JSON Schema vs. hand-written validators
- Database rows vs. one-off variables

**Data > code** for content that follows the same shape.

---

<a id="3-architecture"></a>
## 3. Final Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                       │
│                                                              │
│   /do                  Journey selector (6 cards)            │
│   /do/:journeyId       Full-screen journey player            │
│                                                              │
│   /src/journeys/                                             │
│     ├── _types.js                JS doc types & helpers      │
│     ├── firstTimeVoter.json      8 steps                     │
│     ├── missingName.json         9 steps with branches       │
│     ├── movedCities.json         7 steps                     │
│     ├── migrantWorker.json       6 steps                     │
│     ├── electionDay.json         10 steps                    │
│     └── seniorPwd.json           7 steps                     │
│                                                              │
│   /src/components/do/                                        │
│     ├── JourneySelector.jsx                                  │
│     ├── JourneyPlayer.jsx                                    │
│     ├── StepRenderer.jsx                                     │
│     ├── steps/                                               │
│     │   ├── InfoStep.jsx                                     │
│     │   ├── ChoiceStep.jsx                                   │
│     │   ├── ChecklistStep.jsx                                │
│     │   ├── ActionStep.jsx                                   │
│     │   └── CompletionStep.jsx                               │
│     ├── ProgressDots.jsx                                     │
│     ├── StepHelper.jsx           (Gemini fallback)           │
│     └── do.css                                               │
│                                                              │
│   /src/hooks/                                                │
│     ├── useJourney.js            FSM engine                  │
│     └── useJourneyProgress.js    LocalStorage persistence    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼ (uses existing ASK Cloud Function)
┌─────────────────────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTIONS                        │
│   askGeminiStream    (already built in ASK mode)             │
│   Used as fallback when user taps "Explain this step"        │
└─────────────────────────────────────────────────────────────┘
```

**Key insight:** DO mode reuses 100% of ASK's Cloud Function infrastructure. No new backend code. The Gemini helper is the same RAG endpoint, just invoked from a different UI.

---

<a id="4-phase-1"></a>
## 4. Phase 1 — The Journey Data Model

This is the foundation. Every journey will follow this shape.

### 4.1 The schema

Create `src/journeys/_types.js`:

```javascript
/**
 * @typedef {Object} Journey
 * @property {string} id              - URL-safe identifier (e.g. "first-time-voter")
 * @property {string} title           - Display title
 * @property {string} subtitle        - One-line description
 * @property {string} icon            - Lucide icon name
 * @property {string} accent          - Color hex for journey theming
 * @property {string} estimatedTime   - "5 min", "10 min" etc.
 * @property {string} startStepId     - First step to load
 * @property {Object<string, Step>} steps  - All steps keyed by id
 */

/**
 * @typedef {Object} Step
 * @property {string} id              - Unique step id within journey
 * @property {"info"|"choice"|"checklist"|"action"|"completion"} type
 * @property {string} title           - Step title (large editorial)
 * @property {string} [body]          - Optional markdown body
 * @property {string} [eyebrow]       - Small label above title
 *
 * // For "info" type
 * @property {string} [nextStepId]    - Auto-next step
 *
 * // For "choice" type
 * @property {Choice[]} [choices]     - Array of branching options
 *
 * // For "checklist" type
 * @property {ChecklistItem[]} [items]
 * @property {string} [continueStepId]
 *
 * // For "action" type
 * @property {Action} [action]        - External action (link, calendar)
 * @property {string} [continueStepId]
 *
 * // For "completion" type
 * @property {string} [summary]       - Final message
 * @property {NextAction[]} [nextActions]
 */

/**
 * @typedef {Object} Choice
 * @property {string} label
 * @property {string} sublabel
 * @property {string} nextStepId
 */

/**
 * @typedef {Object} ChecklistItem
 * @property {string} id
 * @property {string} label
 * @property {string} [hint]
 * @property {boolean} [required]
 */

/**
 * @typedef {Object} Action
 * @property {"link"|"calendar"|"phone"|"copy"} type
 * @property {string} label
 * @property {string} [url]
 * @property {string} [phone]
 * @property {Object} [calendar]  - { title, date, description }
 */

/**
 * @typedef {Object} NextAction
 * @property {string} label
 * @property {"journey"|"link"|"close"} type
 * @property {string} [target]
 */

export {}; // empty export to make it a module
```

These JSDoc types give you autocomplete in VS Code without TypeScript.

### 4.2 The 5 step types — what each one does

Every step in MAI's DO mode is one of these:

| Type | Purpose | Example |
|---|---|---|
| `info` | Pure information / instruction | *"You'll need 3 documents to file Form 6"* |
| `choice` | Branching decision | *"Are you registering for the first time, or have you moved?"* |
| `checklist` | Verify user has prerequisites | *"Tick what you have: Aadhaar, photo, address proof"* |
| `action` | External action — link, calendar add, call | *"Open the voter portal"* with link |
| `completion` | Journey end with summary + next actions | *"You're done! Add reminder to calendar"* |

Five types is enough to model **any voter journey**. We deliberately resist adding more — every new step type is engineering cost.

---

<a id="5-phase-2"></a>
## 5. Phase 2 — All 6 Journey Definitions

These are the heart of DO mode. Each is a JSON file in `src/journeys/`.

### 5.1 Journey 1 — First-Time Voter

`src/journeys/firstTimeVoter.json`:

```json
{
  "id": "first-time-voter",
  "title": "Register as a first-time voter",
  "subtitle": "If you just turned 18 (or about to)",
  "icon": "UserPlus",
  "accent": "#FF6B35",
  "estimatedTime": "8 min",
  "startStepId": "intro",
  "steps": {
    "intro": {
      "id": "intro",
      "type": "info",
      "eyebrow": "Step 1 — Welcome",
      "title": "Becoming a voter is your right.",
      "body": "We'll walk you through how to register, what you need, and what to expect. Takes about 8 minutes.",
      "nextStepId": "ageCheck"
    },
    "ageCheck": {
      "id": "ageCheck",
      "type": "choice",
      "eyebrow": "Step 2 — Eligibility",
      "title": "Have you turned 18?",
      "body": "You can register to vote on any of four qualifying dates: January 1, April 1, July 1, or October 1 of the year.",
      "choices": [
        {
          "label": "Yes, I've turned 18",
          "sublabel": "Or will turn 18 by the next qualifying date",
          "nextStepId": "documents"
        },
        {
          "label": "Not yet",
          "sublabel": "I'm under 17",
          "nextStepId": "tooYoung"
        }
      ]
    },
    "tooYoung": {
      "id": "tooYoung",
      "type": "info",
      "eyebrow": "Hold on a moment",
      "title": "You'll be eligible soon.",
      "body": "Bookmark this journey. Once you turn 17, you can pre-register so your name appears in the roll the moment you turn 18.\n\nIndia introduced 4 qualifying dates per year specifically so young voters don't lose any time.",
      "nextStepId": "documents"
    },
    "documents": {
      "id": "documents",
      "type": "checklist",
      "eyebrow": "Step 3 — Gather your documents",
      "title": "You'll need three things.",
      "body": "Don't worry if you don't have them all right now — most are easy to arrange.",
      "items": [
        {
          "id": "age-proof",
          "label": "Age proof",
          "hint": "Aadhaar, Birth Certificate, 10th certificate, Passport, or PAN",
          "required": true
        },
        {
          "id": "address-proof",
          "label": "Address proof",
          "hint": "Aadhaar, recent utility bill (last 3 months), bank passbook, or rent agreement",
          "required": true
        },
        {
          "id": "photo",
          "label": "Recent passport-size photograph",
          "hint": "One color photo with white background",
          "required": true
        }
      ],
      "continueStepId": "applyOnline"
    },
    "applyOnline": {
      "id": "applyOnline",
      "type": "action",
      "eyebrow": "Step 4 — Submit Form 6",
      "title": "Apply online — it's free.",
      "body": "Form 6 is the official application for new voters. The portal is the fastest way. You can also visit your nearest BLO if you prefer offline.",
      "action": {
        "type": "link",
        "label": "Open voters.eci.gov.in",
        "url": "https://voters.eci.gov.in"
      },
      "continueStepId": "afterSubmit"
    },
    "afterSubmit": {
      "id": "afterSubmit",
      "type": "info",
      "eyebrow": "Step 5 — What happens next",
      "title": "Your application begins a verification.",
      "body": "**A Booth Level Officer (BLO) will visit your home** to verify your address. This usually happens within 2–4 weeks.\n\nKeep your documents ready. The BLO will confirm your details and approve your inclusion in the electoral roll.",
      "nextStepId": "trackStatus"
    },
    "trackStatus": {
      "id": "trackStatus",
      "type": "action",
      "eyebrow": "Step 6 — Track your status",
      "title": "You can check your application anytime.",
      "body": "Use your reference number on the same portal to see if your form is verified, accepted, or needs corrections.",
      "action": {
        "type": "link",
        "label": "Track on voters.eci.gov.in",
        "url": "https://voters.eci.gov.in/Account/LoginActivity.aspx"
      },
      "continueStepId": "complete"
    },
    "complete": {
      "id": "complete",
      "type": "completion",
      "title": "You're on your way to becoming a voter.",
      "summary": "Once approved, you'll receive your EPIC (Voter ID card). You can then check your name at electoralsearch.eci.gov.in and find your polling booth.",
      "nextActions": [
        {
          "label": "Find my polling booth",
          "type": "journey",
          "target": "election-day"
        },
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    }
  }
}
```

### 5.2 Journey 2 — Missing Name from Voter List

`src/journeys/missingName.json`:

```json
{
  "id": "missing-name",
  "title": "My name is missing from the voter list",
  "subtitle": "Diagnose what happened and fix it",
  "icon": "SearchX",
  "accent": "#F59E0B",
  "estimatedTime": "10 min",
  "startStepId": "intro",
  "steps": {
    "intro": {
      "id": "intro",
      "type": "info",
      "eyebrow": "Don't panic",
      "title": "This is more common than you think.",
      "body": "Names go missing for many reasons — and most are fixable. Let's figure out what happened to yours and what to do.",
      "nextStepId": "verify"
    },
    "verify": {
      "id": "verify",
      "type": "action",
      "eyebrow": "Step 1 — Verify it's actually missing",
      "title": "Try every search method first.",
      "body": "Sometimes the name is there but searched wrong — wrong spelling, wrong constituency, or your EPIC works but not your name.",
      "action": {
        "type": "link",
        "label": "Open Electoral Search",
        "url": "https://electoralsearch.eci.gov.in"
      },
      "continueStepId": "verifyResult"
    },
    "verifyResult": {
      "id": "verifyResult",
      "type": "choice",
      "eyebrow": "Step 2 — What did you find?",
      "title": "After searching, what's the situation?",
      "choices": [
        {
          "label": "I found my name (problem solved)",
          "sublabel": "It just took some digging",
          "nextStepId": "foundIt"
        },
        {
          "label": "Definitely not there",
          "sublabel": "I tried EPIC, name, and address",
          "nextStepId": "diagnose"
        }
      ]
    },
    "foundIt": {
      "id": "foundIt",
      "type": "completion",
      "title": "Great — you're registered.",
      "summary": "Save your booth details and EPIC number. We recommend setting an election day reminder so you don't forget on the day.",
      "nextActions": [
        {
          "label": "Set election day reminder",
          "type": "journey",
          "target": "election-day"
        },
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    },
    "diagnose": {
      "id": "diagnose",
      "type": "choice",
      "eyebrow": "Step 3 — Why might it be missing?",
      "title": "Pick what most likely applies to you.",
      "choices": [
        {
          "label": "I never registered",
          "sublabel": "Or I'm not sure if I did",
          "nextStepId": "neverRegistered"
        },
        {
          "label": "I moved recently",
          "sublabel": "Different city or constituency",
          "nextStepId": "moved"
        },
        {
          "label": "I was registered before but it's gone",
          "sublabel": "Possibly removed in Summary Revision",
          "nextStepId": "deleted"
        }
      ]
    },
    "neverRegistered": {
      "id": "neverRegistered",
      "type": "info",
      "eyebrow": "Path A — Fresh registration",
      "title": "You'll need to file Form 6.",
      "body": "Form 6 is for new voters. It's the same form first-time voters use. Takes about 8 minutes to complete online.",
      "nextStepId": "form6Action"
    },
    "moved": {
      "id": "moved",
      "type": "info",
      "eyebrow": "Path B — Transfer needed",
      "title": "You need to register in your new constituency.",
      "body": "If you moved to a different assembly constituency, you must file Form 6 at your new address. Your old registration will be deleted automatically once the new one is approved.\n\nIf you only moved within the same constituency, file Form 8 instead (correction).",
      "nextStepId": "form6Action"
    },
    "deleted": {
      "id": "deleted",
      "type": "info",
      "eyebrow": "Path C — Possible deletion",
      "title": "Your name was likely removed during a roll revision.",
      "body": "This happens during Special Summary Revision drives if a BLO couldn't verify your address. The fix is to file Form 6 again with current address proof.\n\nAlso talk to your **BLO directly** — they can investigate why you were marked for deletion.",
      "nextStepId": "form6Action"
    },
    "form6Action": {
      "id": "form6Action",
      "type": "action",
      "eyebrow": "Take action",
      "title": "File Form 6 now.",
      "body": "Make sure you have:\n- Aadhaar or other age proof\n- Recent address proof\n- Passport-size photograph",
      "action": {
        "type": "link",
        "label": "Apply on voters.eci.gov.in",
        "url": "https://voters.eci.gov.in/Account/RegistrationOnline.aspx"
      },
      "continueStepId": "afterAction"
    },
    "afterAction": {
      "id": "afterAction",
      "type": "completion",
      "title": "Submitted. Now follow up.",
      "summary": "Track your application status weekly. Contact your BLO via the Voter Helpline app if you don't see progress in 2 weeks. Election deadlines are strict — typically 30 days before polling day.",
      "nextActions": [
        {
          "label": "Call Voter Helpline 1950",
          "type": "link",
          "target": "tel:1950"
        },
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    }
  }
}
```

### 5.3 Journey 3 — Moved Cities

`src/journeys/movedCities.json`:

```json
{
  "id": "moved-cities",
  "title": "I moved to a new city",
  "subtitle": "Update your voter registration",
  "icon": "MapPin",
  "accent": "#2540D4",
  "estimatedTime": "7 min",
  "startStepId": "intro",
  "steps": {
    "intro": {
      "id": "intro",
      "type": "info",
      "eyebrow": "Welcome",
      "title": "Let's update your voter registration.",
      "body": "Whether you moved across the road or across the country, the right form depends on how far. We'll figure out which one.",
      "nextStepId": "scope"
    },
    "scope": {
      "id": "scope",
      "type": "choice",
      "eyebrow": "Step 1 — How far did you move?",
      "title": "Same constituency or different?",
      "body": "Not sure? Pick 'Different' if you moved to another district, city, or state.",
      "choices": [
        {
          "label": "Same assembly constituency",
          "sublabel": "Just changed locality / address within same area",
          "nextStepId": "form8"
        },
        {
          "label": "Different constituency",
          "sublabel": "Different city, district, or state",
          "nextStepId": "form6Path"
        },
        {
          "label": "I'm a student living in a different city",
          "sublabel": "Hostel/PG away from home",
          "nextStepId": "student"
        }
      ]
    },
    "form8": {
      "id": "form8",
      "type": "info",
      "eyebrow": "Form 8 — Address correction",
      "title": "File Form 8 to update your address.",
      "body": "Form 8 handles corrections within the same constituency, including address changes, name spelling fixes, and replacing a damaged EPIC card.\n\nYour EPIC number stays the same — only the address gets updated.",
      "nextStepId": "form8Action"
    },
    "form8Action": {
      "id": "form8Action",
      "type": "action",
      "eyebrow": "Action",
      "title": "Submit Form 8 online.",
      "action": {
        "type": "link",
        "label": "Open Form 8",
        "url": "https://voters.eci.gov.in/Account/FormStatus.aspx"
      },
      "continueStepId": "complete"
    },
    "form6Path": {
      "id": "form6Path",
      "type": "info",
      "eyebrow": "Form 6 — Fresh registration",
      "title": "Register in your new constituency.",
      "body": "When you move to a different assembly constituency, you file a fresh Form 6 at your new address. Your old registration gets deleted automatically once approved.\n\n**You cannot vote in both places.** It's one or the other.",
      "nextStepId": "addressProof"
    },
    "student": {
      "id": "student",
      "type": "info",
      "eyebrow": "For students",
      "title": "You can register at your hostel or your home — pick one.",
      "body": "Many students keep their registration at home and travel to vote. Others register where they study because they're there year-round.\n\nThere's no wrong answer — just pick where you actually want to vote. You cannot be on both rolls.",
      "nextStepId": "form6Path"
    },
    "addressProof": {
      "id": "addressProof",
      "type": "checklist",
      "eyebrow": "Step 2 — Address proof options",
      "title": "Confirm what you have for your new address.",
      "body": "Any one of these works as proof of new address:",
      "items": [
        { "id": "aadhaar", "label": "Aadhaar with new address" },
        { "id": "utility", "label": "Recent utility bill (last 3 months)" },
        { "id": "bank", "label": "Bank or post office passbook with photo" },
        { "id": "rent", "label": "Rent agreement" },
        { "id": "employer", "label": "Letter from employer (for company housing)" }
      ],
      "continueStepId": "form6Action"
    },
    "form6Action": {
      "id": "form6Action",
      "type": "action",
      "eyebrow": "Action",
      "title": "Submit Form 6 in your new constituency.",
      "action": {
        "type": "link",
        "label": "Open voters.eci.gov.in",
        "url": "https://voters.eci.gov.in/Account/RegistrationOnline.aspx"
      },
      "continueStepId": "complete"
    },
    "complete": {
      "id": "complete",
      "type": "completion",
      "title": "Your move is registered.",
      "summary": "It typically takes 2–4 weeks for verification by your new BLO. Track status weekly. Once approved, your e-EPIC will reflect the new address.",
      "nextActions": [
        {
          "label": "Find my new polling booth",
          "type": "journey",
          "target": "election-day"
        },
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    }
  }
}
```

### 5.4 Journey 4 — Migrant Worker

`src/journeys/migrantWorker.json`:

```json
{
  "id": "migrant-worker",
  "title": "I work in a different state from where I'm registered",
  "subtitle": "Understanding your voting rights as a migrant",
  "icon": "Briefcase",
  "accent": "#15803D",
  "estimatedTime": "6 min",
  "startStepId": "intro",
  "steps": {
    "intro": {
      "id": "intro",
      "type": "info",
      "eyebrow": "For India's 450 million migrant workers",
      "title": "You have voting rights. Let's understand them.",
      "body": "Right now, India doesn't yet have a remote voting system that works for migrants. But you do have options. Let's walk through them.",
      "nextStepId": "options"
    },
    "options": {
      "id": "options",
      "type": "choice",
      "eyebrow": "Step 1 — What works for you?",
      "title": "Which option fits your situation?",
      "choices": [
        {
          "label": "I want to keep voting in my home village/town",
          "sublabel": "I'll travel back when there's an election",
          "nextStepId": "stayHome"
        },
        {
          "label": "I want to register where I work now",
          "sublabel": "I've been here a while and don't plan to return",
          "nextStepId": "registerHere"
        },
        {
          "label": "I'm not sure — show me both",
          "sublabel": "Help me decide",
          "nextStepId": "compare"
        }
      ]
    },
    "compare": {
      "id": "compare",
      "type": "info",
      "eyebrow": "Step 2 — Compare options",
      "title": "Both have trade-offs.",
      "body": "**Voting at home:**\n- Keep your existing registration\n- Need to physically travel for elections\n- Better if you eventually plan to return\n\n**Registering here:**\n- File a fresh Form 6 at current address\n- Old registration auto-deleted\n- Better if you're settled\n\nThere's no remote postal ballot for migrants currently.\nThe ECI is piloting Remote Voting Machines (RVMs) but they're not deployed yet.",
      "nextStepId": "options"
    },
    "stayHome": {
      "id": "stayHome",
      "type": "info",
      "eyebrow": "Path A — Home voting",
      "title": "You're already registered. Plan ahead.",
      "body": "Track your home constituency's election schedule. Many states announce 5–8 weeks ahead. Plan travel and request leave from your employer.\n\nThough employers aren't legally obligated to give paid leave for travel, many will accommodate notice given in advance.",
      "nextStepId": "calendar"
    },
    "registerHere": {
      "id": "registerHere",
      "type": "info",
      "eyebrow": "Path B — Register at current address",
      "title": "You'll file Form 6 at your current address.",
      "body": "Address proof options for migrants:\n- Aadhaar with current address\n- Rent agreement (formal or informal)\n- Letter from employer (especially if in company housing)\n- Bank passbook with current address\n- Utility bill in your name\n\nIf you can't get any of these, talk to your local BLO — they can sometimes help with field verification.",
      "nextStepId": "registerAction"
    },
    "registerAction": {
      "id": "registerAction",
      "type": "action",
      "eyebrow": "Action",
      "title": "File Form 6 here.",
      "action": {
        "type": "link",
        "label": "Open voters.eci.gov.in",
        "url": "https://voters.eci.gov.in"
      },
      "continueStepId": "complete"
    },
    "calendar": {
      "id": "calendar",
      "type": "action",
      "eyebrow": "Step 3 — Plan ahead",
      "title": "Add an election watch reminder.",
      "body": "Bookmark this and set a recurring reminder to check your home constituency's election schedule every 6 months.",
      "action": {
        "type": "calendar",
        "label": "Add 6-month reminder to calendar",
        "calendar": {
          "title": "Check home election schedule (MAI reminder)",
          "description": "Visit eci.gov.in to check upcoming elections in your home constituency"
        }
      },
      "continueStepId": "complete"
    },
    "complete": {
      "id": "complete",
      "type": "completion",
      "title": "You're set up to vote.",
      "summary": "Migrant voter rights are improving. Watch the news for Remote Voting Machine pilots from ECI — when launched, they'll let you vote without travel.",
      "nextActions": [
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    }
  }
}
```

### 5.5 Journey 5 — Election Day Companion

`src/journeys/electionDay.json`:

```json
{
  "id": "election-day",
  "title": "It's election day — guide me through it",
  "subtitle": "Step-by-step walkthrough of voting day",
  "icon": "Vote",
  "accent": "#FF6B35",
  "estimatedTime": "10 min",
  "startStepId": "intro",
  "steps": {
    "intro": {
      "id": "intro",
      "type": "info",
      "eyebrow": "Welcome",
      "title": "Let's make sure today goes smoothly.",
      "body": "We'll cover what to carry, what to expect at the booth, how the EVM works, and what to do if something goes wrong. About 10 minutes.",
      "nextStepId": "checkName"
    },
    "checkName": {
      "id": "checkName",
      "type": "action",
      "eyebrow": "Step 1 — Confirm your name",
      "title": "Quick check — is your name on the roll?",
      "body": "Even if you've voted before, do this 5-second check now. Better to know in advance than at the booth.",
      "action": {
        "type": "link",
        "label": "Check on Electoral Search",
        "url": "https://electoralsearch.eci.gov.in"
      },
      "continueStepId": "checkBooth"
    },
    "checkBooth": {
      "id": "checkBooth",
      "type": "info",
      "eyebrow": "Step 2 — Find your exact booth",
      "title": "You can only vote at one specific booth.",
      "body": "Your polling station is shown on the same Electoral Search page. Note the **booth name and address** — Google Maps it now.\n\nIf you're at the wrong booth, you cannot vote. They will not redirect you.",
      "nextStepId": "documents"
    },
    "documents": {
      "id": "documents",
      "type": "checklist",
      "eyebrow": "Step 3 — What to carry",
      "title": "Tick what you have.",
      "body": "You need only ONE of these — EPIC is preferred but any work:",
      "items": [
        { "id": "epic", "label": "EPIC (Voter ID card)" },
        { "id": "aadhaar", "label": "Aadhaar Card" },
        { "id": "passport", "label": "Indian Passport" },
        { "id": "dl", "label": "Driving Licence" },
        { "id": "pan", "label": "PAN Card" },
        { "id": "bank", "label": "Bank/Post Office passbook with photo" },
        { "id": "pension", "label": "Pension Document with photo" },
        { "id": "mgnrega", "label": "MNREGS Job Card" }
      ],
      "continueStepId": "leaveBehind"
    },
    "leaveBehind": {
      "id": "leaveBehind",
      "type": "info",
      "eyebrow": "Step 4 — Leave at home",
      "title": "Don't bring these into the booth.",
      "body": "**Mobile phones are not allowed inside the polling booth.** You'll need to switch off and submit it at the entrance, or leave it home.\n\nAlso leave behind: campaign material, anything with party symbols, and any food/drink.",
      "nextStepId": "atBooth"
    },
    "atBooth": {
      "id": "atBooth",
      "type": "info",
      "eyebrow": "Step 5 — At the booth",
      "title": "Here's exactly what happens.",
      "body": "**1.** Stand in queue. Senior citizens and PwD voters get priority — wave them ahead.\n\n**2.** First polling officer checks your name on the roll and your photo ID.\n\n**3.** Second officer marks indelible ink on your **left index finger**.\n\n**4.** Third officer hands you a slip and points you to the EVM compartment.\n\n**5.** You vote. We'll cover that next.",
      "nextStepId": "evmStep"
    },
    "evmStep": {
      "id": "evmStep",
      "type": "info",
      "eyebrow": "Step 6 — Using the EVM",
      "title": "The EVM is just two buttons.",
      "body": "**1.** Find your candidate's name and symbol on the Ballot Unit.\n\n**2.** Press the blue button next to them. **One press, one vote.**\n\n**3.** A red light glows next to your choice. A beep confirms.\n\n**4.** Look at the VVPAT machine on the side — a paper slip prints showing your candidate's name and symbol. It's visible for 7 seconds.\n\n**5.** That slip drops automatically into a sealed box. You don't take it.\n\nYou cannot vote again. The machine locks for you.",
      "nextStepId": "vvpatTip"
    },
    "vvpatTip": {
      "id": "vvpatTip",
      "type": "info",
      "eyebrow": "Step 7 — Pro tip",
      "title": "Verify your VVPAT slip carefully.",
      "body": "The 7-second VVPAT window is your only verification that the machine recorded your vote correctly.\n\nIf the printed slip doesn't match the candidate you chose, **call the Presiding Officer immediately**. They can take action including challenging the EVM.",
      "nextStepId": "problem"
    },
    "problem": {
      "id": "problem",
      "type": "choice",
      "eyebrow": "Step 8 — If something goes wrong",
      "title": "What if there's an issue?",
      "choices": [
        {
          "label": "My name's not on the roll",
          "sublabel": "I checked and was told it's not there",
          "nextStepId": "nameMissing"
        },
        {
          "label": "Nothing's wrong — I'm ready",
          "sublabel": "Continue",
          "nextStepId": "complete"
        }
      ]
    },
    "nameMissing": {
      "id": "nameMissing",
      "type": "info",
      "eyebrow": "Emergency steps",
      "title": "If your name's missing on election day:",
      "body": "**1.** Ask the polling officer to search alternate spellings of your name.\n\n**2.** Ask to see the marked copy of the electoral roll yourself.\n\n**3.** Request to file a **Tendered Vote** — you can vote, but it's kept separate.\n\n**4.** File a written complaint with the Sector Officer or Returning Officer that day.\n\n**5.** Call **1950** while at the booth.\n\nThe deadline to add your name has passed if it's election day. But you may still be able to vote via tendered vote in some circumstances.",
      "nextStepId": "complete"
    },
    "complete": {
      "id": "complete",
      "type": "completion",
      "title": "You're ready. Go vote.",
      "summary": "Your finger gets inked. Your VVPAT slip drops. Democracy advances by exactly one vote — yours.\n\nThank you for showing up today.",
      "nextActions": [
        {
          "label": "Call Voter Helpline 1950",
          "type": "link",
          "target": "tel:1950"
        },
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    }
  }
}
```

### 5.6 Journey 6 — Senior Citizen / PwD

`src/journeys/seniorPwd.json`:

```json
{
  "id": "senior-pwd",
  "title": "I'm a senior citizen or have a disability",
  "subtitle": "Special facilities and home voting options",
  "icon": "HeartHandshake",
  "accent": "#7C3AED",
  "estimatedTime": "7 min",
  "startStepId": "intro",
  "steps": {
    "intro": {
      "id": "intro",
      "type": "info",
      "eyebrow": "We've got you",
      "title": "ECI provides several facilities for you.",
      "body": "Whether you'd prefer to vote at home, at the booth with assistance, or anywhere in between — there's a process for it.",
      "nextStepId": "category"
    },
    "category": {
      "id": "category",
      "type": "choice",
      "eyebrow": "Step 1 — Which applies to you?",
      "title": "Pick the category that fits.",
      "choices": [
        {
          "label": "Senior citizen, 85 years or older",
          "sublabel": "Eligible for home voting",
          "nextStepId": "homeVote"
        },
        {
          "label": "Person with 40%+ disability",
          "sublabel": "Eligible for home voting & priority access",
          "nextStepId": "homeVote"
        },
        {
          "label": "Senior under 85, or PwD with under 40%",
          "sublabel": "Booth voting with priority access",
          "nextStepId": "boothPriority"
        }
      ]
    },
    "homeVote": {
      "id": "homeVote",
      "type": "info",
      "eyebrow": "Home Voting (Doorstep Ballot)",
      "title": "A polling team will come to you.",
      "body": "On a designated day before the main election, a polling team visits eligible voters' homes with a ballot. You vote in privacy. The sealed ballot is collected and counted on counting day.\n\nThe key is to **apply early** — usually within the first few days after election notification.",
      "nextStepId": "applyHomeVote"
    },
    "applyHomeVote": {
      "id": "applyHomeVote",
      "type": "action",
      "eyebrow": "Step 2 — Apply for home voting",
      "title": "File Form 12D with your ERO.",
      "body": "Download Form 12D from the ECI portal. Submit it to your Electoral Registration Officer (ERO) within the deadline. PwD applicants attach their disability certificate.",
      "action": {
        "type": "link",
        "label": "Find your ERO contact",
        "url": "https://voters.eci.gov.in"
      },
      "continueStepId": "saksham"
    },
    "boothPriority": {
      "id": "boothPriority",
      "type": "info",
      "eyebrow": "Booth voting with priority",
      "title": "You don't have to stand in line.",
      "body": "All polling booths must:\n- Have **wheelchair access ramps**\n- Allow **priority entry** for senior and PwD voters (skip the queue)\n- Permit a **companion** (18+) inside the voting compartment\n- Provide **Braille** ballot for visually impaired voters\n\nYou can also request transport via the Saksham app.",
      "nextStepId": "saksham"
    },
    "saksham": {
      "id": "saksham",
      "type": "action",
      "eyebrow": "Step 3 — Saksham App",
      "title": "Get personalized assistance.",
      "body": "ECI's **Saksham app** is built for senior and PwD voters. Use it to:\n- Request transport to your booth\n- Request a wheelchair on-site\n- Apply for home voting\n- Find the most accessible booth near you",
      "action": {
        "type": "link",
        "label": "Search 'Saksham ECI' on Play Store",
        "url": "https://play.google.com/store/search?q=saksham%20eci"
      },
      "continueStepId": "complete"
    },
    "complete": {
      "id": "complete",
      "type": "completion",
      "title": "Your vote, your way.",
      "summary": "Whether at home or at the booth, you're entitled to a smooth voting experience. Don't hesitate to ask the Presiding Officer for assistance — it's their job.",
      "nextActions": [
        {
          "label": "Election day walkthrough",
          "type": "journey",
          "target": "election-day"
        },
        {
          "label": "Back to all journeys",
          "type": "close"
        }
      ]
    }
  }
}
```

### 5.7 Index file for all journeys

Create `src/journeys/index.js`:

```javascript
import firstTimeVoter from "./firstTimeVoter.json";
import missingName from "./missingName.json";
import movedCities from "./movedCities.json";
import migrantWorker from "./migrantWorker.json";
import electionDay from "./electionDay.json";
import seniorPwd from "./seniorPwd.json";

export const ALL_JOURNEYS = [
  firstTimeVoter,
  missingName,
  movedCities,
  migrantWorker,
  electionDay,
  seniorPwd,
];

export const JOURNEY_MAP = Object.fromEntries(
  ALL_JOURNEYS.map((j) => [j.id, j])
);

export function getJourney(id) {
  return JOURNEY_MAP[id] || null;
}
```

---

<a id="6-phase-3"></a>
## 6. Phase 3 — The FSM Engine (Hooks)

This is the brain. ~80 lines that power all 6 journeys.

### 6.1 Core journey hook

Create `src/hooks/useJourney.js`:

```javascript
import { useState, useCallback, useMemo } from "react";

/**
 * useJourney — FSM engine for DO mode journeys
 *
 * Given a journey definition, manages:
 * - Current step pointer
 * - History (for back navigation)
 * - Step data (collected user input across steps)
 * - Transition logic
 *
 * @param {Journey} journey - The journey definition
 * @param {Object} [initial] - Optional initial state (for resume)
 * @returns {Object} - { currentStep, history, data, goTo, back, reset, isComplete }
 */
export function useJourney(journey, initial = {}) {
  const [currentStepId, setCurrentStepId] = useState(
    initial.currentStepId || journey.startStepId
  );
  const [history, setHistory] = useState(initial.history || []);
  const [data, setData] = useState(initial.data || {});

  const currentStep = useMemo(
    () => journey.steps[currentStepId],
    [journey, currentStepId]
  );

  const stepIds = useMemo(() => Object.keys(journey.steps), [journey]);
  const stepIndex = useMemo(
    () => stepIds.indexOf(currentStepId),
    [stepIds, currentStepId]
  );
  const totalSteps = stepIds.length;

  const goTo = useCallback(
    (nextStepId, stepData = {}) => {
      if (!journey.steps[nextStepId]) {
        console.warn(`Step "${nextStepId}" not found in journey "${journey.id}"`);
        return;
      }
      setHistory((h) => [...h, currentStepId]);
      setData((d) => ({ ...d, [currentStepId]: stepData }));
      setCurrentStepId(nextStepId);
    },
    [journey, currentStepId]
  );

  const back = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentStepId(prev);
  }, [history]);

  const reset = useCallback(() => {
    setCurrentStepId(journey.startStepId);
    setHistory([]);
    setData({});
  }, [journey]);

  const isComplete = currentStep?.type === "completion";

  return {
    currentStep,
    currentStepId,
    history,
    data,
    goTo,
    back,
    reset,
    isComplete,
    stepIndex,
    totalSteps,
    canGoBack: history.length > 0,
  };
}
```

### 6.2 The persistence hook (lightweight)

Create `src/hooks/useJourneyProgress.js`:

```javascript
import { useEffect } from "react";

const STORAGE_PREFIX = "mai-journey-";

export function saveProgress(journeyId, state) {
  try {
    localStorage.setItem(
      STORAGE_PREFIX + journeyId,
      JSON.stringify({
        currentStepId: state.currentStepId,
        history: state.history,
        data: state.data,
        savedAt: Date.now(),
      })
    );
  } catch (e) {
    // Storage full or disabled — silently ignore
  }
}

export function loadProgress(journeyId) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + journeyId);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Expire saved progress after 7 days
    if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_PREFIX + journeyId);
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

export function clearProgress(journeyId) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + journeyId);
  } catch (e) {}
}

/**
 * useJourneyProgress — auto-saves journey state on change
 */
export function useJourneyProgress(journeyId, state) {
  useEffect(() => {
    if (!journeyId) return;
    if (state.currentStep?.type === "completion") {
      // Don't persist completed journeys
      clearProgress(journeyId);
      return;
    }
    saveProgress(journeyId, state);
  }, [journeyId, state.currentStepId]);
}
```

---

<a id="7-phase-4"></a>
## 7. Phase 4 — The Component Library

Five step components. One renderer that picks the right one.

### 7.1 Folder structure

```
src/components/do/
├── steps/
│   ├── InfoStep.jsx
│   ├── ChoiceStep.jsx
│   ├── ChecklistStep.jsx
│   ├── ActionStep.jsx
│   └── CompletionStep.jsx
├── StepRenderer.jsx
├── ProgressDots.jsx
├── StepHelper.jsx
├── JourneyPlayer.jsx
├── JourneySelector.jsx
└── do.css
```

### 7.2 The renderer (the dispatcher)

Create `src/components/do/StepRenderer.jsx`:

```jsx
import InfoStep from "./steps/InfoStep";
import ChoiceStep from "./steps/ChoiceStep";
import ChecklistStep from "./steps/ChecklistStep";
import ActionStep from "./steps/ActionStep";
import CompletionStep from "./steps/CompletionStep";

const STEP_COMPONENTS = {
  info: InfoStep,
  choice: ChoiceStep,
  checklist: ChecklistStep,
  action: ActionStep,
  completion: CompletionStep,
};

export default function StepRenderer({ step, journey, onNext, onComplete }) {
  const Component = STEP_COMPONENTS[step.type];
  if (!Component) {
    return <div>Unknown step type: {step.type}</div>;
  }
  return (
    <Component
      step={step}
      journey={journey}
      onNext={onNext}
      onComplete={onComplete}
    />
  );
}
```

### 7.3 Info step

Create `src/components/do/steps/InfoStep.jsx`:

```jsx
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function InfoStep({ step, onNext }) {
  return (
    <motion.div
      className="step step-info"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {step.eyebrow && (
        <div className="step-eyebrow text-caption">{step.eyebrow}</div>
      )}
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.body && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.body}</ReactMarkdown>
        </div>
      )}
      <button
        className="step-primary-btn"
        onClick={() => onNext(step.nextStepId)}
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}
```

### 7.4 Choice step

Create `src/components/do/steps/ChoiceStep.jsx`:

```jsx
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChoiceStep({ step, onNext }) {
  return (
    <motion.div
      className="step step-choice"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {step.eyebrow && <div className="step-eyebrow text-caption">{step.eyebrow}</div>}
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.body && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.body}</ReactMarkdown>
        </div>
      )}
      <div className="choice-list">
        {step.choices.map((choice, i) => (
          <motion.button
            key={i}
            className="choice-card"
            onClick={() => onNext(choice.nextStepId, { picked: choice.label })}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="choice-text">
              <div className="choice-label">{choice.label}</div>
              {choice.sublabel && (
                <div className="choice-sublabel">{choice.sublabel}</div>
              )}
            </div>
            <ArrowRight size={18} className="choice-arrow" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
```

### 7.5 Checklist step

Create `src/components/do/steps/ChecklistStep.jsx`:

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChecklistStep({ step, onNext }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  };

  const requiredItems = step.items.filter((i) => i.required);
  const allRequiredChecked = requiredItems.every((i) => checked[i.id]);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <motion.div
      className="step step-checklist"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {step.eyebrow && <div className="step-eyebrow text-caption">{step.eyebrow}</div>}
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.body && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.body}</ReactMarkdown>
        </div>
      )}
      <div className="checklist">
        {step.items.map((item, i) => {
          const isChecked = checked[item.id];
          return (
            <motion.button
              key={item.id}
              className={`checklist-item ${isChecked ? "checked" : ""}`}
              onClick={() => toggle(item.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className={`checkbox ${isChecked ? "checked" : ""}`}>
                {isChecked && <Check size={14} strokeWidth={3} />}
              </div>
              <div className="checklist-text">
                <div className="checklist-label">
                  {item.label}
                  {item.required && <span className="req">*</span>}
                </div>
                {item.hint && <div className="checklist-hint">{item.hint}</div>}
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="checklist-footer">
        <div className="checklist-count text-caption">
          {checkedCount} of {step.items.length} ticked
        </div>
        <button
          className="step-primary-btn"
          onClick={() => onNext(step.continueStepId, { checked })}
          disabled={requiredItems.length > 0 && !allRequiredChecked}
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
}
```

### 7.6 Action step

Create `src/components/do/steps/ActionStep.jsx`:

```jsx
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Calendar, Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ActionStep({ step, onNext }) {
  const [actionDone, setActionDone] = useState(false);

  function handleAction() {
    const a = step.action;
    if (a.type === "link") {
      window.open(a.url, "_blank", "noopener");
    } else if (a.type === "phone") {
      window.location.href = `tel:${a.phone}`;
    } else if (a.type === "calendar") {
      addToGoogleCalendar(a.calendar);
    } else if (a.type === "copy") {
      navigator.clipboard.writeText(a.url || step.body || "");
    }
    setActionDone(true);
  }

  function actionIcon() {
    const t = step.action?.type;
    if (t === "link") return <ExternalLink size={18} />;
    if (t === "phone") return <Phone size={18} />;
    if (t === "calendar") return <Calendar size={18} />;
    if (t === "copy") return actionDone ? <Check size={18} /> : <Copy size={18} />;
    return null;
  }

  return (
    <motion.div
      className="step step-action"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {step.eyebrow && <div className="step-eyebrow text-caption">{step.eyebrow}</div>}
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.body && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.body}</ReactMarkdown>
        </div>
      )}
      <button className="action-card" onClick={handleAction}>
        <div className="action-icon">{actionIcon()}</div>
        <div className="action-label">{step.action.label}</div>
      </button>
      <button
        className="step-secondary-btn"
        onClick={() => onNext(step.continueStepId)}
      >
        {actionDone ? "Continue" : "I'll do this later — continue"}
        <ArrowRight size={18} />
      </button>
    </motion.div>
  );
}

/**
 * Generates a Google Calendar link and opens it in a new tab.
 * Date defaults to 1 week from today if not provided.
 */
function addToGoogleCalendar({ title, description, date }) {
  const start = date ? new Date(date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(description || "")}`;
  window.open(url, "_blank", "noopener");
}
```

### 7.7 Completion step

Create `src/components/do/steps/CompletionStep.jsx`:

```jsx
import { motion } from "framer-motion";
import { Check, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function CompletionStep({ step, journey, onComplete }) {
  const navigate = useNavigate();

  function handleAction(action) {
    if (action.type === "journey") {
      navigate(`/do/${action.target}`);
    } else if (action.type === "link") {
      if (action.target?.startsWith("tel:")) {
        window.location.href = action.target;
      } else {
        window.open(action.target, "_blank", "noopener");
      }
    } else if (action.type === "close") {
      navigate("/do");
    }
    onComplete?.();
  }

  return (
    <motion.div
      className="step step-completion"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="completion-mark"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -8, 0] }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <Check size={42} strokeWidth={2.5} />
      </motion.div>
      <h1 className="text-display-2xl step-title">{step.title}</h1>
      {step.summary && (
        <div className="step-body text-body-lg">
          <ReactMarkdown>{step.summary}</ReactMarkdown>
        </div>
      )}
      {step.nextActions?.length > 0 && (
        <div className="completion-actions">
          {step.nextActions.map((action, i) => (
            <motion.button
              key={i}
              className={`completion-btn ${i === 0 ? "primary" : "secondary"}`}
              onClick={() => handleAction(action)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              {action.label}
              {action.type === "close" ? <X size={16} /> : <ArrowRight size={16} />}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
```

### 7.8 Progress dots

Create `src/components/do/ProgressDots.jsx`:

```jsx
export default function ProgressDots({ history, current, accent }) {
  const filled = history.length;
  const total = filled + 1; // visible position

  return (
    <div className="progress-dots" aria-label={`Step ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i < filled ? "filled" : i === filled ? "current" : ""}`}
          style={i === filled ? { background: accent } : {}}
        />
      ))}
    </div>
  );
}
```

---

<a id="8-phase-5"></a>
## 8. Phase 5 — The Full-Screen Journey Player

This is the immersive view that presents one step at a time.

Create `src/components/do/JourneyPlayer.jsx`:

```jsx
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, X, HelpCircle, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useJourney } from "../../hooks/useJourney";
import { useJourneyProgress, loadProgress, clearProgress } from "../../hooks/useJourneyProgress";
import { getJourney } from "../../journeys";
import StepRenderer from "./StepRenderer";
import ProgressDots from "./ProgressDots";
import StepHelper from "./StepHelper";
import "./do.css";

export default function JourneyPlayer() {
  const { journeyId } = useParams();
  const navigate = useNavigate();
  const journey = getJourney(journeyId);
  const [showHelper, setShowHelper] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null);

  // Check for saved progress on mount
  useEffect(() => {
    if (!journey) return;
    const saved = loadProgress(journey.id);
    if (saved && saved.currentStepId !== journey.startStepId) {
      setResumePrompt(saved);
    }
  }, [journey]);

  if (!journey) {
    return (
      <div className="journey-not-found">
        <h2 className="text-display-lg">Journey not found</h2>
        <button onClick={() => navigate("/do")} className="step-primary-btn">
          Back to journeys
        </button>
      </div>
    );
  }

  return (
    <JourneyView
      journey={journey}
      onExit={() => navigate("/do")}
      resumeFrom={resumePrompt}
      onResumePromptDismiss={() => setResumePrompt(null)}
      showHelper={showHelper}
      setShowHelper={setShowHelper}
    />
  );
}

function JourneyView({ journey, onExit, resumeFrom, onResumePromptDismiss, showHelper, setShowHelper }) {
  const [shouldResume, setShouldResume] = useState(null);

  // If user opted to resume, pass that as initial state
  const initialState = shouldResume === true ? resumeFrom : {};
  const j = useJourney(journey, initialState);

  useJourneyProgress(journey.id, {
    currentStepId: j.currentStepId,
    history: j.history,
    data: j.data,
    currentStep: j.currentStep,
  });

  function handleExit() {
    if (!j.isComplete && j.history.length > 0) {
      const confirm = window.confirm("Leave this journey? Your progress is saved automatically — you can resume later.");
      if (!confirm) return;
    }
    onExit();
  }

  function handleRestart() {
    if (window.confirm("Start over from the beginning?")) {
      clearProgress(journey.id);
      j.reset();
    }
  }

  // Resume prompt overlay
  if (resumeFrom && shouldResume === null) {
    return (
      <div className="journey-shell">
        <ResumePrompt
          journey={journey}
          onResume={() => {
            setShouldResume(true);
            onResumePromptDismiss();
          }}
          onStartOver={() => {
            clearProgress(journey.id);
            setShouldResume(false);
            onResumePromptDismiss();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className="journey-shell"
      style={{ "--journey-accent": journey.accent }}
    >
      {/* Top bar */}
      <header className="journey-topbar">
        <button className="topbar-btn" onClick={handleExit} aria-label="Exit journey">
          <X size={20} />
        </button>
        <div className="topbar-center">
          <ProgressDots
            history={j.history}
            current={j.currentStepId}
            accent={journey.accent}
          />
        </div>
        <div className="topbar-right">
          {!j.isComplete && (
            <button
              className="topbar-btn"
              onClick={handleRestart}
              aria-label="Restart journey"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Step stage */}
      <main className="journey-stage">
        <AnimatePresence mode="wait">
          <StepRenderer
            key={j.currentStepId}
            step={j.currentStep}
            journey={journey}
            onNext={j.goTo}
          />
        </AnimatePresence>
      </main>

      {/* Bottom controls */}
      {!j.isComplete && (
        <footer className="journey-footer">
          <button
            className="footer-btn"
            onClick={j.back}
            disabled={!j.canGoBack}
          >
            <ChevronLeft size={16} />
            Back
          </button>
          <button
            className="footer-btn"
            onClick={() => setShowHelper(true)}
          >
            <HelpCircle size={16} />
            Confused? Ask MAI
          </button>
        </footer>
      )}

      {/* Gemini Helper drawer */}
      <AnimatePresence>
        {showHelper && (
          <StepHelper
            journey={journey}
            step={j.currentStep}
            onClose={() => setShowHelper(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ResumePrompt({ journey, onResume, onStartOver }) {
  return (
    <motion.div
      className="resume-prompt"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="resume-card">
        <div className="text-caption resume-eyebrow">Welcome back</div>
        <h2 className="text-display-lg">Continue where you left off?</h2>
        <p className="text-body resume-body">
          You started <em>{journey.title}</em> earlier. Pick up where you stopped, or start over.
        </p>
        <div className="resume-actions">
          <button className="step-primary-btn" onClick={onResume}>
            Resume
          </button>
          <button className="step-secondary-btn" onClick={onStartOver}>
            Start over
          </button>
        </div>
      </div>
    </motion.div>
  );
}
```

---

<a id="9-phase-6"></a>
## 9. Phase 6 — The Journey Selector (DO Home)

The page at `/do` where users pick which journey to start.

Create `src/components/do/JourneySelector.jsx`:

```jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { ALL_JOURNEYS } from "../../journeys";
import { loadProgress } from "../../hooks/useJourneyProgress";
import "./do.css";

export default function JourneySelector() {
  const navigate = useNavigate();

  return (
    <div className="do-home">
      <header className="do-home-header">
        <div className="do-home-masthead">
          <span className="do-masthead-dot" />
          <span className="text-caption">MAI — DO</span>
        </div>
      </header>

      <main className="do-home-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="do-home-intro"
        >
          <h1 className="text-display-2xl">
            Pick what brought you{" "}
            <span className="text-display-italic" style={{ color: "var(--saffron-500)" }}>
              here today.
            </span>
          </h1>
          <p className="text-body-lg do-home-subtitle">
            Step-by-step guides through real voter situations. Pause and resume anytime.
          </p>
        </motion.div>

        <div className="journey-grid">
          {ALL_JOURNEYS.map((journey, i) => {
            const Icon = Icons[journey.icon] || Icons.Compass;
            const inProgress = loadProgress(journey.id);
            return (
              <motion.button
                key={journey.id}
                className="journey-card"
                onClick={() => navigate(`/do/${journey.id}`)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                whileHover={{ y: -3 }}
                style={{ "--card-accent": journey.accent }}
              >
                <div className="journey-card-icon">
                  <Icon size={22} />
                </div>
                <div className="journey-card-body">
                  <h3 className="journey-card-title">{journey.title}</h3>
                  <p className="journey-card-subtitle">{journey.subtitle}</p>
                  <div className="journey-card-meta">
                    <span className="text-caption">{journey.estimatedTime}</span>
                    {inProgress && (
                      <span className="journey-card-resume text-caption">In progress</span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
```

---

<a id="10-phase-7"></a>
## 10. Phase 7 — Checklist & Interactive Elements

Already covered in 7.5 (ChecklistStep). The pattern:

- Required items have a `*` and gate the Continue button
- Optional items don't gate — user can continue without ticking
- Live counter at the bottom
- Tapped state animates with a check

This is fully implemented in the ChecklistStep component above.

---

<a id="11-phase-8"></a>
## 11. Phase 8 — Gemini Fallback Helper

When a user is stuck on a step, they tap "Confused? Ask MAI" → drawer opens → reuses the ASK Cloud Function but pre-loaded with context about the current step.

Create `src/components/do/StepHelper.jsx`:

```jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { askMai } from "../../services/askClient";

export default function StepHelper({ journey, step, onClose }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAsk() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setAnswer("");

    // Build context-rich question
    const fullQuestion = `Context: A user is going through the journey "${journey.title}", currently on step "${step.title}". Their question is: ${question}`;

    const abort = new AbortController();
    let buffer = "";

    await askMai(fullQuestion, abort.signal, {
      onSources: () => {},
      onToken: (token) => {
        buffer += token;
        setAnswer(buffer);
      },
      onDone: () => setLoading(false),
      onError: () => {
        setAnswer("Sorry — I couldn't fetch an answer. Try the Voter Helpline at 1950.");
        setLoading(false);
      },
    });
  }

  // Suggested questions based on step type
  const suggestions = [
    "What does this step actually mean?",
    "Why is this required?",
    "What if I don't have this?",
  ];

  return (
    <motion.div
      className="helper-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="helper-drawer"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="helper-header">
          <div>
            <div className="text-caption helper-eyebrow">Helper</div>
            <h3 className="text-display-lg">Ask about this step</h3>
          </div>
          <button className="helper-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        <div className="helper-body">
          {!answer && !loading && (
            <div className="helper-suggestions">
              <div className="text-caption">Or try one of these</div>
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="helper-suggestion"
                  onClick={() => {
                    setQuestion(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {answer && (
            <div className="helper-answer text-body-lg">
              {answer}
            </div>
          )}

          {loading && !answer && (
            <div className="helper-loading">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          )}
        </div>

        <footer className="helper-composer">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder="Ask anything about this step..."
            className="helper-input"
            disabled={loading}
          />
          <button
            className="helper-send"
            onClick={handleAsk}
            disabled={!question.trim() || loading}
          >
            <Send size={16} />
          </button>
        </footer>
      </motion.aside>
    </motion.div>
  );
}
```

---

<a id="12-phase-9"></a>
## 12. Phase 9 — Lightweight Persistence

Already implemented in `useJourneyProgress.js` (Phase 6.2).

Behavior summary:
- On every step change, save state to localStorage
- 7-day expiry (auto-cleanup)
- Completed journeys are cleared (no resume prompt for done journeys)
- Per-journey storage key (multiple journeys can be in progress simultaneously)
- Resume prompt shown on entry to a journey with saved state

---

<a id="13-phase-10"></a>
## 13. Phase 10 — Polish & Animations

Now the stylesheet that ties everything together.

Create `src/components/do/do.css`:

```css
/* ============================================================
   DO MODE — FULL-SCREEN JOURNEY PLAYER
   ============================================================ */

/* ====== JOURNEY SHELL ====== */

.journey-shell {
  position: fixed;
  inset: 0;
  background: var(--ink-900);
  display: grid;
  grid-template-rows: auto 1fr auto;
  z-index: 100;
}

/* ====== TOPBAR ====== */

.journey-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--ink-700);
}

.topbar-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  border: 1px solid var(--ink-600);
  background: transparent;
  color: var(--paper-100);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.topbar-btn:hover {
  border-color: var(--journey-accent, var(--saffron-500));
  color: var(--journey-accent, var(--saffron-500));
}

.topbar-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.topbar-right {
  display: flex;
  gap: var(--space-2);
}

/* ====== PROGRESS DOTS ====== */

.progress-dots {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-600);
  transition: all var(--duration-base) var(--ease-out);
}

.dot.filled {
  background: var(--ink-400);
}

.dot.current {
  width: 24px;
  border-radius: 3px;
}

/* ====== STAGE ====== */

.journey-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  overflow-y: auto;
  position: relative;
}

/* ====== STEP — common ====== */

.step {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.step-eyebrow {
  color: var(--journey-accent, var(--saffron-500));
  font-weight: 500;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.step-title {
  color: var(--paper-100);
  max-width: 18ch;
}

.step-body {
  color: var(--ink-300);
  line-height: 1.7;
}

.step-body p {
  margin-bottom: var(--space-3);
}
.step-body p:last-child { margin-bottom: 0; }

.step-body strong {
  color: var(--paper-100);
  font-weight: 600;
}

.step-primary-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  background: var(--journey-accent, var(--saffron-500));
  color: var(--ink-900);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  margin-top: var(--space-4);
}

.step-primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(255, 107, 53, 0.25);
}

.step-primary-btn:disabled {
  background: var(--ink-700);
  color: var(--ink-400);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.step-secondary-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: transparent;
  color: var(--paper-100);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.step-secondary-btn:hover {
  border-color: var(--paper-100);
}

/* ====== CHOICE STEP ====== */

.choice-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.choice-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-5);
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  color: var(--paper-100);
  transition: all var(--duration-base) var(--ease-out);
}

.choice-card:hover {
  border-color: var(--journey-accent, var(--saffron-500));
  background: var(--ink-700);
}

.choice-text {
  flex: 1;
}

.choice-label {
  font-size: 1.0625rem;
  font-weight: 500;
  color: var(--paper-100);
  margin-bottom: var(--space-1);
}

.choice-sublabel {
  font-size: 0.875rem;
  color: var(--ink-400);
}

.choice-arrow {
  color: var(--ink-400);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-out);
}

.choice-card:hover .choice-arrow {
  color: var(--journey-accent, var(--saffron-500));
  transform: translateX(2px);
}

/* ====== CHECKLIST STEP ====== */

.checklist {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-lg);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-body);
  color: var(--paper-100);
  transition: all var(--duration-fast) var(--ease-out);
}

.checklist-item:hover {
  border-color: var(--ink-500);
}

.checklist-item.checked {
  background: var(--ink-700);
  border-color: var(--journey-accent, var(--saffron-500));
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid var(--ink-500);
  border-radius: 6px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
  margin-top: 2px;
}

.checkbox.checked {
  background: var(--journey-accent, var(--saffron-500));
  border-color: var(--journey-accent, var(--saffron-500));
  color: var(--ink-900);
}

.checklist-text {
  flex: 1;
}

.checklist-label {
  font-size: 1rem;
  font-weight: 500;
  color: var(--paper-100);
}

.checklist-label .req {
  color: var(--journey-accent, var(--saffron-500));
  margin-left: 4px;
}

.checklist-hint {
  font-size: 0.8125rem;
  color: var(--ink-400);
  margin-top: var(--space-1);
  line-height: 1.5;
}

.checklist-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-4);
}

.checklist-count {
  color: var(--ink-400);
}

/* ====== ACTION STEP ====== */

.action-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5);
  background: var(--ink-800);
  border: 1px solid var(--journey-accent, var(--saffron-500));
  border-radius: var(--radius-lg);
  color: var(--journey-accent, var(--saffron-500));
  cursor: pointer;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  transition: all var(--duration-fast) var(--ease-out);
}

.action-card:hover {
  background: rgba(255, 107, 53, 0.08);
  transform: translateY(-1px);
}

.action-icon {
  display: grid;
  place-items: center;
}

/* ====== COMPLETION STEP ====== */

.step-completion {
  text-align: center;
  align-items: center;
}

.completion-mark {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: var(--journey-accent, var(--saffron-500));
  color: var(--ink-900);
  display: grid;
  place-items: center;
  margin-bottom: var(--space-4);
}

.step-completion .step-title {
  text-align: center;
  margin: 0 auto;
}

.completion-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.completion-btn {
  width: 100%;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  transition: all var(--duration-fast) var(--ease-out);
}

.completion-btn.primary {
  background: var(--journey-accent, var(--saffron-500));
  color: var(--ink-900);
}

.completion-btn.secondary {
  background: transparent;
  color: var(--paper-100);
  border-color: var(--ink-600);
}

.completion-btn:hover {
  transform: translateY(-1px);
}

/* ====== FOOTER ====== */

.journey-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--ink-700);
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  color: var(--ink-400);
  font-family: var(--font-body);
  font-size: 0.875rem;
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out);
}

.footer-btn:hover:not(:disabled) {
  color: var(--paper-100);
}

.footer-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ====== RESUME PROMPT ====== */

.resume-prompt {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: var(--space-6);
}

.resume-card {
  max-width: 480px;
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.resume-eyebrow {
  color: var(--journey-accent, var(--saffron-500));
}

.resume-body {
  color: var(--ink-300);
}

.resume-body em {
  color: var(--paper-100);
  font-style: italic;
  font-family: var(--font-display);
}

.resume-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

/* ====== HELPER DRAWER ====== */

.helper-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-end;
}

.helper-drawer {
  width: 100%;
  max-height: 75vh;
  background: var(--ink-800);
  border-top: 1px solid var(--ink-600);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.helper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5);
  border-bottom: 1px solid var(--ink-700);
}

.helper-eyebrow {
  color: var(--saffron-500);
  margin-bottom: var(--space-1);
  font-family: var(--font-mono);
}

.helper-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: 1px solid var(--ink-600);
  background: transparent;
  color: var(--paper-100);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.helper-body {
  flex: 1;
  padding: var(--space-5);
  overflow-y: auto;
}

.helper-suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.helper-suggestions .text-caption {
  color: var(--ink-400);
  margin-bottom: var(--space-2);
}

.helper-suggestion {
  text-align: left;
  padding: var(--space-3) var(--space-4);
  background: var(--ink-900);
  border: 1px solid var(--ink-700);
  border-radius: var(--radius-md);
  color: var(--paper-100);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.helper-suggestion:hover {
  border-color: var(--saffron-500);
  color: var(--saffron-500);
}

.helper-answer {
  color: var(--paper-100);
  white-space: pre-wrap;
}

.helper-loading {
  display: flex;
  gap: 6px;
  padding: var(--space-4);
}

.helper-loading .thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--saffron-500);
  animation: helperPulse 1.1s ease-in-out infinite;
}

.helper-loading .thinking-dot:nth-child(2) { animation-delay: 0.15s; }
.helper-loading .thinking-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes helperPulse {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-3px); }
}

.helper-composer {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4);
  border-top: 1px solid var(--ink-700);
}

.helper-input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: var(--ink-900);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-md);
  color: var(--paper-100);
  font-family: var(--font-body);
  font-size: 0.9375rem;
  outline: none;
}

.helper-input:focus {
  border-color: var(--saffron-500);
}

.helper-send {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--saffron-500);
  color: var(--ink-900);
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.helper-send:disabled {
  background: var(--ink-700);
  color: var(--ink-400);
  cursor: not-allowed;
}

/* ============================================================
   JOURNEY SELECTOR (DO HOME PAGE)
   ============================================================ */

.do-home {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
}

.do-home-header {
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(20px);
  background: rgba(10, 10, 15, 0.7);
  border-bottom: 1px solid var(--ink-600);
}

.do-home-masthead {
  max-width: var(--max-wide);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.do-masthead-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--saffron-500);
  box-shadow: 0 0 12px var(--saffron-500);
}

.do-home-main {
  max-width: var(--max-wide);
  margin: 0 auto;
  width: 100%;
  padding: var(--space-12) var(--space-6) var(--space-16);
}

.do-home-intro {
  max-width: 680px;
  margin-bottom: var(--space-12);
}

.do-home-subtitle {
  color: var(--ink-400);
  margin-top: var(--space-4);
}

.journey-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

@media (max-width: 720px) {
  .journey-grid {
    grid-template-columns: 1fr;
  }
}

.journey-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--ink-800);
  border: 1px solid var(--ink-600);
  border-radius: var(--radius-xl);
  text-align: left;
  cursor: pointer;
  font-family: var(--font-body);
  color: var(--paper-100);
  transition: all var(--duration-base) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.journey-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top right,
    color-mix(in srgb, var(--card-accent) 12%, transparent),
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--duration-base) var(--ease-out);
}

.journey-card:hover {
  border-color: var(--card-accent);
}

.journey-card:hover::before {
  opacity: 1;
}

.journey-card-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--ink-900);
  border: 1px solid var(--ink-600);
  color: var(--card-accent);
  display: grid;
  place-items: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.journey-card-body {
  flex: 1;
  position: relative;
  z-index: 1;
}

.journey-card-title {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.25;
  color: var(--paper-100);
  margin-bottom: var(--space-2);
}

.journey-card-subtitle {
  font-size: 0.9375rem;
  color: var(--ink-400);
  line-height: 1.5;
  margin-bottom: var(--space-3);
}

.journey-card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.journey-card-meta .text-caption {
  color: var(--ink-400);
}

.journey-card-resume {
  color: var(--card-accent) !important;
  position: relative;
  padding-left: var(--space-3);
}

.journey-card-resume::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--card-accent);
  transform: translateY(-50%);
  animation: resumePulse 2s ease-in-out infinite;
}

@keyframes resumePulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* ====== JOURNEY NOT FOUND ====== */

.journey-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: var(--space-4);
  padding: var(--space-6);
  text-align: center;
}

/* ====== MOBILE ====== */

@media (max-width: 640px) {
  .journey-stage { padding: var(--space-4); }
  .journey-topbar { padding: var(--space-3) var(--space-4); }
  .journey-footer { padding: var(--space-3) var(--space-4); }
  .step { gap: var(--space-5); }
  .step-title { font-size: 2rem; line-height: 1.05; }
  .do-home-main { padding: var(--space-8) var(--space-4); }
  .resume-card { padding: var(--space-6); }
}
```

### 13.1 Wire DO mode into your router

Update `src/App.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AskPage from "./components/ask/AskPage";
import JourneySelector from "./components/do/JourneySelector";
import JourneyPlayer from "./components/do/JourneyPlayer";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ask" element={<AskPage />} />
        <Route path="/do" element={<JourneySelector />} />
        <Route path="/do/:journeyId" element={<JourneyPlayer />} />
        {/* other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

<a id="14-phase-11"></a>
## 14. Phase 11 — Testing & Edge Cases

Manually click through every journey and verify:

### Test matrix

| Journey | Test |
|---|---|
| First-time voter | All 8 steps complete. Both branches at age check work. |
| Missing name | All 3 paths (never registered / moved / deleted) lead to Form 6 action. |
| Moved cities | All 3 scope choices reach a valid completion. |
| Migrant worker | "Compare" loop works (returns to options). |
| Election day | Both problem branches resolve. |
| Senior/PwD | All 3 category options complete. |

### Edge cases to verify

- ✅ Refresh mid-journey → resume prompt appears
- ✅ Tap "Start over" on resume → state cleared, starts at step 1
- ✅ Complete a journey → next time you visit, no resume prompt
- ✅ Go back through 3+ steps → state restored correctly
- ✅ Open helper drawer → gemini answer streams correctly
- ✅ Mobile (375px) — all steps render without horizontal scroll
- ✅ Keyboard navigation — Tab/Enter on choice cards work
- ✅ Reduced motion — animations respect `prefers-reduced-motion`

### Quick unit test for FSM

If you want to add Vitest tests:

```javascript
// src/hooks/__tests__/useJourney.test.js
import { renderHook, act } from "@testing-library/react";
import { useJourney } from "../useJourney";
import journey from "../../journeys/firstTimeVoter.json";

test("starts at startStepId", () => {
  const { result } = renderHook(() => useJourney(journey));
  expect(result.current.currentStepId).toBe("intro");
});

test("goTo advances to next step", () => {
  const { result } = renderHook(() => useJourney(journey));
  act(() => result.current.goTo("ageCheck"));
  expect(result.current.currentStepId).toBe("ageCheck");
});

test("back returns to previous step", () => {
  const { result } = renderHook(() => useJourney(journey));
  act(() => result.current.goTo("ageCheck"));
  act(() => result.current.back());
  expect(result.current.currentStepId).toBe("intro");
});

test("isComplete is true on completion step", () => {
  const { result } = renderHook(() => useJourney(journey));
  act(() => result.current.goTo("complete"));
  expect(result.current.isComplete).toBe(true);
});
```

---

<a id="15-troubleshooting"></a>
## 15. Troubleshooting Playbook

| Symptom | Likely Cause | Fix |
|---|---|---|
| "Step not found" warning | Typo in `nextStepId` reference | Open the journey JSON, verify all `nextStepId` and `continueStepId` values match actual step keys |
| Resume prompt appears when it shouldn't | Old localStorage entry | Clear: `localStorage.clear()` or wait 7 days |
| Animation feels janky | Motion overuse | Verify `framer-motion` is the only animation library; no CSS keyframes competing |
| Helper drawer doesn't stream | askMai client error | Open browser console; check askGeminiStream endpoint URL is correct |
| Calendar action does nothing | Popup blocker | Browsers may block — instruct users to allow popups for the site |
| Checklist Continue button stays disabled | Required items not all ticked | This is correct behavior; check if you wanted them required |
| Choice cards don't animate stagger | `i` not passed to delay | Verify the `delay: 0.1 + i * 0.06` math in ChoiceStep |
| Mobile typography overflows | Long titles | Add `max-width: 14ch` or `15ch` on `.step-title` for that journey |

---

## What "Production-Ready" Means For DO Mode

You've now built:

✅ A data-driven FSM engine that handles all 6 journeys
✅ Five reusable step types (info, choice, checklist, action, completion)
✅ Full-screen immersive UI with smooth transitions
✅ Lightweight localStorage persistence with 7-day expiry
✅ Resume capability across sessions
✅ Gemini fallback helper that reuses ASK's RAG infrastructure
✅ Google Calendar integration for deadline reminders
✅ Branching logic for diagnostic flows (missing name)
✅ Required vs optional checklist gating
✅ Per-journey accent theming
✅ Mobile-responsive layouts
✅ Keyboard accessibility

What makes this stand out from a generic submission:

1. **FSM architecture** — judges who know software design will recognize this immediately as data-driven, scalable engineering
2. **6 actually useful journeys** — not 1 demo flow
3. **The checklist pattern** — solves real problems, not just info display
4. **Resume via localStorage** — sophisticated UX detail
5. **Gemini helper reuses ASK infra** — clever architectural reuse
6. **Per-journey theming** — visual depth without complexity
7. **Calendar API integration** — deadline reminders feel like a polished consumer app

When you demo, open with this:

> *"Each of these is a real situation an Indian voter actually faces — name missing, moved cities, election day. They're not chatbots. They're guided processes with branches, checklists, and resume."*

You'll hear judges say "wow."

---

## What to Build Next

After DO ships, you have:
- ✅ ASK mode (RAG chatbot)
- ✅ DO mode (FSM journeys)

Remaining for full MAI:
- **LEARN mode** — Interactive chapters + EVM simulator
- **Voice layer** — TTS on every step
- **Translate layer** — UI in 10 languages
- **Auth** — Google Sign-in for cross-device persistence

DO mode reused 100% of your ASK Cloud Function. LEARN mode will reuse 100% of your DO step components. Each phase compounds.

You're 2/3rds of the way to a winning submission.

Build fearlessly.
