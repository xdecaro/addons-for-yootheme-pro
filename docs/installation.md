# Installazione e migrazione

## Nuova installazione

1. Apri **Releases** nel repository GitHub.
2. Scarica l'ultimo file `plg_system_xdecaro_VERSIONE.zip`.
3. In Joomla apri **Sistema → Installa estensioni**.
4. Carica il pacchetto ZIP.
5. Controlla che **Essential Addons for YOOtheme Pro** sia attivo tra i plugin di sistema.
6. Apri YOOtheme Pro Builder: gli elementi sono nel gruppo **XDECARO**.

## Aggiornamenti

Dopo l'installazione, Joomla usa il feed:

`https://raw.githubusercontent.com/xdecaro/addons-for-yootheme-pro/main/update.xml`

Le nuove versioni stabili vengono scaricate dagli asset delle GitHub Releases.

## Migrazione dalla serie 1.1.x

La 1.2.0 introduce l'identificativo tecnico definitivo `xdecaro` al posto di `loadmoreyootheme`.

Procedura consigliata:

1. esegui un backup del sito;
2. disattiva il vecchio plugin di sistema `loadmoreyootheme`;
3. installa la release 1.2.0;
4. verifica che gli elementi **Load More by xdecaro** e **Unfold by xdecaro** siano presenti nel Builder;
5. controlla una pagina che usa ciascun elemento;
6. disinstalla il vecchio plugin solo dopo la verifica.

Gli identificativi degli elementi YOOtheme restano invariati, quindi i layout già salvati continuano a riferirsi agli stessi tipi di elemento.
