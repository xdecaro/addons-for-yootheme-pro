<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_team_card',
    'title' => 'Team Card',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_team' => '', 'card_style' => 'default', 'show_federation' => true],
    'fields' => [
        'selected_team' => ['label' => 'Competition / Team', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionTeamOptions(), 'description' => 'Choose a participating approved team in its competition context.'],
        'name' => ['label' => 'Name', 'type' => 'text', 'source' => true],
        'short_name' => ['label' => 'Short Name', 'type' => 'text', 'source' => true],
        'alias' => ['label' => 'Alias', 'type' => 'text', 'source' => true],
        'logo' => ['label' => 'Logo', 'type' => 'text', 'source' => true],
        'country_code' => ['label' => 'Country', 'type' => 'text', 'source' => true],
        'city' => ['label' => 'City', 'type' => 'text', 'source' => true],
        'federation_name' => ['label' => 'Federation', 'type' => 'text', 'source' => true],
        'federation_short_name' => ['label' => 'Federation Short Name', 'type' => 'text', 'source' => true],
        'link_override' => ['label' => 'Link', 'type' => 'text', 'source' => true],
        'show_federation' => ['label' => 'Show Federation', 'type' => 'checkbox', 'text' => 'Display federation'],
        'card_style' => ['label' => 'Card Style', 'type' => 'select', 'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary']],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_team', 'link_override', 'show_federation']],
        ['title' => 'Overrides', 'fields' => ['name', 'short_name', 'alias', 'logo', 'country_code', 'city', 'federation_name', 'federation_short_name']],
        ['title' => 'Style', 'fields' => ['card_style']], '${builder.advanced}',
    ]]],
];
