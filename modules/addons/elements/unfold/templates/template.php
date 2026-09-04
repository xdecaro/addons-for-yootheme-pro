<?php

use Joomla\CMS\Factory;

$translations = [
    'en' => ['expand' => 'Show more', 'collapse' => 'Show less'],
    'it' => ['expand' => 'Espandi contenuto', 'collapse' => 'Riduci contenuto'],
    'fr' => ['expand' => 'Afficher plus', 'collapse' => 'Réduire'],
    'de' => ['expand' => 'Mehr anzeigen', 'collapse' => 'Weniger anzeigen'],
    'nl' => ['expand' => 'Meer tonen', 'collapse' => 'Minder tonen'],
    'es' => ['expand' => 'Mostrar más', 'collapse' => 'Mostrar menos'],
    'pt' => ['expand' => 'Mostrar mais', 'collapse' => 'Mostrar menos'],
];

$languageCode = 'en';
try {
    $tag = Factory::getApplication()->getLanguage()->getTag();
    $languageCode = strtolower(substr((string) $tag, 0, 2));
} catch (\Throwable $e) {
}

$defaultText = $translations[$languageCode] ?? $translations['en'];
$customExpandText = trim((string) ($props['expand_text'] ?? ''));
$customCollapseText = trim((string) ($props['collapse_text'] ?? ''));
$expandText = $customExpandText !== '' ? $customExpandText : $defaultText['expand'];
$collapseText = $customCollapseText !== '' ? $customCollapseText : $defaultText['collapse'];

$normalizeLength = static function ($value, string $fallback): string {
    $value = trim((string) $value);
    if ($value === '') {
        return $fallback;
    }
    if (preg_match('/^\d+(?:\.\d+)?$/', $value)) {
        return $value . 'px';
    }
    if (preg_match('/^\d+(?:\.\d+)?(?:px|vh|vw|rem|em)$/i', $value)) {
        return strtolower($value);
    }
    return $fallback;
};

$previewDesktop = $normalizeLength($props['preview_height'] ?? '', '420px');
$previewTabletRaw = trim((string) ($props['preview_height_tablet'] ?? ''));
$previewMobileRaw = trim((string) ($props['preview_height_mobile'] ?? ''));
$previewTablet = $previewTabletRaw !== '' ? $normalizeLength($previewTabletRaw, $previewDesktop) : $previewDesktop;
$previewMobile = $previewMobileRaw !== '' ? $normalizeLength($previewMobileRaw, $previewTablet) : $previewTablet;
$fadeHeight = $normalizeLength($props['fade_height'] ?? '', '90px');
$duration = max(0, min(1500, (int) ($props['duration'] ?? 450)));

$instanceSeed = isset($node->id) ? (string) $node->id : json_encode($props);
$instanceId = !empty($attrs['id']) ? (string) $attrs['id'] : 'xd-unfold-' . substr(md5($instanceSeed), 0, 10);
$attrs['id'] = $instanceId;
$contentId = $instanceId . '-content';

$buttonClass = ['uk-button', 'xd-unfold__button'];
$buttonClass[] = 'uk-button-' . (!empty($props['button_style']) ? $props['button_style'] : 'default');
if (!empty($props['button_size'])) {
    $buttonClass[] = 'uk-button-' . $props['button_size'];
}
if (!empty($props['button_width'])) {
    $buttonClass[] = 'uk-width-' . $props['button_width'];
}

$align = in_array(($props['button_align'] ?? ''), ['left', 'center', 'right'], true)
    ? $props['button_align']
    : 'center';
$controlsClass = ['xd-unfold__controls', 'uk-text-' . $align];

$margin = (string) ($props['button_margin'] ?? 'default');
if ($margin !== 'none') {
    $controlsClass[] = match ($margin) {
        'small' => 'uk-margin-small-top',
        'medium' => 'uk-margin-medium-top',
        'large' => 'uk-margin-large-top',
        default => 'uk-margin-top',
    };
}

$allowedTags = ['div', 'article', 'aside', 'nav', 'section'];
$htmlElement = (string) ($props['html_element'] ?? '');
$htmlElement = in_array($htmlElement, $allowedTags, true) ? $htmlElement : 'div';

$el = $this->el($htmlElement, [
    'class' => ['el-element', 'xd-unfold'],
    'data-xd-unfold' => true,
    'data-preview-desktop' => $previewDesktop,
    'data-preview-tablet' => $previewTablet,
    'data-preview-mobile' => $previewMobile,
    'data-initial-state' => (($props['initial_state'] ?? 'collapsed') === 'expanded') ? 'expanded' : 'collapsed',
    'data-show-collapse' => !empty($props['show_collapse']) ? '1' : '0',
    'data-auto-hide' => !empty($props['auto_hide']) ? '1' : '0',
    'data-fade' => !empty($props['fade']) ? '1' : '0',
    'data-fade-height' => $fadeHeight,
    'data-duration' => $duration,
    'data-scroll-back' => !empty($props['scroll_back']) ? '1' : '0',
    'data-expand-text' => $expandText,
    'data-collapse-text' => $collapseText,
]);

?>

<?= $el($props, $attrs) ?>

    <div class="xd-unfold__viewport" id="<?= htmlspecialchars($contentId, ENT_QUOTES, 'UTF-8') ?>">
        <div class="xd-unfold__content">
            <?php foreach ($children as $child): ?>
                <?= $builder->render($child, ['element' => $props]) ?>
            <?php endforeach ?>
        </div>
    </div>

    <div class="<?= htmlspecialchars(implode(' ', $controlsClass), ENT_QUOTES, 'UTF-8') ?>" data-xd-unfold-controls>
        <button
            type="button"
            class="<?= htmlspecialchars(implode(' ', $buttonClass), ENT_QUOTES, 'UTF-8') ?>"
            data-xd-unfold-button
            aria-expanded="false"
            aria-controls="<?= htmlspecialchars($contentId, ENT_QUOTES, 'UTF-8') ?>"
        >
            <span data-xd-unfold-label><?= htmlspecialchars($expandText, ENT_QUOTES, 'UTF-8') ?></span>
            <span class="xd-unfold__chevron" aria-hidden="true"></span>
        </button>
    </div>

<?= $el->end() ?>
