<?php

defined('_JEXEC') or die;

return [
    'name' => 'xdecaro_forms_list',
    'title' => 'Forms List',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],
    'fields' => [
        'info' => [
            'label' => 'Elenco moduli',
            'type' => 'text',
            'attrs' => [
                'readonly' => true,
                'value' => 'Mostra automaticamente tutti i moduli attivi di Forms.',
            ],
        ],
    ],
    'fieldset' => [
        'default' => [
            'fields' => ['info'],
        ],
    ],
];
