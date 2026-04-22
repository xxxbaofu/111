#!/usr/bin/env bash
set -euo pipefail

echo "[cursor-install] Ensuring Python tooling is available..."
python3 --version
python3 -m pip --version

echo "[cursor-install] Upgrading pip..."
python3 -m pip install --upgrade pip

echo "[cursor-install] Installing project dependencies..."
python3 -m pip install -r requirements.txt

echo "[cursor-install] Done."
