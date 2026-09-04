# Pubblicazione delle versioni

La versione del prodotto è definita in `xdecaro.xml`.

## Flusso

1. aggiorna il codice;
2. incrementa la versione nel manifest;
3. aggiungi la nuova voce in cima a `changelog.xml`;
4. apri una pull request verso `main`;
5. la CI valida PHP, XML e struttura del pacchetto;
6. dopo il merge su `main`, il workflow **Release** crea lo ZIP, calcola SHA-256, aggiorna `update.xml`, crea il tag `vVERSIONE` e pubblica la GitHub Release.

## Regole di versione

- patch, ad esempio `1.2.1`: correzioni compatibili;
- minor, ad esempio `1.3.0`: nuovi elementi o nuove funzioni compatibili;
- major, ad esempio `2.0.0`: cambiamenti incompatibili.

Non committare ZIP o cartelle di build nel repository. Gli artefatti installabili vivono nelle GitHub Releases.
