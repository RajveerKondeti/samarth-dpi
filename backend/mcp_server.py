import os
import sqlite3
import sys
import chromadb
from fastmcp import FastMCP
import pandas as pd

mcp = FastMCP("India_DPI_Database")

# FORCE absolute path to the database so all scripts look at the same file
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "india_dpi.db")

def log_terminal(message: str):
  sys.stderr.write(f"🟢 [DPI MCP SERVER] {message}\n")
  sys.stderr.flush()

def initialize_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. LIVE CITIZEN GRIEVANCE TABLE
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS citizen_complaints (
            complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
            citizen_id TEXT NOT NULL,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            urgency_score REAL DEFAULT 0.5,
            status TEXT DEFAULT 'REGISTERED',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Check if the heavy data is already loaded to speed up boot times!
    cursor.execute("SELECT count(name) FROM sqlite_master WHERE type='table' AND name='secc_district_data'")
    if cursor.fetchone()[0] > 0:
        log_terminal(f"Database already populated at {DB_PATH}. Skipping heavy CSV ingestion.")
        conn.commit()
        conn.close()
        return

    log_terminal("Starting initial heavy data ingestion (this will take a few minutes)...")
    dataset_map = {
        "datasets/socio-economic-caste-census-2011.csv": "secc_district_data",
        "datasets/nafis.csv": "nafis_state_data",
        "datasets/employment-generated.csv": "mgnrega_employment",
        "datasets/basic-details-of-schools.csv": "education_infra",
        "datasets/census-household-amenities.csv": "household_amenities",
        "datasets/cgwb-changes-in-depth-to-water-level.csv": "groundwater_levels",
        "datasets/daily-rainfall-data-district-level.csv": "climate_rainfall",
        "datasets/districtwise-ipc-crimes-2017-onwards.csv": "crime_ipc",
        "datasets/major-health-indicators-subdistrict-level.csv": "health_indicators",
        "datasets/pds-district-wise-monthly-wheat-and-rice.csv": "pds_food_security",
        "datasets/pashu-aadhaar-registrations.csv": "livestock_registrations"
    }

    for filepath, table_name in dataset_map.items():
        full_path = os.path.join(os.path.dirname(__file__), filepath)
        if os.path.exists(full_path):
            try:
                df = pd.read_csv(full_path, low_memory=False)
                df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
                df.to_sql(table_name, conn, if_exists="replace", index=False)
                log_terminal(f"Successfully loaded {filepath} into table '{table_name}'")
            except Exception as e:
                log_terminal(f"Error loading {filepath}: {e}")
        else:
            log_terminal(f"Skipped {filepath} - File not found.")

    conn.commit()
    conn.close()

# Always run this; it will exit instantly if already populated.
initialize_database()
# Vector RAG Initialization
chroma_client = chromadb.PersistentClient(path="./chroma_db")
policy_collection = chroma_client.get_or_create_collection(
    name="government_policies"
)

# MCP TOOLS
# 1. Dynamic Admin Upload Handler
@mcp.tool
def admin_upload_policy_document(
    doc_id: str, title: str, content: str, ministry: str
) -> str:
  """Dynamic Ingestion Handler: Allows admins or government officials to upload

  and vectorize new policy PDFs, guidelines, or state circulars live without
  restarting the system.
  """
  policy_collection.upsert(
      documents=[content],
      metadatas=[{"title": title, "ministry": ministry}],
      ids=[doc_id],
  )
  log_terminal(
      f"Admin Ingested New Document: '{title}' under Ministry: {ministry}"
  )
  return (
      f"Successfully vectorized and stored document '{title}' (ID: {doc_id}) into"
      " ChromaDB RAG."
  )


# 2. Live Citizen Complaint Registration
@mcp.tool
def register_citizen_complaint(citizen_id: str, state: str, district: str, category: str, description: str) -> dict:
  conn = sqlite3.connect(DB_PATH)  # Use absolute path
  cursor = conn.cursor()

  cursor.execute("SELECT SUM(landless_hh_manual_labor), SUM(tot_hh) FROM secc_district_data WHERE district_name = ? COLLATE NOCASE", (district,))
  row = cursor.fetchone()

  base_urgency = 0.5
  if row and row[1] and row[1] > 0:
    base_urgency = round(0.5 + ((row[0] / row[1]) * 0.5), 2)

  cursor.execute(
      "INSERT INTO citizen_complaints (citizen_id, state, district, category, description, urgency_score) VALUES (?, ?, ?, ?, ?, ?)",
      (citizen_id, state, district, category, description, base_urgency)
  )
  complaint_id = cursor.lastrowid
  conn.commit()
  conn.close()

  log_terminal(f"New Complaint #{complaint_id} registered for District: {district}")
  return {"status": "SUCCESS", "complaint_id": complaint_id, "assigned_priority_score": base_urgency}


# 3. Citizen View (State-Bounded Scoped Queries)
@mcp.tool
def citizen_query_grievances(state: str, citizen_id: str = None) -> list[dict]:
  """Citizen Persona View: Enforces geographic constraints.

  Citizens can only query grievances registered within their own state border or
  their specific citizen_id.
  """
  conn = sqlite3.connect("india_dpi.db")
  cursor = conn.cursor()

  if citizen_id:
    cursor.execute(
        """
            SELECT complaint_id, district, category, description, status, urgency_score, timestamp 
            FROM citizen_complaints 
            WHERE state = ? AND citizen_id = ?
        """,
        (state, citizen_id),
    )
  else:
    cursor.execute(
        """
            SELECT complaint_id, district, category, description, status, urgency_score, timestamp 
            FROM citizen_complaints 
            WHERE state = ? ORDER BY timestamp DESC LIMIT 20
        """,
        (state,),
    )

  rows = cursor.fetchall()
  conn.close()

  return [
      {
          "complaint_id": r[0],
          "district": r[1],
          "category": r[2],
          "description": r[3],
          "status": r[4],
          "urgency_score": r[5],
          "timestamp": r[6],
      }
      for r in rows
  ]


# 4. Chief Minister Persona View (State Dashboard)
@mcp.tool
def get_cm_state_dashboard(state_name: str) -> dict:
  """Chief Minister Persona View: Aggregates state-wide complaints by district,

  identifies hot-spots, and cross-references state financial indices.
  """
  conn = sqlite3.connect("india_dpi.db")
  cursor = conn.cursor()

  cursor.execute(
      """
        SELECT district, COUNT(*), AVG(urgency_score) 
        FROM citizen_complaints 
        WHERE state = ? COLLATE NOCASE 
        GROUP BY district ORDER BY COUNT(*) DESC
    """,
      (state_name,),
  )
  district_summary = cursor.fetchall()

  cursor.execute(
      """
        SELECT avg_saving_yr, hh_income_monthly, prop_hh_indebt 
        FROM nafis_state_data 
        WHERE state_name = ? COLLATE NOCASE
    """,
      (state_name,),
  )
  financials = cursor.fetchone()
  conn.close()

  return {
      "state": state_name,
      "total_districts_affected": len(district_summary),
      "district_grievance_hotspots": [
          {
              "district": d[0],
              "total_complaints": d[1],
              "avg_urgency_score": round(d[2], 2),
          }
          for d in district_summary
      ],
      "state_financial_health": {
          "avg_monthly_income": financials[1] if financials else "N/A",
          "indebtedness_percent": financials[2] if financials else "N/A",
      },
  }


# 5. Prime Minister Persona View (National Macro Summary)
@mcp.tool
def get_pm_national_dashboard() -> dict:
  """Prime Minister Persona View: Scans all 36 States/UTs, ranks the top 5 national

  infrastructure complaint hotspots, and synthesizes overall national demand.
  """
  conn = sqlite3.connect("india_dpi.db")
  cursor = conn.cursor()

  cursor.execute("""
        SELECT state, district, category, COUNT(*) as volume, AVG(urgency_score) as priority
        FROM citizen_complaints
        GROUP BY state, district, category
        ORDER BY priority DESC, volume DESC
        LIMIT 5
    """)
  top_hotspots = cursor.fetchall()

  cursor.execute("SELECT COUNT(*) FROM citizen_complaints")
  total_national_complaints = cursor.fetchone()[0]
  conn.close()

  return {
      "national_total_complaints": total_national_complaints,
      "top_priority_national_hotspots": [
          {
              "state": h[0],
              "district": h[1],
              "category": h[2],
              "complaint_volume": h[3],
              "computed_urgency_score": round(h[4], 2),
          }
          for h in top_hotspots
      ],
  }


# RAG Policy Search
@mcp.tool
def search_government_policies(query: str) -> list[str]:
  """Queries vector DB for policy frameworks."""
  results = policy_collection.query(query_texts=[query], n_results=2)
  return results["documents"][0] if results["documents"] else []

@mcp.tool
def get_360_district_profile(district_name: str, state_name: str) -> dict:
    """Pulls cross-functional data (Poverty, Health, Water, Crime, Education) for a district."""
    conn = sqlite3.connect("india_dpi.db")
    
    # Use pandas to safely query the SQLite tables
    profile = {"district": district_name, "state": state_name}
    
    try:
        # 1. Poverty & Amenities (SECC & Census)
        secc = pd.read_sql("SELECT SUM(tot_hh) as total_hh, SUM(landless_hh_manual_labor) as landless FROM secc_district_data WHERE district_name = ?", conn, params=(district_name,))
        if not secc.empty:
            profile["poverty_stats"] = secc.to_dict('records')[0]

        # 2. Water Security (Groundwater Levels)
        water = pd.read_sql("SELECT AVG(currentlevel) as avg_water_depth, AVG(level_diff) as depletion_rate FROM groundwater_levels WHERE district_name = ?", conn, params=(district_name,))
        if not water['avg_water_depth'].isnull().all():
            profile["water_security"] = water.to_dict('records')[0]

        # 3. Public Health (Infant mortality, Institutional deliveries)
        health = pd.read_sql("SELECT SUM(inst_deliv_48h_disch) as institutional_deliveries, SUM(child_bcg) as immunizations FROM health_indicators WHERE district_name = ?", conn, params=(district_name,))
        if not health['institutional_deliveries'].isnull().all():
            profile["public_health"] = health.to_dict('records')[0]

        # 4. Employment Demand (MGNREGA)
        jobs = pd.read_sql("SELECT SUM(emp_demand_pers) as total_job_demand, SUM(emp_avail_pers) as total_jobs_provided FROM mgnrega_employment WHERE district_name = ?", conn, params=(district_name,))
        if not jobs['total_job_demand'].isnull().all():
            profile["employment_safety_net"] = jobs.to_dict('records')[0]

    except Exception as e:
        profile["database_error"] = str(e)
        
    conn.close()
    return profile

if __name__ == "__main__":
  log_terminal("Starting FastMCP Server on stdio transport...")
  mcp.run()