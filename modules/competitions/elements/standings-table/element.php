<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_standings_table',
    'title' => 'Standings Table',
    'group' => 'xdecaro',
    'element' => true,
    'width' => 500,
    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],
    'defaults' => [
        'season_id' => '',
        'empty_text' => 'Standings are not available yet.',
        'show_goal_columns' => true,
    ],
    'fields' => [
        'season_id' => [
            'label' => 'Season ID',
            'type' => 'number',
            'source' => true,
            'description' => 'Map this field from a Competition source or enter a season ID.',
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
                    'fields' => ['season_id', 'empty_text'],
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
