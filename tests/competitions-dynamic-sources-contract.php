<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$module = $root . '/modules/competitions';

function fail(string $message): never
{
    fwrite(STDERR, "FAIL: {$message}\n");
    exit(1);
}

function readRequired(string $path): string
{
    if (!is_file($path)) {
        fail('Missing required file: ' . $path);
    }

    return (string) file_get_contents($path);
}

function expectContains(string $haystack, string $needle, string $message): void
{
    if (!str_contains($haystack, $needle)) {
        fail($message . " (missing: {$needle})");
    }
}

function expectNotContains(string $haystack, string $needle, string $message): void
{
    if (str_contains($haystack, $needle)) {
        fail($message . " (forbidden: {$needle})");
    }
}

$bootstrap = readRequired($module . '/bootstrap.php');
$listener = readRequired($module . '/src/SourceListener.php');
$provider = readRequired($module . '/src/CompetitionProvider.php');
$queryType = readRequired($module . '/src/Type/QueryType.php');

expectContains($bootstrap, "'source.init'", 'Competitions module must register source.init');
expectContains($bootstrap, "XdecaroCompetitionsSourceListener::class => ['initSource']", 'source.init must use the documented serializable YOOtheme listener form');
expectContains($listener, 'objectType(', 'Source listener must register object types');
expectContains($listener, 'queryType(', 'Source listener must extend the Query type');
expectContains($provider, "bootComponent('com_xdecarocompetitions')", 'Provider must use the real Competitions component identity');
expectNotContains($provider, "bootComponent('com_competitions')", 'Legacy/incorrect component identity must not be used');
expectContains($provider, 'getPublicBuilderDataService', 'Provider must consume PublicBuilderDataService');
expectNotContains($provider, 'DatabaseInterface', 'YOOtheme addon must not query the Competitions database directly');
expectNotContains($provider, '#__xdecarocompetitions_', 'YOOtheme addon must not read Competitions private tables');

foreach (['competitionOptions', 'matchOptions', 'competitionBySeasonId'] as $method) {
    expectContains($provider, 'function ' . $method . '(', "Provider must expose {$method} for Builder selectors");
}

$queries = [
    'xdecaro_current_competitions',
    'xdecaro_upcoming_competitions',
    'xdecaro_previous_competitions',
    'xdecaro_competitions_by_year',
    'xdecaro_competitions_by_tournament',
    'xdecaro_upcoming_seasons',
    'xdecaro_participating_teams',
    'xdecaro_team',
    'xdecaro_upcoming_matches',
    'xdecaro_latest_results',
    'xdecaro_matches_by_season',
    'xdecaro_match',
    'xdecaro_standings',
    'xdecaro_rankings',
    'xdecaro_countries',
    'xdecaro_federations',
];
foreach ($queries as $query) {
    expectContains($queryType, "'{$query}'", "Missing YOOtheme query {$query}");
}

$types = [
    'XdecaroCompetition',
    'XdecaroCompetitionTeam',
    'XdecaroCompetitionMatch',
    'XdecaroCompetitionStanding',
    'XdecaroCompetitionRanking',
    'XdecaroCompetitionCountry',
    'XdecaroCompetitionFederation',
];
foreach ($types as $type) {
    expectContains($listener, "'{$type}'", "Missing GraphQL object type {$type}");
}

$elements = [
    'competition-card' => 'xdecaro_competition_card',
    'match-score' => 'xdecaro_match_score',
    'standings-table' => 'xdecaro_standings_table',
];
foreach ($elements as $directory => $technicalName) {
    $base = $module . '/elements/' . $directory;
    $element = readRequired($base . '/element.php');
    $template = readRequired($base . '/templates/template.php');
    expectContains($element, "'name' => '{$technicalName}'", "Wrong technical name for {$directory}");
    expectContains($element, "'group' => 'xdecaro'", "{$directory} must stay in the XDECARO group");
    expectContains($element, "'source' => true", "{$directory} must expose dynamically mappable fields");
    expectContains($element, "'icon' => '${url:images/icon.svg}'", "{$directory} must declare its large Builder icon");
    expectContains($element, "'iconSmall' => '${url:images/iconSmall.svg}'", "{$directory} must declare its small Builder icon");
    readRequired($base . '/images/icon.svg');
    readRequired($base . '/images/iconSmall.svg');
    expectNotContains($template, '#091247', "{$directory} must inherit YOOtheme style instead of hard-coding DCL navy");
    expectNotContains($template, '#2E58A6', "{$directory} must inherit YOOtheme style instead of hard-coding DCL blue");
}

$competitionElement = readRequired($module . '/elements/competition-card/element.php');
$competitionTemplate = readRequired($module . '/elements/competition-card/templates/template.php');
expectContains($competitionElement, "'selected_season_id'", 'Competition Card must expose a Competition selector');
expectContains($competitionElement, 'XdecaroCompetitionsProvider::competitionOptions()', 'Competition Card selector must use public Competitions data');
expectContains($competitionTemplate, 'competitionBySeasonId', 'Competition Card must resolve the selected competition');

$matchElement = readRequired($module . '/elements/match-score/element.php');
$matchTemplate = readRequired($module . '/elements/match-score/templates/template.php');
expectContains($matchElement, "'selected_match_id'", 'Match Score must expose a Match selector');
expectContains($matchElement, 'XdecaroCompetitionsProvider::matchOptions()', 'Match Score selector must use public Competitions data');
expectContains($matchTemplate, "'match_id'", 'Match Score must resolve the selected match through the provider');
expectNotContains($matchTemplate, '0 - 0', 'Scheduled matches must not invent a 0-0 score');
expectNotContains($matchTemplate, '0–0', 'Scheduled matches must not invent a 0–0 score');

$standingsElement = readRequired($module . '/elements/standings-table/element.php');
$standingsTemplate = readRequired($module . '/elements/standings-table/templates/template.php');
expectContains($standingsElement, "'selected_season_id'", 'Standings Table must expose a Competition/Season selector');
expectContains($standingsElement, 'XdecaroCompetitionsProvider::competitionOptions()', 'Standings selector must use public Competitions data');
expectContains($standingsTemplate, "selected_season_id", 'Standings must prefer the selected Competition/Season');
expectContains($standingsTemplate, '<table', 'Standings must use semantic table markup');
expectContains($standingsTemplate, '<thead', 'Standings must include a semantic table head');
expectContains($standingsTemplate, '<tbody', 'Standings must include a semantic table body');

foreach (['CompetitionType.php', 'TeamType.php', 'MatchType.php', 'StandingType.php', 'RankingType.php', 'CountryType.php', 'FederationType.php'] as $file) {
    $typeConfig = readRequired($module . '/src/Type/' . $file);
    expectContains($typeConfig, "'type' => true", "{$file} must be usable as a dynamic content source");
}

echo "PASS: Competitions dynamic sources contract\n";
