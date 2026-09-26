<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_teams_grid',
    'title' => 'Teams Grid',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_season_id' => '', 'columns' => '3', 'show_short_name' => true, 'show_country' => true, 'show_federation' => true, 'empty_text' => 'No participating teams available.'],
    'fields' => [
        'selected_season_id' => ['label' => 'Competition', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionOptions(), 'description' => 'Choose a competition to show its approved participating teams.'],
        'season_id' => ['label' => 'Dynamic Season ID', 'type' => 'text', 'source' => true],
        'columns' => ['label' => 'Columns', 'type' => 'select', 'options' => ['2' => '2', '3' => '3', '4' => '4']],
        'show_short_name' => ['label' => 'Short Name', 'type' => 'checkbox', 'text' => 'Show short name'],
        'show_country' => ['label' => 'Country', 'type' => 'checkbox', 'text' => 'Show country'],
        'show_federation' => ['label' => 'Federation', 'type' => 'checkbox', 'text' => 'Show federation'],
        'empty_text' => ['label' => 'Empty Text', 'type' => 'text'],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_season_id', 'empty_text']],
        ['title' => 'Display', 'fields' => ['columns', 'show_short_name', 'show_country', 'show_federation']],
        ['title' => 'Dynamic', 'fields' => ['season_id']], '${builder.advanced}',
    ]]],
];
