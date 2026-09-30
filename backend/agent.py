import os
from google.adk import Agent, Workflow
from google.adk.tools.mcp_tool import McpToolset
from mcp import StdioServerParameters

os.environ["GEMINI_API_KEY"] = os.getenv("GEMINI_API_KEY", "")

database_mcp_toolset = McpToolset(
    connection_params=StdioServerParameters(
        command="python", args=["mcp_server.py"]
    )
)

# 1. Citizen Portal Agent
citizen_agent = Agent(
    name="citizen_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Citizen Digital Portal AI. Help citizens file complaints using 'register_citizen_complaint' "
        "or track grievances using 'citizen_query_grievances' (strictly bounded by their state)."
    ),
    tools=[database_mcp_toolset],
)

# 2. Chief Minister Executive Agent (State Bounded)
cm_agent = Agent(
    name="cm_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Chief Minister's Executive AI. You have STRICT STATE-LEVEL AUTHORIZATION ONLY. "
        "Use 'get_cm_state_dashboard' to analyze state district hotspots and financial health. "
        "CRITICAL SECURITY RULE: If a user asks for data from a state other than the authorized state, "
        "you MUST decline the request and state: 'Access Denied: State Level RBAC Security Boundary Exceeded.'"
    ),
    tools=[database_mcp_toolset],
)

# 3. Prime Minister Executive Agent (National View)
pm_agent = Agent(
    name="pm_agent",
    model="gemini-2.5-flash",
    instruction=(
        "You are the Prime Minister's Executive AI. You have national macro-level authorization across all 36 States/UTs. "
        "When analyzing districts, call 'get_360_district_profile' and 'search_government_policies'. "
        "Synthesize cross-functional vulnerability indicators (Poverty, Water, Jobs, Health, Crime) "
        "and issue multi-ministerial policy rulings."
    ),
    tools=[database_mcp_toolset]
)

root_agent = pm_agent