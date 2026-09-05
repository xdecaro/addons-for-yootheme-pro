<?php

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\Database\DatabaseInterface;

$options = ['— Seleziona modulo —' => ''];
$formsAvailable = false;

try {
    $db = Factory::getContainer()->get(DatabaseInterface::class);
    $query = $db->getQuery(true)
        ->select([
            $db->quoteName('id'),
            $db->quoteName('title'),
            $db->quoteName('enabled'),
        ])
        ->from($db->quoteName('#__decaroforms_forms'))
        ->order($db->quoteName('title') . ' ASC');
    $db->setQuery($query);

    foreach ($db->loadAssocList() ?: [] as $form) {
        $id = (int) ($form['id'] ?? 0);
        if ($id < 1) {
            continue;
        }

        $title = trim((string) ($form['title'] ?? '')) ?: ('Form #' . $id);
        if (!(bool) ($form['enabled'] ?? false)) {
            $title .= ' — chiuso';
        }

        $options[$title . ' (#' . $id . ')'] = (string) $id;
        $formsAvailable = true;
    }
} catch (\Throwable) {
    // Forms può non essere ancora installato durante la registrazione dell'elemento.
}

return [
    'name' => 'xdecaro_forms_form',
    'title' => 'Form',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],
    'defaults' => [
        'form_id' => '',
        'manual_id' => '',
    ],
    'fields' => [
        'form_id' => [
            'label' => 'Modulo',
            'type' => 'select',
            'description' => $formsAvailable
                ? 'Scegli un modulo creato nel componente Forms.'
                : 'Nessun modulo trovato. Verifica che Forms sia installato oppure usa l’ID manuale.',
            'options' => $options,
        ],
        'manual_id' => [
            'label' => 'ID modulo manuale',
            'type' => 'number',
            'description' => 'Opzionale. Se compilato, ha priorità sulla selezione sopra.',
            'attrs' => [
                'min' => 1,
                'step' => 1,
                'placeholder' => 'es. 1',
            ],
        ],
    ],
    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                [
                    'title' => 'Content',
                    'fields' => ['form_id'],
                ],
                [
                    'title' => 'Settings',
                    'fields' => ['manual_id'],
                ],
            ],
        ],
    ],
];
