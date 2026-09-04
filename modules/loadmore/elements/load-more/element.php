<?php

return [
    'name' => 'load-more-yootheme',
    'title' => 'Load More by xdecaro',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,

    'defaults' => [
        'mode' => 'button',
        'target_mode' => 'auto',
        'target_selector' => '#blog-grid',
        'item_selector' => ':scope > *',
        'next_selector' => 'a[rel="next"], .pagination-next a, .page-item.next a, li.next a',
        'pagination_selector' => '.uk-pagination, .pagination, nav[aria-label*="pagination" i]',
        'batch_size' => 4,
        'button_text' => '',
        'loading_text' => '',
        'end_text' => '',
        'error_text' => '',
        'button_style' => 'primary',
        'button_size' => '',
        'button_width' => '',
        'threshold' => 500,
        'animation' => 'fade',
        'hide_pagination' => true,
        'update_url' => false,
        'show_end_message' => true,
    ],

    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
    ],

    'fields' => [
        'mode' => [
            'label' => 'Modalità',
            'type' => 'select',
            'options' => [
                'Load More' => 'button',
                'Infinite Scroll' => 'infinite',
            ],
        ],
        'target_mode' => [
            'label' => 'Rilevamento contenuto',
            'type' => 'select',
            'options' => [
                'Automatico' => 'auto',
                'Selettore CSS' => 'selector',
            ],
        ],
        'target_selector' => [
            'label' => 'Selettore contenitore',
        ],
        'item_selector' => [
            'label' => 'Selettore elementi',
        ],
        'next_selector' => [
            'label' => 'Selettore link pagina successiva',
        ],
        'pagination_selector' => [
            'label' => 'Selettore paginazione',
        ],
        'batch_size' => [
            'label' => 'Elementi per caricamento',
            'description' => 'Numero massimo di nuovi elementi da mostrare a ogni clic o attivazione dello scroll infinito.',
            'type' => 'number',
            'attrs' => [
                'min' => 1,
                'step' => 1,
            ],
        ],
        'button_text' => [
            'label' => 'Testo pulsante',
            'description' => 'Lascia vuoto per usare automaticamente il testo nella lingua del sito.',
            'show' => 'mode == "button"',
        ],
        'loading_text' => [
            'label' => 'Testo caricamento',
            'description' => 'Lascia vuoto per usare automaticamente il testo nella lingua del sito.',
        ],
        'end_text' => [
            'label' => 'Testo fine elenco',
            'description' => 'Lascia vuoto per usare automaticamente il testo nella lingua del sito.',
        ],
        'error_text' => [
            'label' => 'Testo errore',
            'description' => 'Lascia vuoto per usare automaticamente il testo nella lingua del sito.',
        ],
        'button_style' => [
            'label' => 'Stile pulsante',
            'type' => 'select',
            'options' => [
                'Default' => 'default',
                'Primary' => 'primary',
                'Secondary' => 'secondary',
                'Danger' => 'danger',
                'Text' => 'text',
                'Link' => 'link',
            ],
            'show' => 'mode == "button"',
        ],
        'button_size' => [
            'label' => 'Dimensione pulsante',
            'type' => 'select',
            'options' => [
                'Default' => '',
                'Small' => 'small',
                'Large' => 'large',
            ],
            'show' => 'mode == "button"',
        ],
        'button_width' => [
            'label' => 'Larghezza pulsante',
            'type' => 'select',
            'options' => [
                'Automatica' => '',
                '100%' => '1-1',
            ],
            'show' => 'mode == "button"',
        ],
        'threshold' => [
            'label' => 'Distanza attivazione (px)',
            'description' => 'Per Infinite Scroll. Avvia il caricamento prima di raggiungere il fondo.',
            'type' => 'range',
            'attrs' => [
                'min' => 0,
                'max' => 1500,
                'step' => 50,
            ],
            'show' => 'mode == "infinite"',
        ],
        'animation' => [
            'label' => 'Animazione nuovi elementi',
            'type' => 'select',
            'options' => [
                'Nessuna' => 'none',
                'Fade' => 'fade',
                'Slide' => 'slide',
            ],
        ],
        'hide_pagination' => [
            'label' => 'Nascondi paginazione originale',
            'type' => 'checkbox',
            'text' => 'Nascondi la paginazione Joomla quando Load More è attivo',
        ],
        'update_url' => [
            'label' => 'Aggiorna URL',
            'type' => 'checkbox',
            'text' => 'Aggiorna l’indirizzo alla pagina caricata senza ricaricare',
        ],
        'show_end_message' => [
            'label' => 'Messaggio finale',
            'type' => 'checkbox',
            'text' => 'Mostra dopo aver caricato l’ultimo gruppo di elementi',
        ],
        'margin_top' => '${builder.margin_top}',
        'margin_bottom' => '${builder.margin_bottom}',
        'text_align' => '${builder.text_align_justify}',
        'text_align_breakpoint' => '${builder.text_align_breakpoint}',
        'text_align_fallback' => '${builder.text_align_justify_fallback}',
        'visibility' => '${builder.visibility}',
        'name' => '${builder.name}',
        'status' => '${builder.status}',
        'id' => '${builder.id}',
        'class' => '${builder.cls}',
        'attributes' => '${builder.attrs}',
        'css' => [
            'label' => 'CSS',
            'type' => 'editor',
            'editor' => 'code',
            'mode' => 'css',
            'attrs' => ['debounce' => 500],
        ],
    ],

    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                [
                    'title' => 'Contenuto',
                    'fields' => [
                        'mode',
                        'batch_size',
                    ],
                ],
                [
                    'title' => 'Impostazioni',
                    'fields' => [
                        [
                            'label' => 'Testi',
                            'type' => 'group',
                            'fields' => ['button_text', 'loading_text', 'end_text', 'error_text'],
                        ],
                        [
                            'label' => 'Aspetto',
                            'type' => 'group',
                            'fields' => ['button_style', 'button_size', 'button_width', 'animation'],
                        ],
                        [
                            'label' => 'Comportamento',
                            'type' => 'group',
                            'fields' => ['threshold', 'hide_pagination', 'update_url', 'show_end_message'],
                        ],
                        [
                            'label' => 'Layout',
                            'type' => 'group',
                            'fields' => [
                                'margin_top',
                                'margin_bottom',
                                'text_align',
                                'text_align_breakpoint',
                                'text_align_fallback',
                                'visibility',
                            ],
                        ],
                    ],
                ],
                '${builder.advanced}',
            ],
        ],
    ],
];
