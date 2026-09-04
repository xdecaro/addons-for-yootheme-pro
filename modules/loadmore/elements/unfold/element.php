<?php

return [
    'name' => 'unfold-xdecaro',
    'title' => 'Unfold by xdecaro',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'container' => true,
    'width' => 500,

    'defaults' => [
        'preview_height' => '420px',
        'preview_height_tablet' => '360px',
        'preview_height_mobile' => '300px',
        'initial_state' => 'collapsed',
        'expand_text' => '',
        'collapse_text' => '',
        'show_collapse' => true,
        'auto_hide' => true,
        'fade' => true,
        'fade_height' => '90px',
        'button_style' => 'default',
        'button_size' => '',
        'button_width' => '',
        'button_align' => 'center',
        'button_margin' => 'default',
        'duration' => 450,
        'scroll_back' => true,
    ],

    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],

    'fields' => [
        'content' => [
            'type' => 'builder-fragment',
        ],
        'html_element' => [
            'label' => 'Elemento HTML',
            'description' => 'Definisci l’elemento semantico del contenitore Unfold.',
            'type' => 'select',
            'options' => [
                'div' => '',
                'article' => 'article',
                'aside' => 'aside',
                'nav' => 'nav',
                'section' => 'section',
            ],
        ],
        'preview_height' => [
            'label' => 'Altezza anteprima',
            'description' => 'Altezza visibile prima dell’espansione. Puoi usare px, vh, rem o em, ad esempio 420px o 50vh.',
        ],
        'preview_height_tablet' => [
            'label' => 'Altezza tablet',
            'description' => 'Lascia vuoto per usare l’altezza desktop.',
        ],
        'preview_height_mobile' => [
            'label' => 'Altezza smartphone',
            'description' => 'Lascia vuoto per usare l’altezza tablet o desktop.',
        ],
        'initial_state' => [
            'label' => 'Stato iniziale',
            'type' => 'select',
            'options' => [
                'Chiuso' => 'collapsed',
                'Aperto' => 'expanded',
            ],
        ],
        'expand_text' => [
            'label' => 'Testo apertura',
            'description' => 'Lascia vuoto per usare automaticamente la lingua del sito.',
        ],
        'collapse_text' => [
            'label' => 'Testo chiusura',
            'description' => 'Lascia vuoto per usare automaticamente la lingua del sito.',
            'enable' => 'show_collapse',
        ],
        'show_collapse' => [
            'label' => 'Pulsante Riduci',
            'type' => 'checkbox',
            'text' => 'Permetti di richiudere il contenuto dopo l’espansione',
        ],
        'auto_hide' => [
            'label' => 'Nascondi se non serve',
            'type' => 'checkbox',
            'text' => 'Nascondi automaticamente il pulsante se il contenuto entra già nell’anteprima',
        ],
        'fade' => [
            'label' => 'Sfumatura inferiore',
            'type' => 'checkbox',
            'text' => 'Sfuma il contenuto in fondo all’anteprima',
        ],
        'fade_height' => [
            'label' => 'Altezza sfumatura',
            'description' => 'Ad esempio 90px o 6rem.',
            'enable' => 'fade',
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
        ],
        'button_size' => [
            'label' => 'Dimensione pulsante',
            'type' => 'select',
            'options' => [
                'Default' => '',
                'Small' => 'small',
                'Large' => 'large',
            ],
        ],
        'button_width' => [
            'label' => 'Larghezza pulsante',
            'type' => 'select',
            'options' => [
                'Automatica' => '',
                '100%' => '1-1',
            ],
        ],
        'button_align' => [
            'label' => 'Allineamento pulsante',
            'type' => 'select',
            'options' => [
                'Sinistra' => 'left',
                'Centro' => 'center',
                'Destra' => 'right',
            ],
        ],
        'button_margin' => [
            'label' => 'Distanza pulsante',
            'type' => 'select',
            'options' => [
                'Nessuna' => 'none',
                'Small' => 'small',
                'Default' => 'default',
                'Medium' => 'medium',
                'Large' => 'large',
            ],
        ],
        'duration' => [
            'label' => 'Durata animazione (ms)',
            'type' => 'range',
            'attrs' => [
                'min' => 0,
                'max' => 1500,
                'step' => 50,
            ],
        ],
        'scroll_back' => [
            'label' => 'Ritorno in alto',
            'type' => 'checkbox',
            'text' => 'Quando il contenuto viene richiuso, riporta dolcemente l’elemento in vista se necessario',
            'enable' => 'show_collapse',
        ],
        'margin_top' => '${builder.margin_top}',
        'margin_bottom' => '${builder.margin_bottom}',
        'visibility' => '${builder.visibility}',
        'name' => '${builder.name}',
        'status' => '${builder.status}',
        'source' => '${builder.source}',
        'id' => '${builder.id}',
        'class' => '${builder.cls}',
        'attributes' => '${builder.attrs}',
        'css' => [
            'label' => 'CSS',
            'type' => 'editor',
            'editor' => 'code',
            'mode' => 'css',
            'attrs' => [
                'debounce' => 500,
                'hints' => ['.el-element', '.xd-unfold__viewport', '.xd-unfold__content', '.xd-unfold__controls', '.xd-unfold__button'],
            ],
        ],
    ],

    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                [
                    'title' => 'Contenuto',
                    'fields' => ['content'],
                ],
                [
                    'title' => 'Impostazioni',
                    'fields' => [
                        [
                            'label' => 'Anteprima',
                            'type' => 'group',
                            'divider' => true,
                            'fields' => [
                                'preview_height',
                                'preview_height_tablet',
                                'preview_height_mobile',
                                'initial_state',
                                'fade',
                                'fade_height',
                                'auto_hide',
                            ],
                        ],
                        [
                            'label' => 'Pulsante',
                            'type' => 'group',
                            'divider' => true,
                            'fields' => [
                                'expand_text',
                                'collapse_text',
                                'show_collapse',
                                'button_style',
                                'button_size',
                                'button_width',
                                'button_align',
                                'button_margin',
                            ],
                        ],
                        [
                            'label' => 'Animazione',
                            'type' => 'group',
                            'divider' => true,
                            'fields' => ['duration', 'scroll_back'],
                        ],
                        [
                            'label' => 'Generale',
                            'type' => 'group',
                            'fields' => ['html_element', 'margin_top', 'margin_bottom', 'visibility'],
                        ],
                    ],
                ],
                '${builder.advanced}',
            ],
        ],
    ],
];
