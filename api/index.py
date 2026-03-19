import sys
import os

# Add backend to path so 'app' can be found
# The directory structure on Vercel:
# /var/task/ (root)
# ├── api/index.py
# └── backend/app/main.py

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

try:
    from app.main import app
except ImportError as e:
    print(f"Error importing app: {e}")
    # Fallback for debugging path issues in Vercel environment
    print(f"Current sys.path: {sys.path}")
    print(f"Current directory: {os.getcwd()}")
    print(f"Directory contents: {os.listdir(os.path.dirname(__file__))}")
    raise e

# Vercel needs the app instance to be the handler
# or it will look for 'handler' or 'app' in the module
# We expose 'app' directly.
