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

$elements = [
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

foreach ($elements as $directory => $expect) {
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

$provider = builderRead($module . '/src/CompetitionProvider.php');
builderContains($provider, 'public static function competitionOptions(): array', 'Provider must expose competition choices');
builderContains($provider, 'public static function matchOptions(): array', 'Provider must expose match choices');
builderContains($provider, 'public static function competitionBySeasonId(', 'Provider must hydrate Competition Card from the selected season');
builderContains($provider, 'public static function match(', 'Provider must expose the public Match resolver used by Match Score');

$competitionTemplate = builderRead($module . '/elements/competition-card/templates/template.php');
builderContains($competitionTemplate, 'competitionBySeasonId', 'Competition Card must hydrate selected competition data');

$matchTemplate = builderRead($module . '/elements/match-score/templates/template.php');
builderContains($matchTemplate, "XdecaroCompetitionsProvider::match(null, ['match_id' =>", 'Match Score must hydrate the selected match through the public provider');

$standingsTemplate = builderRead($module . '/elements/standings-table/templates/template.php');
builderContains($standingsTemplate, 'selected_season_id', 'Standings Table must prefer the direct Competition / Season selector');

echo "PASS: Competitions builder selectors and icons contract\n";
