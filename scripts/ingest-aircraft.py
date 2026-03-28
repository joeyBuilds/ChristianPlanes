#!/usr/bin/env python3
"""
Aircraft Blueprint Ingestion Pipeline
======================================
Converts DXF technical drawings into clean SVG blueprints using
ezdxf + matplotlib rendering.

Usage:
  python3 scripts/ingest-aircraft.py A350-1000 bignuts_planeSVG/A350-1000.dxf
  python3 scripts/ingest-aircraft.py A350-1000 file.dxf --preview
  python3 scripts/ingest-aircraft.py --list

Requirements:
  pip3 install ezdxf matplotlib
"""

import argparse
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional

# ─── Project paths ───────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BLUEPRINT_DIR = PROJECT_ROOT / "public" / "aircraft-images" / "blueprint"
REGISTRY_FILE = PROJECT_ROOT / "src" / "data" / "aircraft-blueprints.ts"
PREVIEW_DIR = PROJECT_ROOT / "scripts" / "previews"

# ─── Layer classification ────────────────────────────────────────────────────

# View assignments: maps view name → layer name patterns
# "primary" layers are the main view; "detail" layers add supplementary geometry
VIEW_CONFIG = {
    "side": {
        "primary": ["sideview", "side_view", "side view", "profile", "elevation"],
        "detail": [],
    },
    "top": {
        "primary": ["topview", "top_view", "top view", "planview", "plan_view"],
        "detail": ["door", "outline", "tail", "rear", "passdoor"],
    },
    "front": {
        "primary": ["frontview", "front_view", "front view"],
        "detail": [],
    },
}

SKIP_PATTERNS = ["label", "text", "dim", "anno", "title", "note", "border", "hatch"]
SKIP_ENTITY_TYPES = {"TEXT", "MTEXT", "DIMENSION", "LEADER", "MULTILEADER", "ATTRIB", "ATTDEF"}


def classify_layers(doc) -> Dict[str, List[str]]:
    """Classify DXF layers into view groups.

    Returns: {"side": [layer_names], "top": [layer_names], "front": [layer_names]}
    """
    msp = doc.modelspace()
    view_layers: Dict[str, List[str]] = defaultdict(list)
    assigned = set()

    # Pass 1: Assign primary view layers
    for layer in doc.layers:
        name = layer.dxf.name
        entity_count = sum(1 for e in msp if e.dxf.layer == name)
        if entity_count == 0:
            continue

        lower = name.lower().replace("_", "").replace(" ", "")

        # Check skip patterns
        skip = False
        for pattern in SKIP_PATTERNS:
            if pattern in lower:
                skip = True
                break
        if skip:
            print(f"  ⊘ Skip: {name} ({entity_count} entities)")
            assigned.add(name)
            continue

        # Check primary view patterns
        for view_name, config in VIEW_CONFIG.items():
            for pattern in config["primary"]:
                clean = pattern.replace("_", "").replace(" ", "")
                if clean in lower:
                    view_layers[view_name].append(name)
                    assigned.add(name)
                    print(f"  ✓ {name} → {view_name} ({entity_count} entities)")
                    break
            if name in assigned:
                break

    # Pass 2: Assign detail layers (primarily for top view enrichment)
    for layer in doc.layers:
        name = layer.dxf.name
        if name in assigned:
            continue
        entity_count = sum(1 for e in msp if e.dxf.layer == name)
        if entity_count == 0:
            continue

        lower = name.lower().replace("_", "").replace(" ", "")

        for view_name, config in VIEW_CONFIG.items():
            for pattern in config["detail"]:
                if pattern in lower:
                    view_layers[view_name].append(name)
                    assigned.add(name)
                    print(f"  + {name} → {view_name} detail ({entity_count} entities)")
                    break
            if name in assigned:
                break

        if name not in assigned:
            print(f"  ? Skipped: {name} ({entity_count} entities)")

    return dict(view_layers)


# ─── Matplotlib rendering ───────────────────────────────────────────────────


def render_view(doc, layer_names: List[str], output_path: str,
                figsize=(20, 20), linewidth: Optional[float] = None,
                rotate_deg: float = 0):
    """Render DXF layers to SVG using matplotlib.

    Args:
        doc: ezdxf document
        layer_names: layers to include
        output_path: where to save the SVG
        figsize: matplotlib figure size (controls resolution)
        linewidth: override line width for visual consistency (None = use DXF defaults)
        rotate_deg: rotation in degrees (positive = counterclockwise)
    """
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

    msp = doc.modelspace()
    ctx = RenderContext(doc)

    fig, ax = plt.subplots(figsize=figsize)
    fig.patch.set_alpha(0)
    ax.set_facecolor('none')

    backend = MatplotlibBackend(ax)
    frontend = Frontend(ctx, backend)

    # Filter entities
    entities = [
        e for e in msp
        if e.dxf.layer in layer_names and e.dxftype() not in SKIP_ENTITY_TYPES
    ]
    frontend.draw_entities(entities)

    # Apply rotation
    if rotate_deg != 0:
        import matplotlib.transforms as mtransforms
        # Get current limits to find center
        ax.autoscale()
        xlim = ax.get_xlim()
        ylim = ax.get_ylim()
        cx = (xlim[0] + xlim[1]) / 2
        cy = (ylim[0] + ylim[1]) / 2
        tr = mtransforms.Affine2D().rotate_deg_around(cx, cy, rotate_deg) + ax.transData
        for child in ax.get_children():
            try:
                child.set_transform(tr)
            except (AttributeError, TypeError):
                pass

    # Override line widths for visual consistency
    if linewidth is not None:
        for child in ax.get_children():
            if hasattr(child, 'set_linewidth'):
                try:
                    child.set_linewidth(linewidth)
                except Exception:
                    pass

    ax.autoscale()
    ax.set_aspect('equal')
    ax.axis('off')

    fig.savefig(output_path, format='svg', transparent=True,
                bbox_inches='tight', pad_inches=0.1)
    plt.close(fig)

    return len(entities)


# ─── Preview HTML ────────────────────────────────────────────────────────────


def generate_preview_html(slug: str, source: str, view_files: Dict[str, str],
                          view_counts: Dict[str, int]) -> str:
    """Generate preview HTML showing all rendered views."""
    cards = []
    for view_name in ["side", "top", "front"]:
        if view_name not in view_files:
            cards.append(f'''
      <div class="card missing">
        <h3>{view_name.upper()} VIEW</h3>
        <div class="placeholder">No layers found for this view</div>
      </div>''')
            continue

        svg_path = view_files[view_name]
        with open(svg_path) as f:
            svg = f.read()
        svg = re.sub(r'<\?xml[^?]*\?>', '', svg).strip()
        count = view_counts.get(view_name, 0)

        cards.append(f'''
      <div class="card">
        <h3>{view_name.upper()} VIEW</h3>
        <div class="sub">{count} entities rendered</div>
        <div class="svg-box">{svg}</div>
      </div>''')

    cards_html = "\n".join(cards)

    return f'''<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Blueprint Preview: {slug}</title>
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{ background:#0a1929; color:#e2e8f0; font-family:-apple-system,system-ui,sans-serif; padding:2rem; }}
  h1 {{ color:#60a5fa; margin-bottom:0.25rem; font-size:1.4rem; }}
  .source {{ font-size:0.75rem; color:#64748b; margin-bottom:2rem;
             font-family:'JetBrains Mono','SF Mono',monospace; }}
  .card {{ background:#0d1f35; border:1px solid #1e3a5f; border-radius:12px;
           padding:1.25rem; margin-bottom:1.5rem; }}
  .card.missing {{ opacity:0.3; border-style:dashed; }}
  .card h3 {{ font-size:0.7rem; font-weight:700; letter-spacing:0.15em; color:#94a3b8; margin-bottom:0.25rem; }}
  .card .sub {{ font-size:0.65rem; color:#475569; margin-bottom:1rem; }}
  .svg-box {{ background:#060f1d; border-radius:8px; padding:1rem;
              display:flex; align-items:center; justify-content:center; }}
  .svg-box svg {{ max-width:100%; max-height:500px; }}
  .placeholder {{ color:#334155; font-style:italic; text-align:center; padding:4rem 0; }}
  .actions {{ margin-top:2rem; padding:1.25rem; background:#0d2137;
              border-radius:12px; border:1px solid #1e3a5f; }}
  .actions h3 {{ font-size:0.8rem; color:#60a5fa; margin-bottom:0.75rem; }}
  .actions code {{ display:block; background:#060f1d; padding:0.75rem 1rem;
                   border-radius:6px; font-family:'JetBrains Mono',monospace;
                   font-size:0.8rem; color:#a5f3fc; margin-top:0.5rem; }}
</style></head><body>
<h1>{slug}</h1>
<div class="source">Source: {source}</div>
{cards_html}
<div class="actions">
  <h3>If this looks correct, run without --preview:</h3>
  <code>python3 scripts/ingest-aircraft.py {slug} "{source}"</code>
</div>
</body></html>'''


# ─── Registry ────────────────────────────────────────────────────────────────


def update_registry(slug: str, filenames: Dict[str, str]):
    """Add or update an entry in aircraft-blueprints.ts."""
    if not REGISTRY_FILE.exists():
        print(f"  ⚠ Registry not found: {REGISTRY_FILE}")
        return

    content = REGISTRY_FILE.read_text()

    # Remove existing entry
    if f"'{slug}'" in content:
        print(f"  ℹ Updating existing entry for {slug}")
        content = re.sub(rf"  '{re.escape(slug)}':\s*\{{[^}}]+\}},?\n", "", content)

    side = filenames.get("side", "")
    top = filenames.get("top", "")
    front = filenames.get("front", "")

    entry = f"""  '{slug}': {{
    side: '{side}',
    top: '{top}',
    front: '{front}',
  }},"""

    # Insert before the closing } of BLUEPRINT_REGISTRY object
    # Find the pattern: closing brace that ends the const declaration
    match = re.search(r"(const BLUEPRINT_REGISTRY[^{]*\{)", content)
    if not match:
        print("  ⚠ Could not find BLUEPRINT_REGISTRY in file")
        return

    # Find the matching closing brace for the registry object
    start = match.end()
    brace_depth = 1
    pos = start
    while pos < len(content) and brace_depth > 0:
        if content[pos] == '{':
            brace_depth += 1
        elif content[pos] == '}':
            brace_depth -= 1
        pos += 1

    if brace_depth != 0:
        print("  ⚠ Could not find closing brace of BLUEPRINT_REGISTRY")
        return

    # pos is now right after the closing }, insert before it
    insert_point = pos - 1
    content = content[:insert_point] + entry + "\n" + content[insert_point:]
    REGISTRY_FILE.write_text(content)
    print(f"  ✓ Updated {REGISTRY_FILE.name}")


# ─── List Mode ───────────────────────────────────────────────────────────────


def list_aircraft():
    """Show all aircraft and their blueprint status."""
    catalog_file = PROJECT_ROOT / "src" / "data" / "aircraft-catalog.ts"
    if not catalog_file.exists():
        print("Could not find aircraft-catalog.ts")
        return

    slugs = re.findall(r"slug:\s*['\"]([^'\"]+)['\"]", catalog_file.read_text())

    existing = set()
    if BLUEPRINT_DIR.exists():
        for f in BLUEPRINT_DIR.iterdir():
            name = f.stem
            for suffix in ["-side", "-top", "-front"]:
                if name.endswith(suffix):
                    existing.add(name[: -len(suffix)])
                    break

    registry_slugs = set()
    if REGISTRY_FILE.exists():
        registry_slugs = set(re.findall(r"'([^']+)':\s*\{", REGISTRY_FILE.read_text()))

    print(f"\n  {'AIRCRAFT':<30} {'FILES':<10} {'REGISTRY':<10}")
    print(f"  {'─' * 50}")

    has_count = 0
    for slug in sorted(slugs):
        has_files = slug.lower() in existing or slug in existing
        in_registry = slug in registry_slugs
        if has_files:
            has_count += 1
        print(f"  {slug:<30} {'✓' if has_files else '—':<10} {'✓' if in_registry else '—':<10}")

    print(f"\n  {has_count}/{len(slugs)} aircraft have blueprints\n")


# ─── Main ────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser(
        description="Ingest aircraft DXF blueprints using matplotlib renderer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s A350-1000 bignuts_planeSVG/A350-1000.dxf
  %(prog)s A350-1000 file.dxf --preview
  %(prog)s --list
        """,
    )
    parser.add_argument("slug", nargs="?", help="Aircraft slug (e.g., A350-1000)")
    parser.add_argument("source", nargs="?", help="Path to DXF file")
    parser.add_argument("--preview", action="store_true", help="Preview only")
    parser.add_argument("--force", action="store_true", help="Overwrite existing")
    parser.add_argument("--list", action="store_true", help="List aircraft + status")
    parser.add_argument("--linewidth", type=float, default=None,
                        help="Override line width for all views (e.g., 0.5)")
    parser.add_argument("--top-linewidth", type=float, default=None,
                        help="Override line width for top view only (helps match side/front)")

    args = parser.parse_args()

    if args.list:
        list_aircraft()
        return

    if not args.slug or not args.source:
        parser.error("slug and source are required (use --list to see aircraft)")

    slug = args.slug
    source = Path(args.source)

    if not source.exists():
        print(f"Error: {source} not found")
        sys.exit(1)

    if source.suffix.lower() != ".dxf":
        print(f"Error: Expected .dxf file, got {source.suffix}")
        print(f"This pipeline uses the matplotlib renderer which requires DXF input.")
        sys.exit(1)

    print(f"\n  Ingesting {slug} from {source.name}")
    print(f"  {'─' * 50}")

    # ── Read DXF and classify layers ──
    import ezdxf
    doc = ezdxf.readfile(str(source))
    view_layers = classify_layers(doc)

    if not view_layers:
        print("  ⚠ No view layers found! Check DXF layer names.")
        sys.exit(1)

    # ── Render each view ──
    PREVIEW_DIR.mkdir(parents=True, exist_ok=True)

    view_files: Dict[str, str] = {}
    view_counts: Dict[str, int] = {}

    for view_name in ["side", "top", "front"]:
        if view_name not in view_layers:
            print(f"\n  ⚠ No layers for {view_name} view")
            continue

        layers = view_layers[view_name]
        svg_path = str(PREVIEW_DIR / f"{slug.lower()}-{view_name}.svg")

        # No rotation in rendering — orientation handled by app
        rotation = 0

        # Figure size: (20,10) matches the A+ renders; (20,20) for top to give it room
        figsize = (20, 20) if view_name == "top" else (20, 10)

        # Line width: allow per-view override for consistency
        lw = args.linewidth
        if view_name == "top" and args.top_linewidth is not None:
            lw = args.top_linewidth

        print(f"\n  Rendering {view_name} ({len(layers)} layers)...", end=" ")
        count = render_view(doc, layers, svg_path,
                            figsize=figsize, linewidth=lw, rotate_deg=rotation)
        print(f"{count} entities")

        view_files[view_name] = svg_path
        view_counts[view_name] = count

    # ── Generate preview ──
    preview_path = PREVIEW_DIR / f"{slug.lower()}-preview.html"
    html = generate_preview_html(slug, str(source), view_files, view_counts)
    preview_path.write_text(html)
    print(f"\n  ✓ Preview: {preview_path}")

    if args.preview:
        print(f"  Preview mode — verify, then re-run without --preview.\n")
        try:
            import subprocess
            subprocess.run(["open", str(preview_path)], check=False)
        except Exception:
            pass
        return

    # ── Copy SVGs to production directory ──
    BLUEPRINT_DIR.mkdir(parents=True, exist_ok=True)
    filenames: Dict[str, str] = {}

    for view_name, svg_path in view_files.items():
        filename = f"{slug.lower()}-{view_name}.svg"
        dest = BLUEPRINT_DIR / filename

        if dest.exists() and not args.force:
            print(f"\n  ⚠ {filename} exists. Use --force to overwrite.")
            sys.exit(1)

        import shutil
        shutil.copy2(svg_path, dest)
        filenames[view_name] = filename
        size_kb = dest.stat().st_size / 1024
        print(f"  ✓ {filename} ({size_kb:.1f} KB)")

    # ── Update registry ──
    update_registry(slug, filenames)
    print(f"\n  Done! {slug} is ready. Run 'npm run dev' to verify.\n")


if __name__ == "__main__":
    main()
