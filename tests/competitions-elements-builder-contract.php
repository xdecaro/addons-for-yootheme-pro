<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$module = $root . '/modules/competitions';

function builderFail(string $message): never
{
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
}

function builderRead(string $path): string
{
    if (!is_file($path)) {
        builderFail('Missing required file: ' . $path);
    }

    return (string) file_get_contents($path);
}

function builderContains(string $haystack, string $needle, string $message): void
{
    if (!str_contains($haystack, $needle)) {
        builderFail($message . " (missing: {$needle})");
    }
}

function builderNotContains(string $haystack, string $needle, string $message): void
{
    if (str_contains($haystack, $needle)) {
        builderFail($message . " (forbidden: {$needle})");
    }
}

$existingElements = [
    'competition-card' => [
        'field' => "'selected_season_id'",
        'options' => 'XdecaroCompetitionsProvider::competitionOptions()',
    ],
    'match-score' => [
        'field' => "'selected_match_id'",
        'options' => 'XdecaroCompetitionsProvider::matchOptions()',
    ],
    'standings-table' => [
        'field' => "'selected_season_id'",
        'options' => 'XdecaroCompetitionsProvider::competitionOptions()',
    ],
];

foreach ($existingElements as $directory => $expect) {
    $base = $module . '/elements/' . $directory;
    $element = builderRead($base . '/element.php');

    builderRead($base . '/images/icon.svg');
    builderRead($base . '/images/iconSmall.svg');
    builderContains($element, "'icon' => '\${url:images/icon.svg}'", "{$directory} must declare its large icon using the same YOOtheme URL syntax as the existing xdecaro elements");
    builderContains($element, "'iconSmall' => '\${url:images/iconSmall.svg}'", "{$directory} must declare its small icon using the same YOOtheme URL syntax as the existing xdecaro elements");
    builderContains($element, $expect['field'], "{$directory} must expose its direct selector");
    builderContains($element, "'type' => 'select'", "{$directory} direct selector must be a select field");
    builderContains($element, $expect['options'], "{$directory} must populate the selector from Competitions");
}

$providerPath = $module . '/src/CompetitionProvider.php';
$provider = builderRead($providerPath);
builderContains($provider, 'public static function competitionOptions(): array', 'Provider must expose competition choices');
builderContains($provider, 'public static function matchOptions(): array', 'Provider must expose match choices');
builderContains($provider, 'public static function competitionBySeasonId(', 'Provider must hydrate Competition Card from the selected season');
builderContains($provider, 'public static function match(', 'Provider must expose the public Match resolver used by Match Score');

foreach ([
    'federationOptions',
    'federationById',
    'competitionTeamOptions',
    'teamBySelection',
    'competitionRosterPlayerOptions',
    'rosterPlayerBySelection',
    'rosterBySelection',
] as $method) {
    builderContains($provider, 'public static function ' . $method . '(', "Provider must expose {$method}");
}

foreach (['#__xdecarocompetitions_', '#__xdecaropeople_', '#__xdecaroorganizations_'] as $privatePrefix) {
    builderNotContains($provider, $privatePrefix, 'YOOtheme provider must consume public component services instead of private tables');
}

builderContains($provider, "explode(':',", 'Scoped entity selections must be parsed explicitly');
builderContains($provider, "getParticipatingTeams", 'Team selections must be revalidated against approved participating teams');
builderContains($provider, "getRoster", 'Roster selections must be revalidated through the public roster service');

$newElements = [
    'federation-card' => [
        'name' => 'xdecaro_federation_card',
        'selector' => "'selected_federation_id'",
        'options' => 'XdecaroCompetitionsProvider::federationOptions()',
    ],
    'team-card' => [
        'name' => 'xdecaro_team_card',
        'selector' => "'selected_team'",
        'options' => 'XdecaroCompetitionsProvider::competitionTeamOptions()',
    ],
    'teams-grid' => [
        'name' => 'xdecaro_teams_grid',
        'selector' => "'selected_season_id'",
        'options' => 'XdecaroCompetitionsProvider::competitionOptions()',
    ],
    'player-card' => [
        'name' => 'xdecaro_player_card',
        'selector' => "'selected_roster_player'",
        'options' => 'XdecaroCompetitionsProvider::competitionRosterPlayerOptions()',
    ],
    'team-roster' => [
        'name' => 'xdecaro_team_roster',
        'selector' => "'selected_team'",
        'options' => 'XdecaroCompetitionsProvider::competitionTeamOptions()',
    ],
];

$forbiddenPlayerFields = ['birth_date', 'external_ref', 'person_uuid', 'review_note', 'iscd', 'medical'];

foreach ($newElements as $directory => $expect) {
    $base = $module . '/elements/' . $directory;
    $element = builderRead($base . '/element.php');
    $template = builderRead($base . '/templates/template.php');
    builderRead($base . '/templates/content.php');
    builderRead($base . '/images/icon.svg');
    builderRead($base . '/images/iconSmall.svg');

    builderContains($element, "'name' => '" . $expect['name'] . "'", "{$directory} must use its stable element name");
    builderContains($element, "'group' => 'xdecaro'", "{$directory} must stay in the xdecaro group");
    builderContains($element, "'icon' => '\${url:images/icon.svg}'", "{$directory} must declare a packaged large icon");
    builderContains($element, "'iconSmall' => '\${url:images/iconSmall.svg}'", "{$directory} must declare a packaged small icon");
    builderContains($element, $expect['selector'], "{$directory} must expose its human-readable direct selector");
    builderContains($element, $expect['options'], "{$directory} must populate its selector from Competitions");

    if (in_array($directory, ['player-card', 'team-roster'], true)) {
        $publicSurface = strtolower($element . "\n" . $template);
        foreach ($forbiddenPlayerFields as $field) {
            builderNotContains($publicSurface, $field, "{$directory} must not expose sensitive player field {$field}");
        }
    }
}

$rosterElement = builderRead($module . '/elements/team-roster/element.php');
builderContains($rosterElement, "'grid'", 'Team Roster must support grid mode');
builderContains($rosterElement, "'list'", 'Team Roster must support list mode');

$competitionTemplate = builderRead($module . '/elements/competition-card/templates/template.php');
builderContains($competitionTemplate, 'competitionBySeasonId', 'Competition Card must hydrate selected competition data');

$matchTemplate = builderRead($module . '/elements/match-score/templates/template.php');
builderContains($matchTemplate, "XdecaroCompetitionsProvider::match(null, ['match_id' =>", 'Match Score must hydrate the selected match through the public provider');

$standingsTemplate = builderRead($module . '/elements/standings-table/templates/template.php');
builderContains($standingsTemplate, 'selected_season_id', 'Standings Table must prefer the direct Competition / Season selector');

echo "PASS: Competitions builder selectors, entity privacy and icons contract\n";
