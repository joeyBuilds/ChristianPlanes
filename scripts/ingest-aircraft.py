#!/usr/bin/env python3
"""
Aircraft Blueprint Ingestion Pipeline
======================================
Converts DXF technical drawings into production-ready PNG blueprints
using ezdxf + matplotlib rendering.

Proven recipe:
  1. Render each view layer with matplotlib (A+ quality)
  2. Black strokes on transparent background
  3. Top view: rotate 90° CW so nose points LEFT (matches procedural silhouettes)
  4. Auto-crop transparent padding
  5. Deploy PNGs + update blueprint registry

Usage:
  python3 scripts/ingest-aircraft.py A350-1000 path/to/file.dxf
  python3 scripts/ingest-aircraft.py A350-1000 path/to/file.dxf --preview
  python3 scripts/ingest-aircraft.py --list

Requirements:
  pip3 install ezdxf matplotlib Pillow
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
    """Classify DXF layers into view groups."""
    msp = doc.modelspace()
    view_layers: Dict[str, List[str]] = defaultdict(list)
    assigned = set()

    # Pass 1: primary view layers
    for layer in doc.layers:
        name = layer.dxf.name
        entity_count = sum(1 for e in msp if e.dxf.layer == name)
        if entity_count == 0:
            continue

        lower = name.lower().replace("_", "").replace(" ", "")

        skip = any(p in lower for p in SKIP_PATTERNS)
        if skip:
            print(f"  ⊘ Skip: {name} ({entity_count} entities)")
            assigned.add(name)
            continue

        for view_name, config in VIEW_CONFIG.items():
            for pattern in config["primary"]:
                if pattern.replace("_", "").replace(" ", "") in lower:
                    view_layers[view_name].append(name)
                    assigned.add(name)
                    print(f"  ✓ {name} → {view_name} ({entity_count} entities)")
                    break
            if name in assigned:
                break

    # Pass 2: detail layers
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


# ─── Rendering ───────────────────────────────────────────────────────────────


def render_view_png(doc, layer_names: List[str], output_path: str,
                    view_name: str, dpi: int = 300) -> int:
    """Render DXF layers to a production-ready PNG.

    - Black strokes on transparent background
    - Top view: rotated 90° CW (nose-left)
    - Auto-cropped to remove padding
    """
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    from PIL import Image

    msp = doc.modelspace()
    ctx = RenderContext(doc)

    figsize = (20, 20) if view_name == "top" else (20, 10)

    fig, ax = plt.subplots(figsize=figsize)
    fig.patch.set_alpha(0)
    ax.set_facecolor('none')

    backend = MatplotlibBackend(ax)
    frontend = Frontend(ctx, backend)

    entities = [
        e for e in msp
        if e.dxf.layer in layer_names and e.dxftype() not in SKIP_ENTITY_TYPES
    ]
    frontend.draw_entities(entities)

    # Force black strokes (app filter inverts black → white)
    for child in ax.get_children():
        if hasattr(child, 'set_color'):
            try:
                child.set_color('black')
            except Exception:
                pass
        if hasattr(child, 'set_edgecolor'):
            try:
                child.set_edgecolor('black')
            except Exception:
                pass

    ax.autoscale()
    ax.set_aspect('equal')
    ax.axis('off')

    # Render to temp file
    tmp_path = output_path + '.tmp.png'
    fig.savefig(tmp_path, format='png', transparent=True,
                bbox_inches='tight', pad_inches=0, dpi=dpi)
    plt.close(fig)

    # Post-process with PIL
    img = Image.open(tmp_path)

    # Top view: rotate 90° CW so nose points LEFT
    if view_name == "top":
        img = img.rotate(-90, expand=True)

    # Auto-crop transparent padding
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path)
    Path(tmp_path).unlink(missing_ok=True)

    return len(entities)


# ─── Preview ─────────────────────────────────────────────────────────────────


def generate_preview_html(slug: str, source: str, view_files: Dict[str, str],
                          view_counts: Dict[str, int]) -> str:
    """Generate preview HTML with all views on dark background."""
    cards = []
    for vn in ["side", "top", "front"]:
        if vn not in view_files:
            cards.append(f'<div class="card miss"><h3>{vn.upper()} VIEW</h3>'
                         f'<div class="ph">No layers found</div></div>')
            continue
        count = view_counts.get(vn, 0)
        fname = Path(view_files[vn]).name
        cards.append(f'''<div class="card"><h3>{vn.upper()} VIEW</h3>
        <div class="sub">{count} entities · {fname}</div>
        <div class="box"><img src="{fname}"></div></div>''')

    return f'''<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Preview: {slug}</title>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
body{{background:#0a1929;color:#e2e8f0;font-family:system-ui;padding:2rem}}
h1{{color:#60a5fa;margin-bottom:.25rem;font-size:1.4rem}}
.src{{font-size:.75rem;color:#64748b;margin-bottom:2rem;font-family:monospace}}
.card{{background:#0d1f35;border:1px solid #1e3a5f;border-radius:12px;padding:1.25rem;margin-bottom:1.5rem}}
.card.miss{{opacity:.3;border-style:dashed}}
.card h3{{font-size:.7rem;font-weight:700;letter-spacing:.15em;color:#94a3b8;margin-bottom:.25rem}}
.card .sub{{font-size:.65rem;color:#475569;margin-bottom:1rem}}
.box{{background:#060f1d;border-radius:8px;padding:1rem;display:flex;align-items:center;justify-content:center}}
.box img{{max-width:100%;max-height:500px;filter:brightness(0) invert(1)}}
.ph{{color:#334155;font-style:italic;text-align:center;padding:4rem 0}}
.act{{margin-top:2rem;padding:1.25rem;background:#0d2137;border-radius:12px;border:1px solid #1e3a5f}}
.act h3{{font-size:.8rem;color:#60a5fa;margin-bottom:.75rem}}
.act code{{display:block;background:#060f1d;padding:.75rem 1rem;border-radius:6px;font-family:monospace;font-size:.8rem;color:#a5f3fc;margin-top:.5rem}}
</style></head><body>
<h1>{slug}</h1>
<div class="src">Source: {source}</div>
{"".join(cards)}
<div class="act">
<h3>If this looks correct, run without --preview:</h3>
<code>python3 scripts/ingest-aircraft.py {slug} "{source}"</code>
</div></body></html>'''


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

    # Find the closing brace of BLUEPRINT_REGISTRY
    match = re.search(r"(const BLUEPRINT_REGISTRY[^{]*\{)", content)
    if not match:
        print("  ⚠ Could not find BLUEPRINT_REGISTRY")
        return

    start = match.end()
    brace_depth = 1
    pos = start
    while pos < len(content) and brace_depth > 0:
        if content[pos] == '{':
            brace_depth += 1
        elif content[pos] == '}':
            brace_depth -= 1
        pos += 1

    insert_point = pos - 1
    content = content[:insert_point] + entry + "\n" + content[insert_point:]
    REGISTRY_FILE.write_text(content)
    print(f"  ✓ Updated {REGISTRY_FILE.name}")


# ─── List ────────────────────────────────────────────────────────────────────


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
        description="Ingest aircraft DXF → production PNG blueprints",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s A350-1000 bignuts_planeSVG/A350-1000.dxf
  %(prog)s 737-800 downloads/737-800.dxf --preview
  %(prog)s --list
        """,
    )
    parser.add_argument("slug", nargs="?", help="Aircraft slug (e.g., A350-1000)")
    parser.add_argument("source", nargs="?", help="Path to DXF file")
    parser.add_argument("--preview", action="store_true", help="Preview only")
    parser.add_argument("--force", action="store_true", help="Overwrite existing")
    parser.add_argument("--list", action="store_true", help="List aircraft + status")
    parser.add_argument("--dpi", type=int, default=300, help="Render DPI (default: 300)")

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
        sys.exit(1)

    print(f"\n  Ingesting {slug} from {source.name}")
    print(f"  {'─' * 50}")

    import ezdxf
    doc = ezdxf.readfile(str(source))
    view_layers = classify_layers(doc)

    if not view_layers:
        print("  ⚠ No view layers found!")
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
        png_path = str(PREVIEW_DIR / f"{slug.lower()}-{view_name}.png")

        print(f"\n  Rendering {view_name}...", end=" ")
        count = render_view_png(doc, layers, png_path, view_name, dpi=args.dpi)
        print(f"{count} entities")

        view_files[view_name] = png_path
        view_counts[view_name] = count

    # ── Preview ──
    preview_path = PREVIEW_DIR / f"{slug.lower()}-preview.html"
    preview_path.write_text(generate_preview_html(slug, str(source), view_files, view_counts))
    print(f"\n  ✓ Preview: {preview_path}")

    if args.preview:
        print(f"  Preview mode — verify, then re-run without --preview.\n")
        try:
            import subprocess
            subprocess.run(["open", str(preview_path)], check=False)
        except Exception:
            pass
        return

    # ── Deploy ──
    BLUEPRINT_DIR.mkdir(parents=True, exist_ok=True)
    filenames: Dict[str, str] = {}

    for view_name, png_path in view_files.items():
        filename = f"{slug.lower()}-{view_name}.png"
        dest = BLUEPRINT_DIR / filename
        if dest.exists() and not args.force:
            print(f"\n  ⚠ {filename} exists. Use --force to overwrite.")
            sys.exit(1)
        import shutil
        shutil.copy2(png_path, dest)
        filenames[view_name] = filename
        size_kb = dest.stat().st_size / 1024
        print(f"  ✓ {filename} ({size_kb:.0f} KB)")

    update_registry(slug, filenames)
    print(f"\n  Done! {slug} is ready. Refresh the browser to verify.\n")


if __name__ == "__main__":
    main()
