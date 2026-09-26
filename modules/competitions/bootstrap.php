<?php

defined('_JEXEC') || die;

use YOOtheme\Builder;
use YOOtheme\Path;

include_once __DIR__ . '/src/CompetitionProvider.php';
include_once __DIR__ . '/src/SourceListener.php';
include_once __DIR__ . '/src/Type/CompetitionType.php';
include_once __DIR__ . '/src/Type/TeamType.php';
include_once __DIR__ . '/src/Type/MatchType.php';
include_once __DIR__ . '/src/Type/StandingType.php';
include_once __DIR__ . '/src/Type/RankingType.php';
include_once __DIR__ . '/src/Type/CountryType.php';
include_once __DIR__ . '/src/Type/FederationType.php';
include_once __DIR__ . '/src/Type/QueryType.php';

return [
    'events' => [
        'source.init' => [
            XdecaroCompetitionsSourceListener::class => 'initSource',
        ],
    ],

    'extend' => [
        Builder::class => function (Builder $builder) {
            $builder->addTypePath(Path::get('./elements/*/element.php'));
        },
    ],
];
