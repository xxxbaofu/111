"""Default Streamlit entrypoint for the AIHeal site."""

from __future__ import annotations

from selection_radar.aiheal_site import render_aiheal_site


def render_dashboard() -> None:
    """Keep the public entrypoint stable while serving AIHeal."""
    render_aiheal_site()


if __name__ == "__main__":
    render_dashboard()
