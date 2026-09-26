<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_competition_card',
    'title' => 'Competition Card',
    'group' => 'xdecaro',
    'element' => true,
    'width' => 500,
    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],
    'defaults' => [
        'title' => '',
        'meta' => 'Competition',
        'button_text' => 'View competition',
        'card_style' => 'default',
    ],
    'fields' => [
        'title' => ['label' => 'Title', 'type' => 'text', 'source' => true],
        'meta' => ['label' => 'Meta', 'type' => 'text', 'source' => true],
        'discipline' => ['label' => 'Discipline', 'type' => 'text', 'source' => true],
        'gender' => ['label' => 'Gender', 'type' => 'text', 'source' => true],
        'season_year' => ['label' => 'Season Year', 'type' => 'text', 'source' => true],
        'host_city' => ['label' => 'Host City', 'type' => 'text', 'source' => true],
        'host_country_code' => ['label' => 'Host Country', 'type' => 'text', 'source' => true],
        'start_date' => ['label' => 'Start Date', 'type' => 'text', 'source' => true],
        'end_date' => ['label' => 'End Date', 'type' => 'text', 'source' => true],
        'team_count' => ['label' => 'Team Count', 'type' => 'text', 'source' => true],
        'link_override' => [
            'label' => 'Link',
            'type' => 'text',
            'source' => true,
            'description' => 'Optional. Competitions does not invent frontend routes; map or enter the destination explicitly.',
        ],
        'button_text' => ['label' => 'Button Text', 'type' => 'text'],
        'card_style' => [
            'label' => 'Card Style',
            'type' => 'select',
            'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary'],
        ],
        'source' => '${builder.source}',
        'name' => '${builder.name}',
        'status' => '${builder.status}',
        'id' => '${builder.id}',
        'class' => '${builder.cls}',
        'attributes' => '${builder.attrs}',
    ],
    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                [
                    'title' => 'Content',
                    'fields' => ['title', 'meta', 'discipline', 'gender', 'season_year', 'host_city', 'host_country_code', 'start_date', 'end_date', 'team_count', 'link_override', 'button_text'],
                ],
                [
                    'title' => 'Style',
                    'fields' => ['card_style'],
                ],
                '${builder.advanced}',
            ],
        ],
    ],
];
