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

## Passaggio dalla serie 1.3.x alla 1.4.x

La 1.4.0 sostituisce **Load More by xdecaro** con il nuovo elemento **Pagination by xdecaro**. Non viene mantenuto un alias del vecchio tipo perché il progetto è ancora in fase di test.

Procedura consigliata:

1. rimuovi il vecchio Load More dai layout di prova oppure preparati a eliminarlo dopo l'aggiornamento;
2. aggiorna il plugin a 1.4.0;
3. riapri YOOtheme Pro Builder;
4. inserisci **Pagination by xdecaro**;
5. scegli la modalità desiderata: Carica altri, Scroll infinito, Numerica, Precedente/Successivo o Completa;
6. se usi le modalità numeriche, lascia disponibile la Pagination nativa Joomla/YOOtheme come sorgente e abilita **Nascondi paginazione originale**.

Lo script di installazione rimuove automaticamente dal plugin installato i vecchi asset `load-more*` e la cartella `elements/load-more`.

## Migrazione dalla serie 1.1.x

La 1.2.0 ha introdotto l'identificativo tecnico definitivo `xdecaro` al posto di `loadmoreyootheme`.

Per installazioni storiche della serie 1.1.x, esegui un backup, passa prima al plugin di sistema `xdecaro` e poi aggiorna alla versione corrente.
