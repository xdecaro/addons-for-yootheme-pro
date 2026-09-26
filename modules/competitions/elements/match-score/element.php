<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_match_score',
    'title' => 'Match Score',
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
        'selected_match_id' => '',
        'match_status' => '',
        'show_logos' => true,
        'card_style' => 'default',
    ],
    'fields' => [
        'selected_match_id' => [
            'label' => 'Match',
            'type' => 'select',
            'options' => XdecaroCompetitionsProvider::matchOptions(),
            'description' => 'Choose an available match. Leave empty when using Dynamic Content or manual overrides.',
        ],
        'home_team_name' => ['label' => 'Home Team', 'type' => 'text', 'source' => true],
        'home_team_short_name' => ['label' => 'Home Team Short Name', 'type' => 'text', 'source' => true],
        'home_team_logo' => ['label' => 'Home Team Logo', 'type' => 'image', 'source' => true],
        'away_team_name' => ['label' => 'Away Team', 'type' => 'text', 'source' => true],
        'away_team_short_name' => ['label' => 'Away Team Short Name', 'type' => 'text', 'source' => true],
        'away_team_logo' => ['label' => 'Away Team Logo', 'type' => 'image', 'source' => true],
        'home_score' => ['label' => 'Home Score', 'type' => 'text', 'source' => true],
        'away_score' => ['label' => 'Away Score', 'type' => 'text', 'source' => true],
        'home_penalties' => ['label' => 'Home Penalties', 'type' => 'text', 'source' => true],
        'away_penalties' => ['label' => 'Away Penalties', 'type' => 'text', 'source' => true],
        'match_status' => [
            'label' => 'Match Status',
            'type' => 'text',
            'source' => true,
            'description' => 'Map this field to the Match source field “Status”.',
        ],
        'match_date' => ['label' => 'Date', 'type' => 'text', 'source' => true],
        'kickoff_time' => ['label' => 'Kick-off', 'type' => 'text', 'source' => true],
        'stage' => ['label' => 'Stage', 'type' => 'text', 'source' => true],
        'round_name' => ['label' => 'Round', 'type' => 'text', 'source' => true],
        'venue_name' => ['label' => 'Venue', 'type' => 'text', 'source' => true],
        'show_logos' => ['label' => 'Show Logos', 'type' => 'checkbox', 'text' => 'Show team logos'],
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
                    'fields' => ['selected_match_id'],
                ],
                [
                    'title' => 'Overrides',
                    'fields' => ['home_team_name', 'home_team_short_name', 'home_team_logo', 'away_team_name', 'away_team_short_name', 'away_team_logo', 'home_score', 'away_score', 'home_penalties', 'away_penalties', 'match_status', 'match_date', 'kickoff_time', 'stage', 'round_name', 'venue_name'],
                ],
                [
                    'title' => 'Style',
                    'fields' => ['show_logos', 'card_style'],
                ],
                '${builder.advanced}',
            ],
        ],
    ],
];
