# Essential Addons for YOOtheme Pro

Raccolta di elementi personalizzati per **YOOtheme Pro Builder** su Joomla, sviluppata da **xdecaro**.

## Elementi inclusi

- **Load More by xdecaro** — caricamento progressivo con pulsante oppure Infinite Scroll, senza ricaricare la pagina.
- **Unfold by xdecaro** — contenitore espandibile con vero sublayout del Builder e contenuti dinamici.
- **Footer Copyright by xdecaro** — copyright dinamico per il footer con anno corrente automatico, intervallo dall'anno iniziale, nome sito Joomla, link opzionale e testo dei diritti riservati multilingua.

Gli elementi sono raggruppati in YOOtheme Pro sotto **XDECARO**.

## Requisiti

- Joomla 4, 5 o 6
- PHP 8.0 o superiore
- YOOtheme Pro attivo

## Installazione su un nuovo sito

1. Apri la sezione **Releases** del repository.
2. Scarica l'asset più recente `plg_system_xdecaro_VERSIONE.zip`.
3. In Joomla vai in **Sistema → Installa estensioni**.
4. Carica il file ZIP.
5. Verifica che il plugin di sistema **Essential Addons for YOOtheme Pro** sia attivo.
6. Apri YOOtheme Pro Builder e cerca il gruppo **XDECARO**.

Dopo la prima installazione, Joomla può rilevare gli aggiornamenti tramite `update.xml`.

## Aggiornamenti automatici

Update server ufficiale:

`https://raw.githubusercontent.com/xdecaro/addons-for-yootheme-pro/main/update.xml`

Ogni versione stabile viene pubblicata come **GitHub Release** con:

- ZIP installabile Joomla;
- checksum SHA-256;
- tag `vVERSIONE`;
- note della release.

## Struttura del progetto

```text
.github/workflows/   CI e pubblicazione release
modules/addons/      modulo YOOtheme e asset condivisi
  assets/            CSS e JavaScript
  elements/          elementi del Builder
  src/               listener e logica condivisa
docs/                documentazione
vendor/              autoloader minimo
tools/               build e validazione
xdecaro.php           bootstrap del plugin Joomla
xdecaro.xml           manifest Joomla
changelog.xml         changelog per Joomla
update.xml            feed aggiornamenti Joomla
```

## Documentazione

- [Installazione e migrazione](docs/installation.md)
- [Load More](docs/load-more.md)
- [Unfold](docs/unfold.md)
- [Footer Copyright](docs/footer-copyright.md)
- [Pubblicazione delle versioni](docs/releasing.md)

## Migrazione dalle versioni 1.1.x

La versione **1.2.0** consolida il progetto e cambia l'identificativo tecnico del plugin da `loadmoreyootheme` a `xdecaro`.

Per il sito già configurato con la serie 1.1.x:

1. fai un backup;
2. disattiva il vecchio plugin `loadmoreyootheme`;
3. installa `plg_system_xdecaro_1.2.0.zip`;
4. verifica in YOOtheme Pro che **Load More by xdecaro** e **Unfold by xdecaro** siano disponibili;
5. solo dopo la verifica, disinstalla il vecchio plugin.

Gli identificativi interni degli elementi del Builder restano invariati per non perdere i layout già salvati.

## Licenza

GNU General Public License, versione 2 o successiva. Vedi [LICENSE](LICENSE).
