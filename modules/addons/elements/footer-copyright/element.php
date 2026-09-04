<?php

return [
    'name' => 'footer-copyright-xdecaro',
    'title' => 'Footer Copyright by xdecaro',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,

    'defaults' => [
        'site_source' => 'auto',
        'site_name' => '',
        'start_year' => '',
        'copyright_style' => 'symbol',
        'rights_mode' => 'auto',
        'rights_text' => '',
        'link_site' => false,
        'site_url' => '',
        'link_target' => '',
        'text_size' => 'small',
        'text_color' => 'muted',
        'html_element' => 'div',
    ],

    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
    ],

    'fields' => [
        'site_source' => [
            'label' => 'Nome sito',
            'type' => 'select',
            'options' => [
                'Automatico da Joomla' => 'auto',
                'Personalizzato' => 'custom',
            ],
        ],
        'site_name' => [
            'label' => 'Nome personalizzato',
            'description' => 'Usato solo quando Nome sito è impostato su Personalizzato.',
            'show' => 'site_source == "custom"',
        ],
        'start_year' => [
            'label' => 'Anno iniziale',
            'description' => 'Opzionale. Esempio: 2020 produce automaticamente 2020–anno corrente. Lascia vuoto per mostrare solo l’anno corrente.',
            'type' => 'number',
            'attrs' => [
                'min' => 1900,
                'max' => 2200,
                'step' => 1,
            ],
        ],
        'copyright_style' => [
            'label' => 'Copyright',
            'type' => 'select',
            'options' => [
                '©' => 'symbol',
                'Copyright ©' => 'copyright-symbol',
                'Copyright' => 'copyright',
                'Nessuno' => 'none',
            ],
        ],
        'rights_mode' => [
            'label' => 'Diritti riservati',
            'type' => 'select',
            'options' => [
                'Automatico nella lingua del sito' => 'auto',
                'Testo personalizzato' => 'custom',
                'Non mostrare' => 'none',
            ],
        ],
        'rights_text' => [
            'label' => 'Testo personalizzato',
            'show' => 'rights_mode == "custom"',
        ],
        'link_site' => [
            'label' => 'Link sul nome del sito',
            'type' => 'checkbox',
            'text' => 'Rendi cliccabile il nome del sito',
        ],
        'site_url' => [
            'label' => 'URL sito',
            'description' => 'Lascia vuoto per usare la home page del sito.',
            'enable' => 'link_site',
        ],
        'link_target' => [
            'label' => 'Apertura link',
            'type' => 'select',
            'options' => [
                'Stessa finestra' => '',
                'Nuova finestra' => '_blank',
            ],
            'enable' => 'link_site',
        ],
        'text_size' => [
            'label' => 'Dimensione testo',
            'type' => 'select',
            'options' => [
                'Default' => '',
                'Small' => 'small',
                'Meta' => 'meta',
                'Large' => 'large',
            ],
        ],
        'text_color' => [
            'label' => 'Colore testo',
            'type' => 'select',
            'options' => [
                'Default' => '',
                'Muted' => 'muted',
                'Primary' => 'primary',
                'Secondary' => 'secondary',
            ],
        ],
        'html_element' => [
            'label' => 'Elemento HTML',
            'type' => 'select',
            'options' => [
                'div' => 'div',
                'p' => 'p',
                'small' => 'small',
            ],
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
            'attrs' => [
                'debounce' => 500,
                'hints' => ['.el-element', '.xd-footer-copyright', '.xd-footer-copyright__site'],
            ],
        ],
    ],

    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                [
                    'title' => 'Contenuto',
                    'fields' => [
                        'site_source',
                        'site_name',
                        'start_year',
                        'copyright_style',
                        'rights_mode',
                        'rights_text',
                        'link_site',
                        'site_url',
                        'link_target',
                    ],
                ],
                [
                    'title' => 'Impostazioni',
                    'fields' => [
                        [
                            'label' => 'Aspetto',
                            'type' => 'group',
                            'fields' => ['text_size', 'text_color'],
                        ],
                        [
                            'label' => 'Layout',
                            'type' => 'group',
                            'fields' => [
                                'html_element',
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
