#!/usr/bin/env python3
"""
Single Command Launcher for Academic Resume Builder & PyPortfolio Platform
---------------------------------------------------------------------------
1. Checks and starts PostgreSQL service if stopped.
2. Checks PostgreSQL database (demo_db) and user privileges.
3. Verifies and auto-creates database tables using schema.sql if missing.
4. Cleans up stale port conflicts (8080 & 3000).
5. Launches Spring Boot backend & Next.js frontend concurrently.
6. Opens the web application in your default browser.

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
SCHEMA_SQL_PATH = BACKEND_DIR / "src" / "main" / "resources" / "schema.sql"

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
        log(f"Port {port} is occupied. Freeing port...", YELLOW)
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

def ensure_postgresql_service():
    """Ensure PostgreSQL service is active on port 5432."""
    if check_port(5432):
        log("PostgreSQL service is running on port 5432.", GREEN)
        return True

    log("PostgreSQL port 5432 is inactive. Attempting to start PostgreSQL service...", YELLOW)
    try:
        subprocess.run(["sudo", "systemctl", "start", "postgresql"], check=False)
    except Exception:
        try:
            subprocess.run(["sudo", "service", "postgresql", "start"], check=False)
        except Exception:
            pass

    if wait_for_port(5432, timeout=10):
        log("PostgreSQL service started successfully.", GREEN)
        return True
    else:
        log("Could not start PostgreSQL automatically on port 5432. Please verify PostgreSQL service.", RED)
        return False

def ensure_database_and_tables():
    """Check and auto-create database demo_db, user javaproj, and schema tables."""
    log("Verifying PostgreSQL database 'demo_db' and tables...", BLUE)

    # 1. Check if psql is installed
    try:
        subprocess.run(["psql", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception:
        log("psql CLI tool not found. Spring Boot will handle table creation on startup.", YELLOW)
        return

    # 2. Check if user javaproj and database demo_db exist
    check_db_cmd = ["psql", "-U", "javaproj", "-d", "demo_db", "-h", "localhost", "-p", "5432", "-c", "\\dt"]
    env = os.environ.copy()
    env["PGPASSWORD"] = "Javaproj123"

    res = subprocess.run(check_db_cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if res.returncode != 0:
        log("Database 'demo_db' or user 'javaproj' requires initialization. Running setup commands...", YELLOW)
        init_sql = """
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'javaproj') THEN
                CREATE ROLE javaproj WITH LOGIN PASSWORD 'Javaproj123';
            END IF;
        END
        $$;
        SELECT 'CREATE DATABASE demo_db OWNER javaproj'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'demo_db')\\gexec
        GRANT ALL ON SCHEMA public TO javaproj;
        """
        try:
            subprocess.run(["sudo", "-u", "postgres", "psql", "-c", init_sql], check=False)
        except Exception:
            pass

    # 3. Check table existence
    tables_cmd = ["psql", "-U", "javaproj", "-d", "demo_db", "-h", "localhost", "-p", "5432", "-t", "-c", "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';"]
    tables_res = subprocess.run(tables_cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    table_count = 0
    if tables_res.returncode == 0 and tables_res.stdout.strip().isdigit():
        table_count = int(tables_res.stdout.strip())

    if table_count < 6 and SCHEMA_SQL_PATH.exists():
        log(f"Tables missing (found {table_count}/6). Executing schema.sql to create database tables...", YELLOW)
        exec_schema_cmd = ["psql", "-U", "javaproj", "-d", "demo_db", "-h", "localhost", "-p", "5432", "-f", str(SCHEMA_SQL_PATH)]
        exec_res = subprocess.run(exec_schema_cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        if exec_res.returncode == 0:
            log("All PostgreSQL database tables created successfully from schema.sql!", GREEN)
        else:
            log("Spring Boot spring.sql.init will auto-create missing tables on startup.", YELLOW)
    else:
        log("PostgreSQL database tables verified OK.", GREEN)

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

    # 2. Ensure PostgreSQL service is running & database tables exist
    ensure_postgresql_service()
    ensure_database_and_tables()

    # 3. Clear stale port conflicts
    kill_port_process(8080)
    kill_port_process(3000)

    # 4. Launch Spring Boot Backend
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

    # 5. Launch Next.js Frontend
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

    # 6. Monitor Port Readiness
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
            for p in processes:
                if p.poll() is not None:
                    log(f"Process {p.args} exited with code {p.returncode}", RED)
                    cleanup()
    except KeyboardInterrupt:
        cleanup()

if __name__ == "__main__":
    main()
