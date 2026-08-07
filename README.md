# KSP CrimeIntel Platform

**Intelligent Conversational AI & Crime Analytics Platform**  
*Built for the Karnataka State Police (KSP) Datathon 2026*

## 🚀 Overview

KSP CrimeIntel is a next-generation intelligence layer built exclusively on the **Zoho Catalyst** platform. It sits on top of existing police databases (like CCTNS) to transform raw crime data into actionable intelligence. 

By leveraging Advanced Analytics, Network Mapping, and QuickML forecasting, CrimeIntel empowers investigators to discover hidden gang relationships, predict crime hotspots before they emerge, and rapidly profile repeat offenders through a natural language AI interface.

---

## ✨ Key Features

1. **Multilingual AI Assistant (Zia/QuickML Integration):** Voice-enabled chatbot (English & Kannada) for querying crime records and generating rapid case summaries.
2. **Interactive Criminal Network Graphs:** Visual D3.js mapping of co-offenders and known associates to dismantle entire gangs.
3. **Advanced Analytics Dashboard:** Real-time crime trends, demographic breakdowns, and hotspot mapping for resource allocation.
4. **Predictive Forecasting:** Time-series analysis simulating Zoho QuickML to predict emerging crime clusters.
5. **Dynamic Offender Profiling:** Automated risk-scoring (0-100) based on historical FIR data and behavioral patterns.
6. **Enterprise Governance:** Strict Role-Based Access Control (RBAC) separating Investigators from Analysts, complete with immutable audit logs.

---

## 🛠 Technology Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS, D3.js, Recharts
- **Backend:** Python (Flask)
- **Deployment & Cloud:** Zoho Catalyst (Serverless)
  - *Catalyst Slate* (Frontend Hosting)
  - *Catalyst Advanced I/O* (Backend API Routing)
  - *Catalyst Cloud Scale Datastore* (ZCQL Database)

---

## 🔐 Demo Credentials

To test the application's Role-Based Access Control, use the password **`password123`** with any of the following usernames:

- **`investigator`**: Access to AI Chat and specific FIR case management.
- **`supervisor`**: Access to Real-time Alerts and overarching command views.
- **`analyst`**: Access to the Crime Hotspot Map and Criminal Network Graphs.
- **`policymaker`**: Access to QuickML Forecasting and high-level analytics.

---

## 💻 Setup & Execution Instructions

This project is designed to be deployed directly to Zoho Catalyst.

### Prerequisites
- Node.js (v18+)
- Zoho Catalyst CLI installed globally (`npm install -g zcatalyst-cli`)
- A Zoho Catalyst account

### 1. Local Development Setup
Clone the repository and install frontend dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/KSP_datathon.git
cd KSP_datathon/frontend
npm install
npm run dev
```
*The frontend will run locally on `localhost:3000`.*

### 2. Catalyst Backend Deployment
To deploy the Python Advanced I/O functions to Zoho Catalyst:
```bash
# Navigate to the project root
cd KSP_datathon

# Login to Catalyst
catalyst login

# Deploy the functions
catalyst deploy --only functions
```

### 3. Catalyst Frontend (Slate) Deployment
To build and deploy the Next.js frontend:
```bash
cd KSP_datathon/frontend
npm run build

# Zip the contents of the 'out' directory
# Upload the zip file directly to the Catalyst Slate console.
```

---

## 🔮 Future Roadmap

While this prototype delivers core AI and Network Analysis capabilities, our production roadmap includes:
1. **Financial Crime Analysis:** Integrating banking APIs to visualize "Money Trails" and flag suspicious crypto/UPI transactions.
2. **Explainable AI (RAG):** Migrating to the full Zoho Catalyst RAG pipeline so every AI response includes clickable, auditable citations (e.g., *“Source: FIR/2026/089, Page 2”*).
3. **Live CCTNS Webhooks:** Transitioning from static dataset ingestion to live, bi-directional API integration with the state CCTNS system.

---
*Developed for the KSP Datathon 2026. "Safer Karnataka through Data."*
