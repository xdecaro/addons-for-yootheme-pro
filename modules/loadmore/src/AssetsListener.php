<?php

use YOOtheme\Metadata;
use YOOtheme\Path;

final class LoadMoreYoothemeAssetsListener
{
    private const VERSION = '1.1.0';

    public static function initHead(Metadata $metadata): void
    {
        $metadata->set('style:load-more-yootheme', [
            'href' => Path::get('../assets/css/loadmore.css') . '?v=' . self::VERSION,
        ]);

        $metadata->set('script:load-more-yootheme', [
            'src' => Path::get('../assets/js/loadmore.js') . '?v=' . self::VERSION,
            'defer' => true,
        ]);

        $metadata->set('style:unfold-xdecaro', [
            'href' => Path::get('../assets/css/unfold.css') . '?v=' . self::VERSION,
        ]);

        $metadata->set('script:unfold-xdecaro', [
            'src' => Path::get('../assets/js/unfold.js') . '?v=' . self::VERSION,
            'defer' => true,
        ]);
    }
}
