<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_standings_table',
    'title' => 'Standings Table',
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
        'selected_season_id' => '',
        'season_id' => '',
        'empty_text' => 'Standings are not available yet.',
        'show_goal_columns' => true,
    ],
    'fields' => [
        'selected_season_id' => [
            'label' => 'Competition / Season',
            'type' => 'select',
            'options' => XdecaroCompetitionsProvider::competitionOptions(),
            'description' => 'Choose an available competition/season. Leave empty when the season is supplied through Dynamic Content.',
        ],
        'season_id' => [
            'label' => 'Season ID Override',
            'type' => 'number',
            'source' => true,
            'description' => 'Advanced/manual override. Normally choose Competition / Season above or map this field dynamically.',
            'attrs' => ['min' => 1, 'step' => 1],
        ],
        'empty_text' => ['label' => 'Empty State Text', 'type' => 'text'],
        'show_goal_columns' => ['label' => 'Goal Columns', 'type' => 'checkbox', 'text' => 'Show GF, GA and GD'],
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
                    'fields' => ['selected_season_id', 'empty_text'],
                ],
                [
                    'title' => 'Advanced Data',
                    'fields' => ['season_id'],
                ],
                [
                    'title' => 'Style',
                    'fields' => ['show_goal_columns'],
                ],
                '${builder.advanced}',
            ],
        ],
    ],
];
