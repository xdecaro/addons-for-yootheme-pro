# Pagination by xdecaro

Elemento unico per YOOtheme Pro che gestisce la navigazione di Grid paginate e Gallery, con AJAX per le sorgenti Joomla/YOOtheme e paginazione locale per le Gallery già renderizzate.

## Modalità

- **Carica altri** — aggiunge il gruppo successivo sotto gli elementi già presenti.
- **Scroll infinito** — aggiunge automaticamente nuovi elementi quando l'utente si avvicina al fondo.
- **Numerica** — mostra i numeri di pagina e sostituisce il gruppo visibile.
- **Precedente / Successivo** — navigazione con i soli controlli direzionali.
- **Completa** — combina Precedente, numerazione e Successivo.

## Elemento collegato

Nel Builder sono disponibili tre modalità di collegamento:

- **Grid precedente — Automatico** — usa la Grid precedente e la paginazione Joomla/YOOtheme come sorgente AJAX quando disponibile.
- **Gallery precedente — Locale** — usa la Gallery precedente e suddivide localmente gli elementi già renderizzati da YOOtheme.
- **Elemento tramite ID CSS** — collega manualmente una Grid o un contenitore tramite selettore CSS.

## Grid paginate

Pagination individua automaticamente la Grid precedente e, quando disponibile, usa la paginazione Joomla/YOOtheme presente nella pagina come sorgente per URL, pagina corrente e numero totale di pagine.

Per le modalità numeriche è consigliato mantenere nel template anche la **Pagination nativa di YOOtheme/Joomla**: l'opzione **Nascondi paginazione originale** la rende invisibile nel frontend ma continua a usarla come sorgente dati. In questo modo non è necessario duplicare la logica di conteggio totale di Joomla.

Per **Carica altri** e **Scroll infinito** è disponibile anche il fallback tramite offset `start`, con verifica della Grid remota e prevenzione dei duplicati.

## Gallery YOOtheme

Da **1.5.0** Pagination supporta direttamente la Gallery YOOtheme tramite **Elemento collegato → Gallery precedente — Locale**.

La Gallery deve renderizzare tutti gli elementi che Pagination deve poter gestire. Ad esempio, se la sorgente contiene 100 fotografie, la Gallery deve avere una quantità sufficiente a renderizzare tutte le 100 fotografie; se YOOtheme renderizza soltanto 20 elementi, Pagination non può recuperare localmente gli altri 80.

Impostazione consigliata per una Gallery da 100 fotografie:

- Gallery YOOtheme: 100 elementi disponibili;
- Elementi iniziali: 20;
- Elementi per caricamento: 20;
- Numero massimo caricamenti: 4.

In questo modo vengono mostrati 20 elementi iniziali e poi, al massimo, altri quattro gruppi da 20. Il limite predefinito è **4**; impostando **0** il limite viene disattivato.

Se il limite viene raggiunto mentre esistono ancora elementi nascosti, Pagination mostra un messaggio specifico di limite raggiunto invece di dichiarare erroneamente che tutti gli elementi sono stati visualizzati.

La modalità Gallery locale supporta anche **Numerica**, **Precedente / Successivo** e **Completa** usando `Elementi iniziali` come dimensione della pagina locale.

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

Nel Builder le modalità a clic sono testabili in anteprima senza aggiornare l'URL e senza generare eventi sintetici del Customizer.

Da **1.4.1**, anche **Scroll infinito** è testabile realmente nel Builder. Per le Grid AJAX, per evitare le race condition del Customizer non viene usato `IntersectionObserver`: un bridge dedicato esclusivamente all'anteprima ascolta lo scroll dell'iframe in modo passivo e throttled con `requestAnimationFrame`.

La modalità Gallery locale usa lo stesso principio nel Builder: nessun evento sintetico YOOtheme e nessun `IntersectionObserver` nel Customizer. Nel frontend, invece, Scroll infinito usa `IntersectionObserver` come prima.

## Nota di migrazione 1.4.0

Il vecchio elemento `load-more-yootheme` è stato rimosso senza alias legacy perché il progetto è ancora in fase di test. L'installer elimina automaticamente i vecchi asset e la cartella `elements/load-more` durante l'aggiornamento.
