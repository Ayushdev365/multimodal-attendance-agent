#!/usr/bin/env python3
"""
Initialize the database tables cleanly.
Usage: python scripts/init_db.py
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.db.base import Base
from app.db.session import engine
from app.models import *

def main():
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database schema successfully created!")

if __name__ == "__main__":
    main()
