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
        'field' => "'competition_id'",
        'options' => 'XdecaroCompetitionsProvider::competitionOptions()',
    ],
    'match-score' => [
        'field' => "'match_id'",
        'options' => 'XdecaroCompetitionsProvider::matchOptions()',
    ],
    'standings-table' => [
        'field' => "'season_id'",
        'options' => 'XdecaroCompetitionsProvider::competitionOptions()',
    ],
];

foreach ($elements as $directory => $expect) {
    $base = $module . '/elements/' . $directory;
    $element = builderRead($base . '/element.php');

    builderRead($base . '/images/icon.svg');
    builderRead($base . '/images/iconSmall.svg');
    builderContains($element, "'icon' => __DIR__ . '/images/icon.svg'", "{$directory} must declare its large icon");
    builderContains($element, "'iconSmall' => __DIR__ . '/images/iconSmall.svg'", "{$directory} must declare its small icon");
    builderContains($element, $expect['field'], "{$directory} must expose its direct selector");
    builderContains($element, "'type' => 'select'", "{$directory} direct selector must be a select field");
    builderContains($element, $expect['options'], "{$directory} must populate the selector from Competitions");
}

$provider = builderRead($module . '/src/CompetitionProvider.php');
builderContains($provider, 'public static function competitionOptions(): array', 'Provider must expose competition choices');
builderContains($provider, 'public static function matchOptions(): array', 'Provider must expose match choices');
builderContains($provider, 'public static function competitionBySeasonId(', 'Provider must hydrate Competition Card from the selected season');
builderContains($provider, 'public static function matchById(', 'Provider must hydrate Match Score from the selected match');

$competitionTemplate = builderRead($module . '/elements/competition-card/templates/template.php');
builderContains($competitionTemplate, 'competitionBySeasonId', 'Competition Card must hydrate selected competition data');

$matchTemplate = builderRead($module . '/elements/match-score/templates/template.php');
builderContains($matchTemplate, 'matchById', 'Match Score must hydrate selected match data');

echo "PASS: Competitions builder selectors and icons contract\n";
