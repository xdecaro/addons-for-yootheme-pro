<?php

use YOOtheme\Metadata;
use YOOtheme\Path;

final class XdecaroAssetsListener
{
    private static ?string $version = null;

    public static function initHead(Metadata $metadata): void
    {
        $version = rawurlencode(self::getVersion());

        $metadata->set('style:xdecaro-load-more', [
            'href' => Path::get('../assets/css/load-more.css') . '?v=' . $version,
        ]);

        $metadata->set('script:xdecaro-load-more', [
            'src' => Path::get('../assets/js/load-more.js') . '?v=' . $version,
            'defer' => true,
        ]);

        $metadata->set('script:xdecaro-load-more-stability', [
            'src' => Path::get('../assets/js/load-more-stability.js') . '?v=' . $version,
            'defer' => true,
        ]);

        $metadata->set('script:xdecaro-load-more-lifecycle', [
            'src' => Path::get('../assets/js/load-more-lifecycle.js') . '?v=' . $version,
            'defer' => true,
        ]);

        $metadata->set('style:xdecaro-unfold', [
            'href' => Path::get('../assets/css/unfold.css') . '?v=' . $version,
        ]);

        $metadata->set('script:xdecaro-unfold', [
            'src' => Path::get('../assets/js/unfold.js') . '?v=' . $version,
            'defer' => true,
        ]);
    }

    private static function getVersion(): string
    {
        if (self::$version !== null) {
            return self::$version;
        }

        $manifest = dirname(__DIR__, 3) . '/xdecaro.xml';

        if (is_file($manifest)) {
            $xml = @simplexml_load_file($manifest);
            if ($xml !== false && isset($xml->version)) {
                $version = trim((string) $xml->version);
                if ($version !== '') {
                    return self::$version = $version;
                }
            }
        }

        return self::$version = '1';
    }
}
