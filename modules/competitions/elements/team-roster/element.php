<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_team_roster',
    'title' => 'Team Roster',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_team' => '', 'mode' => 'grid', 'columns' => '3', 'show_role' => true, 'show_nationality' => true, 'empty_text' => 'No approved roster players available.'],
    'fields' => [
        'selected_team' => ['label' => 'Competition / Team', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionTeamOptions(), 'description' => 'Choose a participating team to render its approved competition roster.'],
        'mode' => ['label' => 'Layout', 'type' => 'select', 'options' => ['Grid' => 'grid', 'List' => 'list']],
        'columns' => ['label' => 'Grid Columns', 'type' => 'select', 'options' => ['2' => '2', '3' => '3', '4' => '4']],
        'show_role' => ['label' => 'Role', 'type' => 'checkbox', 'text' => 'Show role'],
        'show_nationality' => ['label' => 'Nationality', 'type' => 'checkbox', 'text' => 'Show nationality'],
        'empty_text' => ['label' => 'Empty Text', 'type' => 'text'],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_team', 'empty_text']],
        ['title' => 'Display', 'fields' => ['mode', 'columns', 'show_role', 'show_nationality']], '${builder.advanced}',
    ]]],
];
