# Essential Addons for YOOtheme Pro

Raccolta di elementi personalizzati per **YOOtheme Pro Builder** su Joomla, sviluppata da **xdecaro**.

## Elementi inclusi

- **Form** — mostra un singolo modulo creato con il componente Forms, selezionabile direttamente dal Builder oppure tramite ID manuale.
- **Forms List** — mostra automaticamente l'elenco dei moduli attivi del componente Forms.
- **Pagination by xdecaro** — navigazione AJAX per Grid e paginazione locale per Gallery YOOtheme con Carica altri, Scroll infinito, numerica, Precedente/Successivo e modalità completa.
- **Unfold by xdecaro** — contenitore espandibile con vero sublayout del Builder e contenuti dinamici.
- **Footer Copyright by xdecaro** — copyright dinamico per il footer con anno corrente automatico, intervallo dall'anno iniziale, nome sito Joomla, link opzionale e testo dei diritti riservati multilingua.

Gli elementi sono raggruppati in YOOtheme Pro sotto **XDECARO**.

Le icone degli elementi usano uno stile uniforme, leggero e lineare, con dimensioni coerenti nel selettore del Builder.

## Requisiti

- Joomla 4, 5 o 6
- PHP 8.0 o superiore
- YOOtheme Pro attivo
- Per **Form** e **Forms List**: componente **Forms** installato e relativo plugin di sistema attivo

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
script.php            pulizia file legacy durante gli aggiornamenti
changelog.xml         changelog per Joomla
update.xml            feed aggiornamenti Joomla
```

## Documentazione

- [Installazione e migrazione](docs/installation.md)
- [Pagination](docs/pagination.md)
- [Unfold](docs/unfold.md)
- [Footer Copyright](docs/footer-copyright.md)
- [Pubblicazione delle versioni](docs/releasing.md)

## Passaggio dalla serie 1.3.x alla 1.4.x

La versione **1.4.0** rimuove il precedente elemento **Load More by xdecaro** e introduce **Pagination by xdecaro** con una struttura nuova e unica.

Il progetto era ancora in fase di test, quindi non viene mantenuto un alias legacy del vecchio elemento. Prima o dopo l'aggiornamento rimuovi il vecchio Load More dai layout di prova e inserisci il nuovo elemento Pagination.

Durante l'aggiornamento Joomla, `script.php` elimina automaticamente dal plugin installato gli asset JavaScript/CSS e la cartella dell'elemento Load More non più utilizzati.

## Migrazione dalle versioni 1.1.x

La versione **1.2.0** ha consolidato l'identificativo tecnico del plugin da `loadmoreyootheme` a `xdecaro`.

Per installazioni storiche della serie 1.1.x, esegui sempre un backup e passa al plugin di sistema `xdecaro` prima di aggiornare alle versioni correnti.

## Licenza

GNU General Public License, versione 2 o successiva. Vedi [LICENSE](LICENSE).
