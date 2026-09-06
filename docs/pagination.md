# Pagination by xdecaro

Elemento unico per YOOtheme Pro che gestisce la navigazione AJAX di Grid, liste di articoli, prodotti e altri contenitori paginati.

## Modalità

- **Carica altri** — aggiunge il gruppo successivo sotto gli elementi già presenti.
- **Scroll infinito** — aggiunge automaticamente nuovi elementi quando l'utente si avvicina al fondo.
- **Numerica** — sostituisce il contenuto della Grid tramite AJAX e mostra i numeri di pagina.
- **Precedente / Successivo** — navigazione AJAX con i soli controlli direzionali.
- **Completa** — combina Precedente, numerazione e Successivo.

## Sorgente della paginazione

Pagination individua automaticamente la Grid precedente e, quando disponibile, usa la paginazione Joomla/YOOtheme presente nella pagina come sorgente per URL, pagina corrente e numero totale di pagine.

Per le modalità numeriche è consigliato mantenere nel template anche la **Pagination nativa di YOOtheme/Joomla**: l'opzione **Nascondi paginazione originale** la rende invisibile nel frontend ma continua a usarla come sorgente dati. In questo modo non è necessario duplicare la logica di conteggio totale di Joomla.

Per **Carica altri** e **Scroll infinito** è disponibile anche il fallback tramite offset `start`, con verifica della Grid remota e prevenzione dei duplicati.

## Aspetto

Sono disponibili gli stili UIkit/YOOtheme:

- Default
- Primary
- Secondary
- Danger
- Text
- Link
- Personalizzato

Lo stile **Personalizzato** permette di configurare sfondo, testo, bordo, hover, pagina attiva, spessore bordo e raggio angoli. Le icone possono essere separate dal testo e impostate come freccia, chevron, plus o nessuna.

## Builder YOOtheme

Gruppo: **XDECARO**  
Nome elemento: **Pagination by xdecaro**  
Identificativo interno: `pagination-xdecaro`

Nel Builder le modalità a clic sono testabili in anteprima senza aggiornare l'URL e senza generare eventi sintetici del Customizer. **Scroll infinito** resta visibile come anteprima ma non attiva IntersectionObserver nel Builder, per non interferire con l'editing.

## Nota di migrazione 1.4.0

Il vecchio elemento `load-more-yootheme` è stato rimosso senza alias legacy perché il progetto è ancora in fase di test. L'installer elimina automaticamente i vecchi asset e la cartella `elements/load-more` durante l'aggiornamento.
