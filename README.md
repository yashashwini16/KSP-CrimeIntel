# KSP CrimeIntel: Predictive Crime Intelligence Platform

**KSP CrimeIntel** is a next-generation crime intelligence and decision-support platform built entirely on the **Zoho Catalyst** serverless ecosystem. It transforms raw, tabular First Information Report (FIR) logs (like CCTNS) into actionable, predictive intelligence using **Conversational AI (Zia GLM Serving / Google Gemini)**, **Interactive Network Analytics (D3.js)**, and **Predictive Hotspot Forecasting (QuickML)**.

---

## 🚀 Key Features

1. **Role-Based Access Control (RBAC):**
   * **Investigator:** Focused case indexing, offender tracking, relationship network mapping, and RAG chat.
   * **Supervisor:** Executive statistics dashboard, operational alerts, import portals, and audit trails.
   * **Analyst:** Spatial heatmaps (crime mapping), network relationship graph, and predictive forecasts.
   * **Policymaker:** High-level dashboard charts, macro crime maps, and strategic forecasting.
2. **Interactive Criminal Network Graphs:** Visualizes gang connections, co-accused associations, and accomplice hierarchies using interactive D3.js nodes.
3. **Advanced Analytics Dashboard:** Real-time statistics, monthly trends, and breakdowns by offense classification (Cyber Crime, Theft, Assault, Fraud).
4. **Spatial Crime Mapping:** Geographic density clustering to identify crime hotspots for efficient police deployment.
5. **Time-Series Forecasting:** Predictive machine learning pipelines projecting crime trends for upcoming months.
6. **Immutable Audit Logs:** Tracks and logs all database modifications and user access logs to ensure legal auditability.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, D3.js (Network Graph), Recharts (Analytics).
* **Backend:** Python 3.9 (Flask Micro-framework) deployed via **Catalyst Advanced I/O**.
* **Database:** **Catalyst Cloud Scale Datastore** managed via Zoho Catalyst Query Language (ZCQL).
* **AI Pipelines:** **Zoho QuickML** (GenAI Pipeline Serving), **Zia GLM Serving**, with dynamic fallback to **Google Gemini AI**.
* **Deployments:** Hosted on **Catalyst Slate** (Frontend SPA) and **Advanced I/O** (Backend Serverless).

---

## 📊 Datastore Schemas

### 1. `cases` Table
Stores granular details of registered FIRs.
* `ROWID` (BigInt, System) - Unique 17-digit Case Identifier
* `case_no` (VarChar) - Official FIR Number (e.g., `FIR/2026/001`)
* `crime_no` (VarChar) - Crime Log Reference Number
* `crime_registered_date` (VarChar) - Registration Date
* `brief_facts` (VarChar) - Modus Operandi & Case Summary
* `latitude` / `longitude` (Double) - Geographic coordinates for Crime Mapping
* `district` / `police_station` (VarChar) - Territorial jurisdiction
* `crime_type` (VarChar) - Classification (e.g., `Cyber Crime`, `Theft`)
* `case_status` (VarChar) - `Open` or `Closed` status

### 2. `users` Table
Handles role-based authorization credentials.
* `ROWID` (BigInt, System)
* `username` (VarChar) - Login Username (e.g., `investigator`, `supervisor`)
* `password_hash` (VarChar) - Secure Password Hash
* `role` (VarChar) - Roles: `investigator`, `supervisor`, `analyst`, `policymaker`

### 3. `offenders` Table
Profiles active repeat offenders.
* `ROWID` (BigInt, System)
* `name` (VarChar) - Offender Name
* `risk_score` (Int) - Dynamic threat score (0-100)
* `firs_count` (Int) - Cumulative offense count
* `latest_crime` (VarChar) - Most recent crime classification

---

## ⚙️ Zoho Catalyst Configuration

### 1. Connections Component Setup
To use Zoho QuickML GLM serving, configure a connection named **`quickml`** in your Catalyst Console:
1. Navigate to **Security & Identity** -> **Connections** -> **Create Connection**.
2. Pick **Catalyst by Zoho** as your service.
3. Set both **Connection Name** and **Connection Link Name** to: `quickml`.
4. Check the following scopes:
   * `QuickML.datasets.READ`
   * `QuickML.datasets.CREATE`
   * `QuickML.deployment.READ` *(Note: Must be singular)*
5. Click **Create and Connect** and authorize your account.

### 2. Manual OAuth Fallback Credentials
If your region doesn't support direct connection authorization, fill out the following Environment Variables under your **`ksp-backend`** settings:
* `ZOHO_CLIENT_ID`: OAuth Client ID from your Zoho API Console.
* `ZOHO_CLIENT_SECRET`: OAuth Client Secret.
* `ZOHO_REFRESH_TOKEN`: Refresh token generated with scopes `QuickML.deployment.READ,QuickML.datasets.READ`.
* `ZOHO_ACCOUNTS_URL`: `https://accounts.zoho.in` (or your regional Zoho accounts endpoint).
* `ZOHO_PROJECT_ID`: Your Catalyst Project ID.
* `GEMINI_API_KEY`: Your backup Gemini key.

---

## 🚀 Deployed Environment
* **Live Web App:** [https://web-frontend-kipjdxga.onslate.in](https://web-frontend-kipjdxga.onslate.in)
* **Backend Endpoint:** `https://ksp-crimeintel-60076939808.development.catalystserverless.in/server/ksp-backend/`
