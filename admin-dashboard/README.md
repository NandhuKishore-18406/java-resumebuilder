# Database Admin & CRUD Portal

A standalone, lightweight Database Admin Portal and CRUD management interface for the PostgreSQL database (`demo_db`).

## Features
- **Zero Heavy Framework Dependencies**: Uses Python's built-in `http.server` standard library and standard Vanilla HTML/CSS/JS frontend.
- **Database Overview & Metrics**: Real-time record counts for all tables (`users`, `profiles`, `certificates`, `seminars`, `files`, `resume_history`).
- **Full CRUD Capabilities**:
  - **Create**: Add new records to any table using dynamically generated schema forms.
  - **Read & Filter**: Search, filter, and inspect records in a dark glassmorphic data table.
  - **Update**: Edit existing table records directly with pre-populated field modals.
  - **Delete**: Safely delete table entries with confirmation modals.
- **Raw JSON Inspector**: Inspect JSONB columns (`education`, `projects`, `experience`, `publications`).
- **Custom SQL Runner**: Run read-only `SELECT` SQL queries directly from the UI.
- **1-Click Export**: Export any table's data to CSV or JSON formats.

## How to Run
Run the standalone server using Python 3:

```bash
cd admin-dashboard
python3 server.py
```

Then open **[http://localhost:8090](http://localhost:8090)** in your web browser.

## Architecture & Structure
```
admin-dashboard/
├── server.py       # Lightweight HTTP API server (Built-in Python http.server)
├── index.html      # Single-Page Admin Web Interface (Vanilla HTML5/CSS3/JS)
└── README.md       # Documentation
```
