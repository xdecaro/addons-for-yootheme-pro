<?php

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
    'data-button-text' => $props['button_text'],
    'data-loading-text' => $props['loading_text'],
    'data-end-text' => $props['end_text'],
    'data-error-text' => $props['error_text'],
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
        <button type="button" class="<?= implode(' ', array_map('htmlspecialchars', $buttonClass)) ?>" data-yt-loadmore-button>
            <span data-yt-loadmore-label><?= htmlspecialchars($props['button_text'] ?: 'Carica altri', ENT_QUOTES, 'UTF-8') ?></span>
            <span class="yt-loadmore__spinner" data-yt-loadmore-spinner aria-hidden="true"></span>
        </button>
    <?php else: ?>
        <div class="yt-loadmore__sentinel" data-yt-loadmore-sentinel aria-hidden="true"></div>
        <div class="yt-loadmore__loading" data-yt-loadmore-loading hidden>
            <span class="yt-loadmore__spinner yt-loadmore__spinner--visible" aria-hidden="true"></span>
            <span><?= htmlspecialchars($props['loading_text'] ?: 'Caricamento…', ENT_QUOTES, 'UTF-8') ?></span>
        </div>
    <?php endif; ?>

    <div class="yt-loadmore__message" data-yt-loadmore-message hidden></div>

<?= $el->end() ?>
