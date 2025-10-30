# Flask CORS Setup for Credit Score API

Your Flask API needs CORS enabled to accept requests from your Next.js frontend (localhost:3000).

## Installation

First, install flask-cors:

```bash
pip install flask-cors
```

## Implementation

Add these lines to your Flask app (around line 10, after `app = Flask(__name__)`):

```python
from flask import Flask, request, jsonify
from flask_cors import CORS  # ADD THIS LINE
import os
import random, hashlib

# ================== APP & DB SETUP ==================
app = Flask(__name__)
app.url_map.strict_slashes = False

# Enable CORS - ADD THESE LINES
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# ... rest of your code
```

## Complete Modified Section

```python
from dataclasses import dataclass, asdict, replace
from typing import Optional, Tuple, Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS  # <- ADD THIS
import os
import random, hashlib

# --- DB (SQLAlchemy) ---
from sqlalchemy import create_engine, String, Integer, Float, Boolean
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

# ================== APP & DB SETUP ==================
app = Flask(__name__)
app.url_map.strict_slashes = False

# Enable CORS - ADD THIS BLOCK
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Pastikan folder data ada
os.makedirs("data", exist_ok=True)
DB_URL = "sqlite:///data/credit.db"
# ... rest of your code continues
```

## Quick Alternative (Allow All Origins - Development Only)

For quick testing during development:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This allows all origins - NOT for production!
```

## After Making Changes

1. Save your Python file
2. Restart the Flask server (stop and run again):
   ```bash
   python your_credit_score_api.py
   ```
3. Test from your Next.js frontend

The CORS error should be resolved!
