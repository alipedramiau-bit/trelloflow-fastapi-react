"""
TrelloFlow Backend Entry Point
Runs FastAPI application on port 6000
"""
import sys
import os
import uvicorn

# Ensure current directory is on path
sys.path.insert(0, os.path.dirname(__file__))
from server import app

if __name__ == "__main__":
    port = 6000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1].replace("--port=", ""))
        except ValueError:
            pass
    print("=" * 60, flush=True)
    print(f"🚀 TrelloFlow FastAPI Server running on http://0.0.0.0:{port}", flush=True)
    print(f"📚 Swagger Interactive Docs : http://0.0.0.0:{port}/api/docs", flush=True)
    print("🔑 Admin Credentials        : Username: AdminParsa | Password: Parsa@1405", flush=True)
    print("=" * 60, flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
