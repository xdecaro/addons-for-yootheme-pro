<?php

$root = dirname(__DIR__);
$bootstrap = $root . '/modules/competitions/bootstrap.php';
$listener = $root . '/modules/competitions/src/SourceListener.php';
$query = $root . '/modules/competitions/src/Type/QueryType.php';
$provider = $root . '/modules/competitions/src/CompetitionProvider.php';

foreach ([$bootstrap, $listener, $query, $provider] as $file) {
    if (!is_file($file)) {
        fwrite(STDERR, "Missing competitions source file: {$file}\n");
        exit(1);
    }
}

$bootstrapSource = file_get_contents($bootstrap);
$listenerSource = file_get_contents($listener);
$querySource = file_get_contents($query);
$providerSource = file_get_contents($provider);

if (!str_contains($bootstrapSource, "'source.init'")) {
    fwrite(STDERR, "Competitions module does not register source.init\n");
    exit(1);
}

foreach ([
    'XdecaroCompetition',
    'XdecaroCompetitionMatch',
    'XdecaroCompetitionTeam',
    'XdecaroCompetitionCountry',
    'XdecaroCompetitionFederation',
] as $type) {
    if (!str_contains($listenerSource, $type)) {
        fwrite(STDERR, "Missing source type registration: {$type}\n");
        exit(1);
    }
}

foreach ([
    'xdecaro_current_competitions',
    'xdecaro_upcoming_competitions',
    'xdecaro_previous_competitions',
    'xdecaro_upcoming_matches',
    'xdecaro_latest_results',
    'xdecaro_participating_teams',
    'xdecaro_countries',
    'xdecaro_federations',
] as $field) {
    if (!str_contains($querySource, "'{$field}'")) {
        fwrite(STDERR, "Missing query source: {$field}\n");
        exit(1);
    }
}

if (!str_contains($providerSource, "bootComponent('com_xdecarocompetitions')")) {
    fwrite(STDERR, "Provider must consume Competitions public component API\n");
    exit(1);
}

if (!str_contains($providerSource, 'getPublicBuilderDataService')) {
    fwrite(STDERR, "Provider must use Competitions public builder service\n");
    exit(1);
}

if (preg_match('/#__xdecarocompetitions_/i', $providerSource)) {
    fwrite(STDERR, "YOOtheme addon must not read Competitions private tables\n");
    exit(1);
}

echo "competitions-source-contract=ok\n";
