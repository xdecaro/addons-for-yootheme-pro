#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import re
import shutil
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = "xdecaro/addons-for-yootheme-pro"
MANIFEST = ROOT / "xdecaro.xml"
CHANGELOG = ROOT / "changelog.xml"
UPDATE_FEED = ROOT / "update.xml"

PACKAGE_ENTRIES = [
    ROOT / "xdecaro.php",
    ROOT / "xdecaro.xml",
    ROOT / "script.php",
    ROOT / "README.md",
    ROOT / "LICENSE",
    ROOT / "vendor",
    ROOT / "modules",
]

LEGACY_PATHS = [
    ROOT / "loadmoreyootheme.php",
    ROOT / "loadmoreyootheme.xml",
    ROOT / "modules" / "loadmore",
    ROOT / "modules" / "addons" / "elements" / "load-more",
    ROOT / "modules" / "addons" / "assets" / "css" / "load-more.css",
    ROOT / "modules" / "addons" / "assets" / "js" / "load-more.js",
    ROOT / "modules" / "addons" / "assets" / "js" / "load-more-stability.js",
    ROOT / "modules" / "addons" / "assets" / "js" / "load-more-lifecycle.js",
    ROOT / "modules" / "addons" / "assets" / "js" / "load-more-visibility.js",
    ROOT / "modules" / "addons" / "assets" / "js" / "load-more-builder-preview.js",
]


def fail(message: str) -> None:
    raise SystemExit(f"ERROR: {message}")


def parse_xml(path: Path) -> ET.ElementTree:
    try:
        return ET.parse(path)
    except (OSError, ET.ParseError) as exc:
        fail(f"XML non valido: {path.relative_to(ROOT)} ({exc})")


def get_version() -> str:
    root = parse_xml(MANIFEST).getroot()
    version = (root.findtext("version") or "").strip()
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        fail(f"Versione non valida nel manifest: {version!r}")
    return version


def validate() -> str:
    if not MANIFEST.is_file():
        fail("Manca xdecaro.xml")

    version = get_version()
    manifest_root = parse_xml(MANIFEST).getroot()
    changelog_root = parse_xml(CHANGELOG).getroot()

    plugin_filename = manifest_root.find("./files/filename[@plugin='xdecaro']")
    if plugin_filename is None or (plugin_filename.text or "").strip() != "xdecaro.php":
        fail("Il manifest deve dichiarare <filename plugin=\"xdecaro\">xdecaro.php</filename>")

    script_file = (manifest_root.findtext("scriptfile") or "").strip()
    if script_file != "script.php":
        fail("Il manifest deve dichiarare <scriptfile>script.php</scriptfile>")

    for entry in PACKAGE_ENTRIES:
        if not entry.exists():
            fail(f"Manca una voce del pacchetto: {entry.relative_to(ROOT)}")

    for legacy in LEGACY_PATHS:
        if legacy.exists():
            fail(f"Percorso legacy ancora presente: {legacy.relative_to(ROOT)}")

    first_changelog = changelog_root.find("changelog")
    if first_changelog is None:
        fail("changelog.xml non contiene voci")

    changelog_version = (first_changelog.findtext("version") or "").strip()
    changelog_element = (first_changelog.findtext("element") or "").strip()
    if changelog_version != version:
        fail(f"La prima voce del changelog deve essere {version}, trovata {changelog_version}")
    if changelog_element != "xdecaro":
        fail("La nuova voce del changelog deve usare l'elemento xdecaro")

    return version


def iter_package_files():
    for entry in PACKAGE_ENTRIES:
        if entry.is_file():
            yield entry
            continue
        for path in sorted(entry.rglob("*")):
            if path.is_file():
                yield path


def build_package(output_dir: Path, version: str) -> tuple[Path, str]:
    output_dir.mkdir(parents=True, exist_ok=True)
    package_name = f"plg_system_xdecaro_{version}.zip"
    package = output_dir / package_name

    if package.exists():
        package.unlink()

    with zipfile.ZipFile(package, "w", zipfile.ZIP_DEFLATED) as archive:
        for path in iter_package_files():
            archive.write(path, path.relative_to(ROOT).as_posix())

    digest = hashlib.sha256(package.read_bytes()).hexdigest()
    (output_dir / "SHA256SUMS.txt").write_text(
        f"{digest}  {package_name}\n", encoding="utf-8"
    )
    return package, digest


def write_update_feed(version: str, package_name: str, digest: str) -> None:
    release_url = (
        f"https://github.com/{REPOSITORY}/releases/download/v{version}/{package_name}"
    )
    update_xml = f'''<?xml version="1.0" encoding="utf-8"?>
<updates>
  <update>
    <name>Essential Addons for YOOtheme Pro</name>
    <description>Essential custom addons for YOOtheme Pro Builder by xdecaro: Form, Forms List, Pagination, Unfold and Footer Copyright.</description>
    <element>xdecaro</element>
    <type>plugin</type>
    <folder>system</folder>
    <client>site</client>
    <version>{version}</version>
    <infourl title="Essential Addons for YOOtheme Pro">https://github.com/{REPOSITORY}</infourl>
    <changelogurl>https://raw.githubusercontent.com/{REPOSITORY}/main/changelog.xml</changelogurl>
    <downloads>
      <downloadurl type="full" format="zip">{release_url}</downloadurl>
    </downloads>
    <tags><tag>stable</tag></tags>
    <sha256>{digest}</sha256>
    <maintainer>Luca De Caro</maintainer>
    <maintainerurl>https://lucadecaro.it</maintainerurl>
    <targetplatform name="joomla" version="((4\\.[0-9]+)|(5\\.[0-9]+)|(6\\.[0-9]+))" />
    <php_minimum>8.0</php_minimum>
  </update>
</updates>
'''
    UPDATE_FEED.write_text(update_xml, encoding="utf-8")
    parse_xml(UPDATE_FEED)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build Essential Addons for YOOtheme Pro")
    parser.add_argument("--check", action="store_true", help="Valida soltanto il sorgente")
    parser.add_argument("--output-dir", default="build", help="Cartella artefatti")
    args = parser.parse_args()

    version = validate()
    print(f"version={version}")

    if args.check:
        print("validation=ok")
        return 0

    output_dir = ROOT / args.output_dir
    if output_dir.exists():
        shutil.rmtree(output_dir)

    package, digest = build_package(output_dir, version)
    write_update_feed(version, package.name, digest)

    print(f"package={package.name}")
    print(f"sha256={digest}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
