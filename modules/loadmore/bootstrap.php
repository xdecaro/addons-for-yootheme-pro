<?php

use YOOtheme\Builder;
use YOOtheme\Path;

include_once __DIR__ . '/src/AssetsListener.php';

return [
    'events' => [
        'theme.head' => [
            LoadMoreYoothemeAssetsListener::class => 'initHead',
        ],
    ],

    'extend' => [
        Builder::class => function (Builder $builder) {
            $builder->addTypePath(Path::get('./elements/*/element.php'));
        },
    ],
];
