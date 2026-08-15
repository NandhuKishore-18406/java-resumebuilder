#!/usr/bin/env python3
"""
Single Command Launcher for Academic Resume Builder & PyPortfolio Platform
---------------------------------------------------------------------------
Launches Spring Boot backend (port 8080) and Next.js frontend (port 3000),
cleans stale port conflicts, monitors readiness, and opens your browser.

Usage:
  python3 run_app.py
"""

import os
import sys
import time
import socket
import signal
import subprocess
import webbrowser
from pathlib import Path

# Color definitions for terminal output
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "demo-fixed"
FRONTEND_DIR = ROOT_DIR / "javaprog" / "frontend"

processes = []

def log(msg, color=BLUE):
    print(f"{color}{BOLD}[Launcher]{RESET} {msg}")

def check_port(port):
    """Check if a port is actively listening."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(("127.0.0.1", port)) == 0

def kill_port_process(port):
    """Free port if occupied by a stale process."""
    if check_port(port):
        log(f"Port {port} is occupied. Attempting to free port...", YELLOW)
        try:
            subprocess.run(["fuser", "-k", f"{port}/tcp"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(1)
        except Exception:
            pass

def wait_for_port(port, timeout=45):
    """Wait for a port to become ready."""
    start = time.time()
    while time.time() - start < timeout:
        if check_port(port):
            return True
        time.sleep(1)
    return False

def cleanup(signum=None, frame=None):
    """Graceful termination of sub-processes."""
    log("Shutting down processes...", YELLOW)
    for p in processes:
        if p.poll() is None:
            try:
                p.terminate()
                p.wait(timeout=3)
            except Exception:
                p.kill()
    log("Application stopped cleanly.", GREEN)
    sys.exit(0)

def main():
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    print(f"\n{GREEN}{BOLD}======================================================{RESET}")
    print(f"{GREEN}{BOLD}   Academic Resume Builder & PyPortfolio Launcher     {RESET}")
    print(f"{GREEN}{BOLD}======================================================{RESET}\n")

    # 1. Verify project directories exist
    if not BACKEND_DIR.exists():
        log(f"Backend directory not found at {BACKEND_DIR}", RED)
        sys.exit(1)
    if not FRONTEND_DIR.exists():
        log(f"Frontend directory not found at {FRONTEND_DIR}", RED)
        sys.exit(1)

    # 2. Clear stale port conflicts
    kill_port_process(8080)
    kill_port_process(3000)

    # 3. Launch Spring Boot Backend
    log("Starting Spring Boot Backend (Port 8080)...", BLUE)
    mvn_wrapper = "./mvnw" if (BACKEND_DIR / "mvnw").exists() else "mvn"
    backend_cmd = [mvn_wrapper, "spring-boot:run"]
    
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=BACKEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(backend_proc)

    # 4. Launch Next.js Frontend
    log("Starting Next.js Frontend (Port 3000)...", BLUE)
    frontend_cmd = ["npx", "pnpm", "dev"]
    
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=FRONTEND_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    processes.append(frontend_proc)

    # 5. Monitor Port Readiness
    log("Waiting for backend and frontend services to become ready...", YELLOW)
    backend_ready = wait_for_port(8080, timeout=30)
    frontend_ready = wait_for_port(3000, timeout=20)

    if backend_ready:
        log("Backend is READY on http://localhost:8080", GREEN)
    else:
        log("Backend startup timed out. Check backend logs.", RED)

    if frontend_ready:
        log("Frontend is READY on http://localhost:3000", GREEN)
    else:
        log("Frontend startup timed out. Check frontend logs.", RED)

    if backend_ready and frontend_ready:
        print(f"\n{GREEN}{BOLD}🚀 Application launched successfully!{RESET}")
        print(f"{BLUE}{BOLD}🌐 Opening http://localhost:3000 in your browser...{RESET}\n")
        webbrowser.open("http://localhost:3000")

    print(f"{YELLOW}Press Ctrl+C at any time to stop both servers.{RESET}\n")

    # Stream logs or keep alive until Ctrl+C
    try:
        while True:
            time.sleep(1)
            # Check if any process terminated unexpectedly
            for p in processes:
                if p.poll() is not None:
                    log(f"Process {p.args} exited with code {p.returncode}", RED)
                    cleanup()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
