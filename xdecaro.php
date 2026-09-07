<?php

defined('_JEXEC') || exit();

use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\SubscriberInterface;
use YOOtheme\Application;

final class PlgSystemXdecaro extends CMSPlugin implements SubscriberInterface
{
    private bool $modulesLoaded = false;

    public static function getSubscribedEvents(): array
    {
        return [
            'onAfterInitialise' => 'loadModules',
            'onAfterRoute' => 'loadModules',
        ];
    }

    public function loadModules(): void
    {
        if ($this->modulesLoaded || !class_exists(Application::class, false)) {
            return;
        }

        $autoload = __DIR__ . '/vendor/autoload.php';
        if (is_file($autoload)) {
            require_once $autoload;
        }

        Application::getInstance()->load(__DIR__ . '/modules/*/bootstrap.php');
        $this->modulesLoaded = true;
    }
}
