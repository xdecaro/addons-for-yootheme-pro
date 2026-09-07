from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"Expected exactly one match in {path}, found {count}: {old!r}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


# 1) The newly revealed block must animate as one unit, not in staggered waves.
for js_path in (
    "modules/addons/assets/js/pagination-gallery.js",
    "modules/addons/assets/js/pagination.js",
):
    replace_once(
        js_path,
        "const delay = Math.min(index * 35, 245);",
        "const delay = 0;",
    )


# 2) Context-aware automatic Load More labels, while keeping custom text authoritative.
template_path = "modules/addons/elements/pagination/templates/template.php"
context_map = """$loadmoreByContext = [
    'en' => ['gallery' => 'Load more photos', 'content' => 'Load more articles'],
    'it' => ['gallery' => 'Carica altre foto', 'content' => 'Carica altri articoli'],
    'fr' => ['gallery' => 'Charger plus de photos', 'content' => 'Charger plus d’articles'],
    'de' => ['gallery' => 'Mehr Fotos laden', 'content' => 'Mehr Artikel laden'],
    'nl' => ['gallery' => \"Meer foto's laden\", 'content' => 'Meer artikelen laden'],
    'es' => ['gallery' => 'Cargar más fotos', 'content' => 'Cargar más artículos'],
    'pt' => ['gallery' => 'Carregar mais fotos', 'content' => 'Carregar mais artigos'],
];

"""
replace_once(
    template_path,
    "];\n\n$languageCode = 'en';",
    "];\n\n" + context_map + "$languageCode = 'en';",
)

replace_once(
    template_path,
    "$isGallery = $targetMode === 'gallery';\n$icon = (string) ($props['icon'] ?? 'arrow');",
    "$isGallery = $targetMode === 'gallery';\n"
    "$loadmoreContext = $loadmoreByContext[$languageCode] ?? $loadmoreByContext['en'];\n"
    "if ($custom['loadmore'] === '') {\n"
    "    $text['loadmore'] = $isGallery ? $loadmoreContext['gallery'] : $loadmoreContext['content'];\n"
    "}\n"
    "$icon = (string) ($props['icon'] ?? 'arrow');",
)


# 3) Make the Builder help text match the contextual behavior.
element_path = "modules/addons/elements/pagination/element.php"
replace_once(
    element_path,
    "'label' => 'Testo Carica altri',\n            'description' => 'Lascia vuoto per il testo automatico della lingua del sito. Esempio personalizzato: Carica altri articoli.',",
    "'label' => 'Testo pulsante',\n            'description' => 'Lascia vuoto per il testo automatico della lingua del sito: Gallery = Carica altre foto; Grid/Blog = Carica altri articoli. Il testo personalizzato ha sempre priorità.',",
)


# 4) Release version.
replace_once(
    "xdecaro.xml",
    "<version>1.5.5</version>",
    "<version>1.5.6</version>",
)


# 5) Changelog.
changelog_entry = """  <changelog>
    <element>xdecaro</element>
    <type>plugin</type>
    <version>1.5.6</version>
    <fix>
      <item>Corretta la percezione di doppia animazione in Pagination: il nuovo blocco di elementi usa ora un’unica animazione simultanea, senza ritardi progressivi tra foto o articoli.</item>
      <item>Fade e Slide mantengono il ricalcolo UIkit e le protezioni introdotte nelle versioni precedenti, ma tutti gli elementi del blocco partono nello stesso frame.</item>
    </fix>
    <change>
      <item>Il testo automatico di Carica altri è ora contestuale: Gallery usa “Carica altre foto”, mentre Grid e Blog usano “Carica altri articoli”.</item>
      <item>I testi automatici contestuali sono disponibili nelle lingue già supportate; un testo personalizzato nel Builder continua ad avere sempre priorità.</item>
    </change>
  </changelog>
"""
replace_once(
    "changelog.xml",
    "<changelogs>\n",
    "<changelogs>\n" + changelog_entry,
)

print("1.5.6 patch applied successfully")
