# DemandPilot

DemandPilot is a premium, fully-functional, SaaS B2B demand generation and distribution platform. Built for founders, marketing teams, and content managers, DemandPilot unifies keyword research, content drafting, cross-platform distribution, and editorial approval pipelines into one elegant, intelligence-first interface.

This application is built as an offline-first, cloud-capable prototype natively rendering in the browser with secure backend persistence.

## Technologies Used

*   **Vite + React + TypeScript**: A fast, modern frontend development environment guaranteeing strict type safety, fast native ES module compilation, and a component-heavy architecture.
*   **Tailwind CSS**: A utility-first CSS framework for rapid UI development and maintaining the cohesive, premium SaaS design system.
*   **Firebase Auth + Firestore**: Utilizes the Firebase Web API for secure Google Sign-In and real-time capable NoSQL database persistence.
*   **date-fns**: Comprehensive toolset for fast client-side date manipulations in the Campaign Calendar.
*   **Sonner**: Substantive, elegant toast notifications that avoid visual clutter.
*   **Lucide-React**: High-quality SVG icon system perfectly tailored to premium SaaS interfaces.

## Features

*   **Firebase Authentication System**: Built-in Google Single Sign-on integration, with user avatar and session state rendering directly into the sidebar.
*   **Firestore Data Persistence**: All AppContext data logic utilizes fully operational Firestore collections: `keywords`, `contents`, and core internal structures. It syncs state across reloads cleanly.
*   **Dashboard & Unified State**: Review metrics, recent content, and system summaries across an animated, premium overview screen.
*   **Keyword Lab**: A research interface for cataloging targeted terms, mapping intent to geography, and moving straight to content creation natively.
*   **Content Studio & AI Generation Mocking**: A distraction-free editing interface integrating AI "Drafting" pipelines seamlessly. Content created here is immediately available in the workflow cache.
*   **Content Library & Inline Editing**: Comprehensive Data Table for reviewing all content pieces, featuring bulk operations, contextual search, exact status filtering, and inline rapid editing overlays.
*   **Manual LinkedIn Workflow**: Built around an authentication-safe "Manual Action" flow. Users draft LinkedIn posts in the system, copy them to the clipboard, manually post to the native LinkedIn network, and then attach the live URL in the platform to synchronize the record's Live state permanently.
*   **Campaign Calendar**: A unified Month/Week grid view parsing out published content natively. Uses visual brand-coded distribution chips with deep linking into the Content Library modifier.
*   **Integration Hub (Connectors)**: Provides a system of record for connecting Workspace capabilities safely across Google Drive, Workspace API, Google Trends, Analytics, Search Console, and manual pipelines without relying on mock data logic.
*   **Settings System**: Detailed modular management of brands (`ApexHRM`, `CV Pro`, `1BT`) dictating stylistic rules and tonalities for generated outputs.

## How to Run Locally

If you are exporting this project from AI Studio Build to your device:

1.  **Install Node.js & npm**
2.  **Pull Repository**: Unzip or clone the repository locally to your environment.
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Configure Environment Variables**:
    Copy the `.env.example` file and rename it to `.env`. Ensure your `firebase-applet-config.json` parameters are properly injected representing your target database environment.
5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
6.  The platform will typically launch on `localhost:3000` via Vite.

## What is Real Now

*   **Firebase Auth**: The entire Google Login system is real and authenticates directly to Firebase security servers.
*   **Data Persistence**: If Firebase is configured properly, any modifications in the application will accurately save, modify, index, and load off a live Firestore DB immediately avoiding local-storage wiping. 
*   **Application Logic**: Complete front-to-back cross-page state flow routing (e.g. Navigating from Calendar Chip -> Inline Content Editor overlay).
*   **Manual External Linking Validation**: Validating the exact format of external LinkedIn links mapped uniquely to Content instances.

## What is Planned Later

*   **Live Connectors API Hooking**: Shifting Connected Workspace/External applications (Gmail, Workspace, GSC, Meta/LI Ads APIs) from "Pending Setup" manually to directly hooked bi-directional OAuth states.
*   **Agentic Orchestration AI Integration**: Building prompt-chaining flows into the drafting system utilizing `gemini-api` calls behind the Content Studio interface. 
*   **Rich Analytics Hooking**: Rendering GSC query-level tables inside the Dashboard dynamically.
*   **Webhooks Publishing Pipeline**: Enabling automatic push capability straight to WordPress CMS endpoints or automated LinkedIn marketing deployments.
