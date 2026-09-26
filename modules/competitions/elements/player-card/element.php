<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_player_card',
    'title' => 'Player Card',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_roster_player' => '', 'card_style' => 'default'],
    'fields' => [
        'selected_roster_player' => ['label' => 'Competition / Team / Player', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionRosterPlayerOptions(), 'description' => 'Choose a player from an approved competition roster.'],
        'display_name' => ['label' => 'Display Name', 'type' => 'text', 'source' => true],
        'first_name' => ['label' => 'First Name', 'type' => 'text', 'source' => true],
        'last_name' => ['label' => 'Last Name', 'type' => 'text', 'source' => true],
        'nationality_code' => ['label' => 'Nationality', 'type' => 'text', 'source' => true],
        'shirt_number' => ['label' => 'Shirt Number', 'type' => 'text', 'source' => true],
        'role' => ['label' => 'Role', 'type' => 'text', 'source' => true],
        'photo' => ['label' => 'Photo', 'type' => 'text', 'source' => true],
        'team_name' => ['label' => 'Team', 'type' => 'text', 'source' => true],
        'card_style' => ['label' => 'Card Style', 'type' => 'select', 'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary']],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_roster_player']],
        ['title' => 'Overrides', 'fields' => ['display_name', 'first_name', 'last_name', 'nationality_code', 'shirt_number', 'role', 'photo', 'team_name']],
        ['title' => 'Style', 'fields' => ['card_style']], '${builder.advanced}',
    ]]],
];
