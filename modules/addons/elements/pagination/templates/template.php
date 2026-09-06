<?php

use Joomla\CMS\Factory;

$translations = [
    'en' => [
        'loadmore' => 'Load more',
        'previous' => 'Previous',
        'next' => 'Next',
        'loading' => 'Loading…',
        'end' => 'You have viewed all items',
        'error' => 'Unable to load the requested page. Please try again.',
    ],
    'it' => [
        'loadmore' => 'Carica altri',
        'previous' => 'Precedente',
        'next' => 'Successivo',
        'loading' => 'Caricamento…',
        'end' => 'Hai visualizzato tutti gli elementi',
        'error' => 'Impossibile caricare la pagina richiesta. Riprova.',
    ],
    'fr' => [
        'loadmore' => 'Charger plus',
        'previous' => 'Précédent',
        'next' => 'Suivant',
        'loading' => 'Chargement…',
        'end' => 'Vous avez affiché tous les éléments',
        'error' => 'Impossible de charger la page demandée. Réessayez.',
    ],
    'de' => [
        'loadmore' => 'Mehr laden',
        'previous' => 'Zurück',
        'next' => 'Weiter',
        'loading' => 'Wird geladen…',
        'end' => 'Alle Elemente wurden angezeigt',
        'error' => 'Die angeforderte Seite konnte nicht geladen werden. Bitte erneut versuchen.',
    ],
    'nl' => [
        'loadmore' => 'Meer laden',
        'previous' => 'Vorige',
        'next' => 'Volgende',
        'loading' => 'Laden…',
        'end' => 'Alle items zijn weergegeven',
        'error' => 'De gevraagde pagina kon niet worden geladen. Probeer het opnieuw.',
    ],
    'es' => [
        'loadmore' => 'Cargar más',
        'previous' => 'Anterior',
        'next' => 'Siguiente',
        'loading' => 'Cargando…',
        'end' => 'Has visto todos los elementos',
        'error' => 'No se ha podido cargar la página solicitada. Inténtalo de nuevo.',
    ],
    'pt' => [
        'loadmore' => 'Carregar mais',
        'previous' => 'Anterior',
        'next' => 'Seguinte',
        'loading' => 'A carregar…',
        'end' => 'Todos os itens foram apresentados',
        'error' => 'Não foi possível carregar a página pedida. Tente novamente.',
    ],
];

$languageCode = 'en';
try {
    $tag = Factory::getApplication()->getLanguage()->getTag();
    $languageCode = strtolower(substr((string) $tag, 0, 2));
} catch (\Throwable $e) {
}

$defaults = $translations[$languageCode] ?? $translations['en'];

$custom = [
    'loadmore' => trim((string) ($props['loadmore_text'] ?? '')),
    'previous' => trim((string) ($props['previous_text'] ?? '')),
    'next' => trim((string) ($props['next_text'] ?? '')),
    'loading' => trim((string) ($props['loading_text'] ?? '')),
    'end' => trim((string) ($props['end_text'] ?? '')),
    'error' => trim((string) ($props['error_text'] ?? '')),
];

$text = [];
foreach ($defaults as $key => $value) {
    $text[$key] = $custom[$key] !== '' ? $custom[$key] : $value;
}

$instanceId = !empty($attrs['id'])
    ? (string) $attrs['id']
    : 'x-pagination-' . substr(md5(json_encode($props)), 0, 10);
$attrs['id'] = $instanceId;

$style = (string) ($props['control_style'] ?? 'text');
$size = (string) ($props['control_size'] ?? '');
$width = (string) ($props['control_width'] ?? '');
$mode = (string) ($props['mode'] ?? 'loadmore');
$icon = (string) ($props['icon'] ?? 'arrow');
$iconPosition = (string) ($props['icon_position'] ?? 'right');

$buttonClasses = ['x-pagination__control'];
if ($style === 'custom') {
    $buttonClasses[] = 'x-pagination__control--custom';
} else {
    $buttonClasses[] = 'uk-button';
    $buttonClasses[] = 'uk-button-' . ($style !== '' ? $style : 'default');
}
if ($size !== '') {
    $buttonClasses[] = 'uk-button-' . $size;
}
if ($width !== '' && $mode === 'loadmore') {
    $buttonClasses[] = 'uk-width-' . $width;
}

$iconCharacter = [
    'arrow' => '→',
    'chevron' => '›',
    'plus' => '+',
    'none' => '',
][$icon] ?? '→';

$safeColor = static function ($value): string {
    $value = trim((string) $value);
    if ($value === '') {
        return '';
    }

    if (preg_match('/^#[0-9a-fA-F]{3,8}$/', $value)) {
        return $value;
    }

    if (preg_match('/^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s+-]+\)$/i', $value)) {
        return $value;
    }

    return '';
};

$variables = [];
$colorMap = [
    '--x-pagination-bg' => 'custom_background',
    '--x-pagination-color' => 'custom_color',
    '--x-pagination-border' => 'custom_border_color',
    '--x-pagination-hover-bg' => 'custom_hover_background',
    '--x-pagination-hover-color' => 'custom_hover_color',
    '--x-pagination-hover-border' => 'custom_hover_border_color',
    '--x-pagination-active-bg' => 'custom_active_background',
    '--x-pagination-active-color' => 'custom_active_color',
];

foreach ($colorMap as $cssVariable => $propName) {
    $value = $safeColor($props[$propName] ?? '');
    if ($value !== '') {
        $variables[] = $cssVariable . ':' . $value;
    }
}

$borderWidth = max(0, min(6, (int) ($props['custom_border_width'] ?? 1)));
$radius = max(0, min(50, (int) ($props['custom_radius'] ?? 0)));
$variables[] = '--x-pagination-border-width:' . $borderWidth . 'px';
$variables[] = '--x-pagination-radius:' . $radius . 'px';

if ($variables) {
    $existingStyle = trim((string) ($attrs['style'] ?? ''));
    $attrs['style'] = ($existingStyle !== '' ? rtrim($existingStyle, ';') . ';' : '') . implode(';', $variables);
}

$el = $this->el('div', [
    'class' => [
        'el-element',
        'x-pagination',
        'x-pagination--{control_style}',
        'uk-text-{text_align: center}',
        'uk-text-{text_align_breakpoint: center}@{text_align_breakpoint}',
        'uk-text-{text_align_fallback: center}',
    ],
    'data-x-pagination' => true,
    'data-mode' => $mode,
    'data-target-mode' => $props['target_mode'],
    'data-target-selector' => $props['target_selector'],
    'data-item-selector' => $props['item_selector'],
    'data-pagination-selector' => $props['pagination_selector'],
    'data-batch-size' => max(1, (int) ($props['batch_size'] ?? 4)),
    'data-threshold' => max(0, (int) ($props['threshold'] ?? 500)),
    'data-animation' => $props['animation'],
    'data-hide-pagination' => !empty($props['hide_pagination']) ? '1' : '0',
    'data-update-url' => !empty($props['update_url']) ? '1' : '0',
    'data-scroll-top' => !empty($props['scroll_top']) ? '1' : '0',
    'data-show-end-message' => !empty($props['show_end_message']) ? '1' : '0',
    'data-control-style' => $style,
    'data-control-size' => $size,
    'data-control-width' => $width,
    'data-icon' => $icon,
    'data-icon-position' => $iconPosition,
    'data-loadmore-text' => $custom['loadmore'],
    'data-previous-text' => $custom['previous'],
    'data-next-text' => $custom['next'],
    'data-loading-text' => $custom['loading'],
    'data-end-text' => $custom['end'],
    'data-error-text' => $custom['error'],
    'data-default-loadmore-text' => $text['loadmore'],
    'data-default-previous-text' => $text['previous'],
    'data-default-next-text' => $text['next'],
    'data-default-loading-text' => $text['loading'],
    'data-default-end-text' => $text['end'],
    'data-default-error-text' => $text['error'],
    'aria-live' => 'polite',
]);

?>

<?= $el($props, $attrs) ?>

    <?php if ($mode === 'loadmore'): ?>
        <button type="button" class="<?= implode(' ', array_map('htmlspecialchars', $buttonClasses)) ?>" data-x-pagination-loadmore hidden>
            <?php if ($iconCharacter !== '' && $iconPosition === 'left'): ?>
                <span class="x-pagination__icon x-pagination__icon--left" aria-hidden="true"><?= htmlspecialchars($iconCharacter, ENT_QUOTES, 'UTF-8') ?></span>
            <?php endif; ?>
            <span data-x-pagination-label><?= htmlspecialchars($text['loadmore'], ENT_QUOTES, 'UTF-8') ?></span>
            <?php if ($iconCharacter !== '' && $iconPosition !== 'left'): ?>
                <span class="x-pagination__icon x-pagination__icon--right" aria-hidden="true"><?= htmlspecialchars($iconCharacter, ENT_QUOTES, 'UTF-8') ?></span>
            <?php endif; ?>
            <span class="x-pagination__spinner" data-x-pagination-spinner aria-hidden="true"></span>
        </button>
    <?php elseif ($mode === 'infinite'): ?>
        <div class="x-pagination__sentinel" data-x-pagination-sentinel aria-hidden="true" hidden></div>
        <div class="x-pagination__loading" data-x-pagination-loading hidden>
            <span class="x-pagination__spinner x-pagination__spinner--visible" aria-hidden="true"></span>
            <span data-x-pagination-loading-label><?= htmlspecialchars($text['loading'], ENT_QUOTES, 'UTF-8') ?></span>
        </div>
    <?php else: ?>
        <nav class="x-pagination__nav" data-x-pagination-nav aria-label="Pagination" hidden></nav>
    <?php endif; ?>

    <div class="x-pagination__message" data-x-pagination-message hidden></div>

<?= $el->end() ?>
