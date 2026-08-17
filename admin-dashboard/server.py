#!/usr/bin/env python3
"""
Simple PostgreSQL DB Admin & CRUD Server
Uses Python's built-in http.server (No framework needed!)
"""

import json
import os
import re
import subprocess
import time
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path

PORT = 8090
DIR = Path(__file__).parent.resolve()

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", "5432")
DB_NAME = os.environ.get("DB_NAME", "demo_db")
DB_USER = os.environ.get("DB_USER", "javaproj")
DB_PASS = os.environ.get("DB_PASSWORD", "Javaproj123")

TABLES = ["users", "profiles", "certificates", "seminars", "files", "resume_history"]


def run_psql(query):
    """Execute SQL query using psql CLI and return output."""
    env = os.environ.copy()
    env["PGPASSWORD"] = DB_PASS
    cmd = [
        "psql",
        "-U", DB_USER,
        "-d", DB_NAME,
        "-h", DB_HOST,
        "-p", DB_PORT,
        "-t", "-A",
        "-c", query
    ]
    res = subprocess.run(cmd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        raise Exception(res.stderr.strip() or "Database query failed")
    return res.stdout.strip()


def run_json_query(sql):
    """Wrap SELECT SQL to return clean JSON array string."""
    clean_sql = sql.rstrip(";").strip()
    wrapped_sql = f"SELECT coalesce(json_agg(t), '[]'::json) FROM ({clean_sql}) t;"
    out = run_psql(wrapped_sql)
    return json.loads(out) if out else []


class ReusableHTTPServer(HTTPServer):
    allow_reuse_address = True


class AdminHandler(BaseHTTPRequestHandler):

    def send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, file_path, content_type='text/html; charset=utf-8'):
        if not file_path.exists():
            self.send_json({"error": "File not found"}, status=404)
            return
        content = file_path.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            self.send_file(DIR / "index.html", "text/html; charset=utf-8")
            return

        if path == "/api/overview":
            try:
                stats = {}
                for t in TABLES:
                    count_res = run_psql(f"SELECT count(*) FROM {t};")
                    stats[t] = int(count_res) if count_res.isdigit() else 0

                db_info = {
                    "database": DB_NAME,
                    "host": DB_HOST,
                    "port": DB_PORT,
                    "user": DB_USER,
                    "status": "Connected",
                    "tables": stats
                }
                self.send_json(db_info)
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        if path.startswith("/api/data/"):
            table_name = path.replace("/api/data/", "").strip("/")
            if table_name not in TABLES:
                self.send_json({"error": "Invalid table name"}, status=400)
                return
            try:
                rows = run_json_query(f"SELECT * FROM {table_name} ORDER BY id DESC LIMIT 200")
                self.send_json({"table": table_name, "count": len(rows), "data": rows})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        if path.startswith("/api/schema/"):
            table_name = path.replace("/api/schema/", "").strip("/")
            if table_name not in TABLES:
                self.send_json({"error": "Invalid table name"}, status=400)
                return
            try:
                cols = run_json_query(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='{table_name}'")
                self.send_json({"table": table_name, "columns": cols})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        self.send_json({"error": "Endpoint not found"}, status=404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        raw_data = self.rfile.read(length) if length > 0 else b'{}'

        try:
            payload = json.loads(raw_data.decode('utf-8'))
        except Exception:
            payload = {}

        if path == "/api/query":
            sql_query = payload.get("query", "").strip()
            if not sql_query:
                self.send_json({"error": "Query is required"}, status=400)
                return
            if not re.match(r'^(SELECT|WITH|EXPLAIN)', sql_query, re.IGNORECASE):
                self.send_json({"error": "Only SELECT or read-only queries allowed in custom SQL runner"}, status=400)
                return
            try:
                rows = run_json_query(sql_query)
                self.send_json({"data": rows, "count": len(rows)})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        if path.startswith("/api/data/"):
            table_name = path.replace("/api/data/", "").strip("/")
            if table_name not in TABLES:
                self.send_json({"error": "Invalid table name"}, status=400)
                return
            try:
                columns = [k for k in payload.keys() if k != "id"]
                if not columns:
                    self.send_json({"error": "No columns provided for insert"}, status=400)
                    return

                col_str = ", ".join(columns)
                val_placeholders = []
                for c in columns:
                    val = payload[c]
                    if val is None or str(val).strip() == "":
                        val_placeholders.append("NULL")
                    elif isinstance(val, (dict, list)):
                        val_placeholders.append(f"'{json.dumps(val)}'::jsonb")
                    elif isinstance(val, bool):
                        val_placeholders.append("TRUE" if val else "FALSE")
                    elif isinstance(val, (int, float)):
                        val_placeholders.append(str(val))
                    else:
                        escaped = str(val).replace("'", "''")
                        val_placeholders.append(f"'{escaped}'")

                val_str = ", ".join(val_placeholders)
                insert_sql = f"INSERT INTO {table_name} ({col_str}) VALUES ({val_str}) RETURNING id;"
                res_id = run_psql(insert_sql)
                self.send_json({"success": True, "id": res_id, "message": f"Inserted row into {table_name}"})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        self.send_json({"error": "Endpoint not found"}, status=404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        raw_data = self.rfile.read(length) if length > 0 else b'{}'

        try:
            payload = json.loads(raw_data.decode('utf-8'))
        except Exception:
            payload = {}

        parts = [p for p in path.split("/") if p]
        if len(parts) == 4 and parts[0] == "api" and parts[1] == "data":
            table_name = parts[2]
            record_id = parts[3]

            if table_name not in TABLES or not record_id.isdigit():
                self.send_json({"error": "Invalid table or ID"}, status=400)
                return

            try:
                set_clauses = []
                for k, v in payload.items():
                    if k == "id":
                        continue
                    if v is None or (isinstance(v, str) and v.strip() == "" and k != "password"):
                        set_clauses.append(f"{k} = NULL")
                    elif isinstance(v, (dict, list)):
                        set_clauses.append(f"{k} = '{json.dumps(v)}'::jsonb")
                    elif isinstance(v, bool):
                        set_clauses.append(f"{k} = {'TRUE' if v else 'FALSE'}")
                    elif isinstance(v, (int, float)):
                        set_clauses.append(f"{k} = {v}")
                    else:
                        escaped = str(v).replace("'", "''")
                        set_clauses.append(f"{k} = '{escaped}'")

                if not set_clauses:
                    self.send_json({"error": "No fields to update"}, status=400)
                    return

                update_sql = f"UPDATE {table_name} SET {', '.join(set_clauses)} WHERE id = {record_id};"
                run_psql(update_sql)
                self.send_json({"success": True, "message": f"Updated row {record_id} in {table_name}"})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        self.send_json({"error": "Endpoint not found"}, status=404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        parts = [p for p in path.split("/") if p]

        if len(parts) == 4 and parts[0] == "api" and parts[1] == "data":
            table_name = parts[2]
            record_id = parts[3]

            if table_name not in TABLES or not record_id.isdigit():
                self.send_json({"error": "Invalid table or ID"}, status=400)
                return

            try:
                run_psql(f"DELETE FROM {table_name} WHERE id = {record_id};")
                self.send_json({"success": True, "message": f"Deleted row {record_id} from {table_name}"})
            except Exception as e:
                self.send_json({"error": str(e)}, status=500)
            return

        self.send_json({"error": "Endpoint not found"}, status=404)


def free_port(port):
    """Free port if occupied by a stale process."""
    try:
        subprocess.run(["fuser", "-k", f"{port}/tcp"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        time.sleep(0.5)
    except Exception:
        pass


def main():
    try:
        server = ReusableHTTPServer(('0.0.0.0', PORT), AdminHandler)
    except OSError as e:
        if e.errno == 98:
            print(f"Port {PORT} is currently occupied. Auto-freeing port...")
            free_port(PORT)
            server = ReusableHTTPServer(('0.0.0.0', PORT), AdminHandler)
        else:
            raise e

    print(f"\n==================================================")
    print(f"🚀 Admin Database CRUD Server running on port {PORT}")
    print(f"🌐 Open http://localhost:{PORT} in your browser")
    print(f"==================================================\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down admin server...")
        server.server_close()


if __name__ == "__main__":
    main()
