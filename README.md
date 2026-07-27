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

## 🧠 Implemented RAG (Retrieval-Augmented Generation) AI
Our intelligent AI assistant utilizes RAG to connect raw case files with conversational insights:
* **Dynamic PDF Indexing:** Integrates directly with Zoho QuickML datasets where unstructured case guidelines, crime reports, and PDF files are ingested and converted into vector embeddings.
* **Contextual Retrieval:** When an officer queries the chat, the system dynamically retrieves relevant document chunks from the PDF knowledge base matching their input query.
* **Accurate LLM Generation:** Appends the retrieved document facts directly to the Zoho Zia GLM/Gemini prompt context, guaranteeing factually accurate summaries without AI hallucinations.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, D3.js (Network Graph), Recharts (Analytics).
* **Backend:** Python 3.9 (Flask Micro-framework) deployed via **Catalyst Advanced I/O**.
* **Database:** **Catalyst Cloud Scale Datastore** managed via Zoho Catalyst Query Language (ZCQL).
* **AI Pipelines:** **Zoho QuickML** (GenAI Pipeline Serving), **Zia GLM Serving**, with dynamic fallback to **Google Gemini AI**.
* **Deployments:** Hosted on **Catalyst Slate** (Frontend SPA) and **Advanced I/O** (Backend Serverless).

---

## 🚀 Deployed Environment
* **Live Web App:** [https://kspcrimeintel.onslate.in/](https://kspcrimeintel.onslate.in/)
