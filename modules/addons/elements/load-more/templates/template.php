<?php

use Joomla\CMS\Factory;

$translations = [
    'en' => [
        'button' => 'Load more',
        'loading' => 'Loading…',
        'end' => 'You have viewed all items',
        'error' => 'Unable to load more items. Please try again.',
    ],
    'it' => [
        'button' => 'Carica altri',
        'loading' => 'Caricamento…',
        'end' => 'Hai visualizzato tutti gli elementi',
        'error' => 'Impossibile caricare altri elementi. Riprova.',
    ],
    'fr' => [
        'button' => 'Charger plus',
        'loading' => 'Chargement…',
        'end' => 'Vous avez affiché tous les éléments',
        'error' => 'Impossible de charger plus d’éléments. Réessayez.',
    ],
    'de' => [
        'button' => 'Mehr laden',
        'loading' => 'Wird geladen…',
        'end' => 'Alle Elemente wurden angezeigt',
        'error' => 'Weitere Elemente konnten nicht geladen werden. Bitte erneut versuchen.',
    ],
    'nl' => [
        'button' => 'Meer laden',
        'loading' => 'Laden…',
        'end' => 'Alle items zijn weergegeven',
        'error' => 'Meer items laden is niet gelukt. Probeer het opnieuw.',
    ],
    'es' => [
        'button' => 'Cargar más',
        'loading' => 'Cargando…',
        'end' => 'Has visto todos los elementos',
        'error' => 'No se han podido cargar más elementos. Inténtalo de nuevo.',
    ],
    'pt' => [
        'button' => 'Carregar mais',
        'loading' => 'A carregar…',
        'end' => 'Todos os itens foram apresentados',
        'error' => 'Não foi possível carregar mais itens. Tente novamente.',
    ],
];

$languageCode = 'en';
try {
    $tag = Factory::getApplication()->getLanguage()->getTag();
    $languageCode = strtolower(substr((string) $tag, 0, 2));
} catch (\Throwable $e) {
}

$defaultText = $translations[$languageCode] ?? $translations['en'];

$customButtonText = trim((string) ($props['button_text'] ?? ''));
$customLoadingText = trim((string) ($props['loading_text'] ?? ''));
$customEndText = trim((string) ($props['end_text'] ?? ''));
$customErrorText = trim((string) ($props['error_text'] ?? ''));

$buttonText = $customButtonText !== '' ? $customButtonText : $defaultText['button'];
$loadingText = $customLoadingText !== '' ? $customLoadingText : $defaultText['loading'];
$endText = $customEndText !== '' ? $customEndText : $defaultText['end'];
$errorText = $customErrorText !== '' ? $customErrorText : $defaultText['error'];

$instanceId = !empty($attrs['id']) ? (string) $attrs['id'] : 'yt-loadmore-' . substr(md5(json_encode($props)), 0, 10);
$attrs['id'] = $instanceId;

$buttonClass = ['uk-button'];
$buttonClass[] = 'uk-button-' . ($props['button_style'] ?: 'default');
if (!empty($props['button_size'])) {
    $buttonClass[] = 'uk-button-' . $props['button_size'];
}
if (!empty($props['button_width'])) {
    $buttonClass[] = 'uk-width-' . $props['button_width'];
}

$el = $this->el('div', [
    'class' => [
        'el-element',
        'yt-loadmore',
        'uk-text-{text_align: center}',
        'uk-text-{text_align_breakpoint: center}@{text_align_breakpoint}',
        'uk-text-{text_align_fallback: center}',
    ],
    'data-yt-loadmore' => true,
    'data-mode' => $props['mode'],
    'data-target-mode' => $props['target_mode'],
    'data-target-selector' => $props['target_selector'],
    'data-item-selector' => $props['item_selector'],
    'data-next-selector' => $props['next_selector'],
    'data-pagination-selector' => $props['pagination_selector'],
    'data-batch-size' => max(1, (int) ($props['batch_size'] ?? 4)),
    'data-button-text' => $customButtonText,
    'data-loading-text' => $customLoadingText,
    'data-end-text' => $customEndText,
    'data-error-text' => $customErrorText,
    'data-default-button-text' => $buttonText,
    'data-default-loading-text' => $loadingText,
    'data-default-end-text' => $endText,
    'data-default-error-text' => $errorText,
    'data-threshold' => (int) $props['threshold'],
    'data-animation' => $props['animation'],
    'data-hide-pagination' => !empty($props['hide_pagination']) ? '1' : '0',
    'data-update-url' => !empty($props['update_url']) ? '1' : '0',
    'data-show-end-message' => !empty($props['show_end_message']) ? '1' : '0',
    'aria-live' => 'polite',
]);

?>

<?= $el($props, $attrs) ?>

    <?php if ($props['mode'] === 'button'): ?>
        <button type="button" class="<?= implode(' ', array_map('htmlspecialchars', $buttonClass)) ?>" data-yt-loadmore-button hidden>
            <span data-yt-loadmore-label><?= htmlspecialchars($buttonText, ENT_QUOTES, 'UTF-8') ?></span>
            <span class="yt-loadmore__spinner" data-yt-loadmore-spinner aria-hidden="true"></span>
        </button>
    <?php else: ?>
        <div class="yt-loadmore__sentinel" data-yt-loadmore-sentinel aria-hidden="true" hidden></div>
        <div class="yt-loadmore__loading" data-yt-loadmore-loading hidden>
            <span class="yt-loadmore__spinner yt-loadmore__spinner--visible" aria-hidden="true"></span>
            <span data-yt-loadmore-loading-label><?= htmlspecialchars($loadingText, ENT_QUOTES, 'UTF-8') ?></span>
        </div>
    <?php endif; ?>

    <div class="yt-loadmore__message" data-yt-loadmore-message hidden></div>

<?= $el->end() ?>
