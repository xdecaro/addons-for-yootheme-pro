<?php

defined('_JEXEC') || exit();

use Joomla\CMS\Application\CMSApplication;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\Event\SubscriberInterface;
use YOOtheme\Application;

final class PlgSystemXdecaro extends CMSPlugin implements SubscriberInterface
{
    /** @var CMSApplication */
    public $app;

    public static function getSubscribedEvents(): array
    {
        return ['onAfterInitialise' => 'onAfterInitialise'];
    }

    public function onAfterInitialise(): void
    {
        if (!class_exists(Application::class, false)) {
            return;
        }

        $autoload = __DIR__ . '/vendor/autoload.php';
        if (is_file($autoload)) {
            require_once $autoload;
        }

        Application::getInstance()->load(__DIR__ . '/modules/*/bootstrap.php');
    }
}
