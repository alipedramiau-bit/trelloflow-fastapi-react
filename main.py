"""
TrelloFlow Main Entry Point
Runs FastAPI backend on port 6000 and Vite frontend on port 6100
"""
import sys
import os
import subprocess
import signal
import time
import argparse
import socket
import uvicorn

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
from server import app

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0

def start_vite_frontend(port: int = 6100):
    if is_port_in_use(port):
        print(f"ℹ️  Frontend already running on http://0.0.0.0:{port}", flush=True)
        return None
    frontend_dir = os.path.join(os.path.dirname(__file__), "front-end")
    cwd = frontend_dir if os.path.isdir(frontend_dir) else os.path.dirname(__file__)
    print(f"🌐 Launching Vite frontend on http://0.0.0.0:{port} from {os.path.basename(cwd)}...", flush=True)
    try:
        proc = subprocess.Popen(
            ["npx", "vite", f"--port={port}", "--host=0.0.0.0"],
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )
        return proc
    except Exception as e:
        print(f"⚠️  Could not launch Vite frontend automatically: {e}", flush=True)
        return None

def main():
    parser = argparse.ArgumentParser(description="TrelloFlow Runner")
    parser.add_argument("--backend-port", type=int, default=6000, help="Backend port (default: 6000)")
    parser.add_argument("--frontend-port", type=int, default=6100, help="Frontend port (default: 6100)")
    parser.add_argument("--backend-only", action="store_true", help="Only run FastAPI backend")
    args, unknown = parser.parse_known_args()

    backend_port = args.backend_port
    frontend_port = args.frontend_port

    print("=" * 65, flush=True)
    print("🚀 TrelloFlow Full-Stack Application", flush=True)
    print(f"📍 Backend (FastAPI + Uvicorn) : http://0.0.0.0:{backend_port}", flush=True)
    print(f"📚 Swagger API Documentation    : http://0.0.0.0:{backend_port}/api/docs", flush=True)
    print(f"🔑 Admin Credentials          : Username: AdminParsa | Password: Parsa@1405", flush=True)

    vite_proc = None
    if not args.backend_port or not args.backend_only:
        vite_proc = start_vite_frontend(frontend_port)
        if vite_proc:
            print(f"📍 Frontend (Vite + React)     : http://0.0.0.0:{frontend_port}", flush=True)
    print("=" * 65, flush=True)

    def cleanup(sig=None, frame=None):
        print("\n🛑 Shutting down TrelloFlow...", flush=True)
        if vite_proc:
            try:
                vite_proc.terminate()
                vite_proc.wait(timeout=3)
            except Exception:
                try:
                    vite_proc.kill()
                except Exception:
                    pass
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    try:
        uvicorn.run(app, host="0.0.0.0", port=backend_port, log_level="info")
    finally:
        cleanup()

if __name__ == "__main__":
    main()
