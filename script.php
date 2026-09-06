<?php

defined('_JEXEC') || die;

use Joomla\CMS\Filesystem\File;
use Joomla\CMS\Filesystem\Folder;

final class PlgSystemXdecaroInstallerScript
{
    public function postflight(string $type, $parent): bool
    {
        if (!in_array($type, ['install', 'update'], true)) {
            return true;
        }

        $root = JPATH_PLUGINS . '/system/xdecaro';

        $legacyFiles = [
            $root . '/modules/addons/assets/css/load-more.css',
            $root . '/modules/addons/assets/js/load-more.js',
            $root . '/modules/addons/assets/js/load-more-stability.js',
            $root . '/modules/addons/assets/js/load-more-lifecycle.js',
            $root . '/modules/addons/assets/js/load-more-visibility.js',
            $root . '/modules/addons/assets/js/load-more-builder-preview.js',
        ];

        foreach ($legacyFiles as $file) {
            if (is_file($file) && !File::delete($file)) {
                throw new RuntimeException('Impossibile rimuovere il file legacy: ' . $file);
            }
        }

        $legacyElement = $root . '/modules/addons/elements/load-more';
        if (is_dir($legacyElement) && !Folder::delete($legacyElement)) {
            throw new RuntimeException('Impossibile rimuovere il vecchio elemento Load More: ' . $legacyElement);
        }

        return true;
    }
}
