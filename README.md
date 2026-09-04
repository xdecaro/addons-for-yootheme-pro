# Essential Addons for YOOtheme Pro

Raccolta di elementi personalizzati per **YOOtheme Pro Builder** su Joomla, sviluppata da **xdecaro**.

## Elementi disponibili

### Load More by xdecaro

Aggiunge **Load More** e **Infinite Scroll** senza ricaricare la pagina.

Funzioni principali:

- caricamento progressivo tramite Fetch/AJAX;
- modalità pulsante oppure Infinite Scroll;
- numero di elementi per caricamento configurabile;
- rilevamento automatico della Grid e della paginazione Joomla/YOOtheme;
- prevenzione dei duplicati;
- testi automatici in base alla lingua del sito;
- supporto a italiano, francese, inglese, tedesco, olandese, spagnolo e portoghese.

### Unfold by xdecaro

Permette di inserire un vero **sublayout del Builder** e mostrarne inizialmente solo una parte, espandendo tutto il contenuto con un clic.

Funzioni principali:

- sublayout YOOtheme Pro tramite `builder-fragment`;
- contenuti dinamici all’interno del sublayout;
- altezza anteprima separata per desktop, tablet e smartphone;
- supporto a `px`, `vh`, `vw`, `rem` ed `em`;
- apertura e chiusura animate;
- sfumatura inferiore senza imporre un colore di sfondo, quindi compatibile con light e dark mode;
- pulsanti basati sugli stili UIkit/YOOtheme;
- auto-hide quando il contenuto non supera l’altezza dell’anteprima;
- opzione per mostrare o nascondere il pulsante Riduci;
- ritorno automatico all’elemento dopo la chiusura;
- supporto a `prefers-reduced-motion`;
- gestione dei contenuti caricati o modificati dinamicamente nel Builder.

## Gruppo nel Builder

Gli elementi vengono mostrati nella libreria YOOtheme Pro nel gruppo:

**XDECARO**

con i nomi:

- **Load More by xdecaro**
- **Unfold by xdecaro**

## Versione 1.1.1

La versione 1.1.1 rinomina l'estensione visualizzata in Joomla in **Essential Addons for YOOtheme Pro**.

## Aggiornamenti automatici

Il plugin registra questo update server Joomla:

`https://raw.githubusercontent.com/xdecaro/loader-more-yootheme/main/update.xml`

Le nuove versioni possono essere rilevate da Joomla in **Sistema → Aggiornamenti → Estensioni**.

Il workflow GitHub in `.github/workflows/build-update.yml` crea automaticamente il pacchetto ZIP `plg_system_xdecaro_VERSIONE.zip` e aggiorna `update.xml` quando cambia la versione nel manifest.
