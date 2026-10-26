#!/usr/bin/env python3
"""
Explicit demo seed runner.
Usage: python scripts/seed_demo.py
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.seed_demo import seed_demo_data

if __name__ == "__main__":
    seed_demo_data()
