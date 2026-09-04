# Load More for YOOtheme Pro

Elemento personalizzato per YOOtheme Pro Builder su Joomla che aggiunge **Load More** e **Infinite Scroll** senza ricaricare la pagina.

## Versione 1.0.2

- rimossa l'impostazione **Elementi iniziali**: il numero iniziale resta gestito da Joomla/YOOtheme (ad esempio `Intro Articles`);
- **Elementi per caricamento** è un campo numerico libero e indipendente dalla dimensione della pagina Joomla;
- rilevamento più robusto di `Next`, `Suivant`, `Successiva` e della paginazione Joomla tramite `?start=N`;
- coda interna: se Joomla restituisce 4 articoli ma il plugin è impostato a 2 per caricamento, vengono mostrati 2 + 2 senza perdere elementi;
- se si imposta un batch maggiore della pagina Joomla, il plugin può recuperare più pagine fino a riempire il gruppo;
- paginazione originale nascosta solo quando esiste realmente una pagina successiva;
- update server GitHub integrato nel manifest.

## Configurazione consigliata

1. Imposta normalmente in Joomla il numero di `Intro Articles` (es. 4).
2. Assegna alla Grid YOOtheme un ID, ad esempio `blog-grid`.
3. Nel Builder aggiungi **Load More** sotto la Grid.
4. Usa `#blog-grid` come selettore contenitore.
5. Lascia `:scope > *` come selettore elementi.
6. Imposta liberamente **Elementi per caricamento** (es. 4).
7. Scegli **Load More** oppure **Infinite Scroll**.

## Aggiornamenti automatici

Dalla versione 1.0.2 il plugin registra questo update server:

`https://raw.githubusercontent.com/xdecaro/loader-more-yootheme/main/update.xml`

Le versioni successive possono quindi essere rilevate da Joomla in **Sistema → Aggiornamenti → Estensioni**.

Il workflow GitHub in `.github/workflows/build-update.yml` crea automaticamente il pacchetto ZIP e aggiorna `update.xml` quando cambia la versione nel manifest.
