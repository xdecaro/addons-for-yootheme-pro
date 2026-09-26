<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_federation_card',
    'title' => 'Federation Card',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],
    'defaults' => [
        'selected_federation_id' => '',
        'card_style' => 'default',
        'show_website' => true,
    ],
    'fields' => [
        'selected_federation_id' => [
            'label' => 'Federation',
            'type' => 'select',
            'options' => XdecaroCompetitionsProvider::federationOptions(),
            'description' => 'Choose an available federation. Leave empty when using Dynamic Content overrides.',
        ],
        'name' => ['label' => 'Name', 'type' => 'text', 'source' => true],
        'short_name' => ['label' => 'Short Name', 'type' => 'text', 'source' => true],
        'country_name' => ['label' => 'Country', 'type' => 'text', 'source' => true],
        'country_code' => ['label' => 'Country Code', 'type' => 'text', 'source' => true],
        'logo' => ['label' => 'Logo', 'type' => 'text', 'source' => true],
        'website' => ['label' => 'Website', 'type' => 'text', 'source' => true],
        'link_override' => ['label' => 'Link', 'type' => 'text', 'source' => true],
        'show_website' => ['label' => 'Show Website', 'type' => 'checkbox', 'text' => 'Display website link'],
        'card_style' => [
            'label' => 'Card Style',
            'type' => 'select',
            'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary'],
        ],
        'source' => '${builder.source}',
        'name_builder' => '${builder.name}',
        'status' => '${builder.status}',
        'id' => '${builder.id}',
        'class' => '${builder.cls}',
        'attributes' => '${builder.attrs}',
    ],
    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                ['title' => 'Content', 'fields' => ['selected_federation_id', 'link_override', 'show_website']],
                ['title' => 'Overrides', 'fields' => ['name', 'short_name', 'country_name', 'country_code', 'logo', 'website']],
                ['title' => 'Style', 'fields' => ['card_style']],
                '${builder.advanced}',
            ],
        ],
    ],
];
