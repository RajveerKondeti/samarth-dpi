# 🇮🇳 SAMARTH DPI — National AI Governance Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini%202.5-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6600?style=for-the-badge&logo=database&logoColor=white)

**SAMARTH DPI** is a next-generation AI Command Center that transitions public administration from static, reactive dashboards to proactive, conversational AI Copilots. Powered by **Google Gemini 2.5 Flash** and **FastMCP**, SAMARTH DPI dynamically cross-references massive cross-functional government datasets (Water, Employment, Poverty, Health, Crime) to deliver instant, multi-ministerial policy directives.

---

## ✨ Key Features

* **Public Grievance Portal:** Citizens log grievances with auto-calculated Urgency Scores derived from real-time district poverty indices (SECC).
* **Chief Minister (CM) Command Center:** State-bounded AI Assistant enforced with strict **Role-Based Access Control (RBAC)** to prevent cross-state data leakage.
* **Prime Minister (PM) National Intelligence:** Unrestricted macro-level copilot capable of synthesizing multi-dataset correlations across all 36 States/UTs.
* **Vector Policy RAG:** Automatically matches data anomalies against official government policy circulars stored in **ChromaDB** to output legal, actionable directives.
* **Anti-Hallucination Guardrails:** Strict relational grounding ensures queries for non-existent geographies (e.g., "Gotham") are cleanly rejected.

---

## 🏗️ Architecture Overview

```text
 ┌──────────────────────────────────────────────────────────┐
 │                  React Frontend (Vite)                   │
 │       (Citizen Portal | CM Portal | PM Portal)           │
 └────────────────────────────┬─────────────────────────────┘
                              │ REST API / POST /api/chat
 ┌────────────────────────────▼─────────────────────────────┐
 │               FastAPI REST Bridge (server.py)            │
 └──────────────┬────────────────────────────┬──────────────┘
                │                            │
      State Scoped (CM)             National Scoped (PM)
 ┌──────────────▼─────────────┐    ┌─────────▼──────────────┐
 │  CM State Agent (Gemini)   │    │ PM National Agent      │
 │  - Bounded by State RBAC   │    │ - 360° District Profile│
 │  - Hard-blocks non-state   │    │ - Policy Vector RAG    │
 └──────────────┬─────────────┘    └─────────┬──────────────┘
                │                            │
                └─────────────┬──────────────┘
                              │
               ┌──────────────▼──────────────┐
               │    FastMCP Server (SQLite)  │
               └─────────────────────────────┘
```

---

## 📊 Integrated Datasets (Open Government Data)

* **Socio-Economic Caste Census (SECC 2011)** — District Poverty & Deprivation Metrics
* **Central Ground Water Board (CGWB)** — Groundwater Depletion & Depth Changes
* **MGNREGA Employment** — Rural Job Demand & Man-days Generated
* **NAFIS Data** — State Household Income & Indebtedness Percentages
* **Public Health Indicators** — Institutional Deliveries & Child Immunization
* **School Infrastructure** — Functional Toilets & Basic Amenities
* **IPC Crime Statistics** — District-wise Property Crimes & Theft Rates
* **PDS Distribution** — Monthly Food Grain Allocations

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+ & npm
* Google Gemini API Key

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your Gemini API Key
echo GEMINI_API_KEY="your_google_gemini_api_key_here" > .env

# Run mcp_server.py once to initialize SQLite database & ChromaDB vector embeddings
python mcp_server.py

# Start the FastAPI REST Bridge
python server.py
```

The FastAPI server will start on `http://127.0.0.1:5000`.

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install node packages
npm install

# Start Vite development server
npm run dev
```

The React frontend will be live on `http://localhost:5173`.

---

## 🧪 Demo Scenarios & Stress Tests

### 1. Cross-Functional Intelligence (PM Copilot)
> "Analyze Ananthapuramu, Andhra Pradesh. Calculate the exact correlation between its recent groundwater depletion rates (CGWB data), drops in Kharif crop yields, and the current spike in MGNREGA manual labor demands. Which specific Jal Jeevan or PMGSY policies should we trigger to mitigate this?"

### 2. Role-Based Access Control (CM Copilot)
Set State context to **Andhra Pradesh** and run:
> "I need to query the status and urgency scores of all citizen grievances filed in Maharashtra and Delhi."

**Result:** ⛔ `ACCESS DENIED: Chief Minister RBAC limits you to Andhra Pradesh.`

### 3. Anti-Hallucination Test (PM Copilot)
> "Give me a 360-degree vulnerability assessment for the district of Gotham in the state of Maharashtra. Tell me what their MGNREGA demand is."

**Result:** The system cleanly rejects the query and states the district does not exist in the database.

---

## 🛠 Tech Stack

* **Frontend:** React 18, Tailwind CSS v4, Lucide Icons, Vite
* **Backend:** FastAPI, Uvicorn, Python-dotenv
* **Agentic Framework:** Google Agent Development Kit (ADK), FastMCP
* **LLM:** Google Gemini 2.5 Flash
* **Databases:** SQLite3 (Relational Data), ChromaDB (Vector Search)

---

## 📜 License

This project is open-source and developed for hackathon demonstration purposes under the **MIT License**.