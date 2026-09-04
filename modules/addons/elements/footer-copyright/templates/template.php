<?php

use Joomla\CMS\Factory;
use Joomla\CMS\Uri\Uri;

$translations = [
    'en' => 'All rights reserved.',
    'it' => 'Tutti i diritti riservati.',
    'fr' => 'Tous droits réservés.',
    'de' => 'Alle Rechte vorbehalten.',
    'nl' => 'Alle rechten voorbehouden.',
    'es' => 'Todos los derechos reservados.',
    'pt' => 'Todos os direitos reservados.',
];

$app = null;
$languageCode = 'en';
$currentYear = (int) date('Y');
$automaticSiteName = '';

try {
    $app = Factory::getApplication();
    $tag = $app->getLanguage()->getTag();
    $languageCode = strtolower(substr((string) $tag, 0, 2));
    $automaticSiteName = trim((string) $app->get('sitename', ''));
    $timezone = (string) $app->get('offset', 'UTC');
    $currentYear = (int) Factory::getDate('now', $timezone)->format('Y');
} catch (\Throwable $e) {
}

$siteSource = ($props['site_source'] ?? 'auto') === 'custom' ? 'custom' : 'auto';
$customSiteName = trim((string) ($props['site_name'] ?? ''));
$siteName = $siteSource === 'custom' ? $customSiteName : $automaticSiteName;
if ($siteName === '') {
    $siteName = $customSiteName !== '' ? $customSiteName : 'Website';
}

$startYearRaw = trim((string) ($props['start_year'] ?? ''));
$startYear = ctype_digit($startYearRaw) ? (int) $startYearRaw : 0;
if ($startYear >= 1900 && $startYear < $currentYear) {
    $yearText = $startYear . '–' . $currentYear;
} else {
    $yearText = (string) $currentYear;
}

$copyrightStyle = (string) ($props['copyright_style'] ?? 'symbol');
$copyrightPrefix = match ($copyrightStyle) {
    'copyright-symbol' => 'Copyright ©',
    'copyright' => 'Copyright',
    'none' => '',
    default => '©',
};

$rightsMode = (string) ($props['rights_mode'] ?? 'auto');
$rightsText = '';
if ($rightsMode === 'custom') {
    $rightsText = trim((string) ($props['rights_text'] ?? ''));
} elseif ($rightsMode !== 'none') {
    $rightsText = $translations[$languageCode] ?? $translations['en'];
}

$linkSite = !empty($props['link_site']);
$siteUrl = trim((string) ($props['site_url'] ?? ''));
if ($siteUrl === '') {
    try {
        $siteUrl = Uri::root();
    } catch (\Throwable $e) {
        $siteUrl = '/';
    }
}

$linkTarget = ($props['link_target'] ?? '') === '_blank' ? '_blank' : '';
$linkAttrs = '';
if ($linkTarget === '_blank') {
    $linkAttrs = ' target="_blank" rel="noopener noreferrer"';
}

$classes = ['el-element', 'xd-footer-copyright'];
$textSize = (string) ($props['text_size'] ?? 'small');
if (in_array($textSize, ['small', 'meta', 'large'], true)) {
    $classes[] = 'uk-text-' . $textSize;
}
$textColor = (string) ($props['text_color'] ?? 'muted');
if (in_array($textColor, ['muted', 'primary', 'secondary'], true)) {
    $classes[] = 'uk-text-' . $textColor;
}

$allowedTags = ['div', 'p', 'small'];
$htmlElement = (string) ($props['html_element'] ?? 'div');
$htmlElement = in_array($htmlElement, $allowedTags, true) ? $htmlElement : 'div';

$el = $this->el($htmlElement, [
    'class' => $classes,
]);

$segments = [];
if ($copyrightPrefix !== '') {
    $segments[] = htmlspecialchars($copyrightPrefix, ENT_QUOTES, 'UTF-8');
}
$segments[] = htmlspecialchars($yearText, ENT_QUOTES, 'UTF-8');

$siteHtml = htmlspecialchars($siteName, ENT_QUOTES, 'UTF-8');
if ($linkSite) {
    $siteHtml = '<a class="xd-footer-copyright__site" href="' . htmlspecialchars($siteUrl, ENT_QUOTES, 'UTF-8') . '"' . $linkAttrs . '>' . $siteHtml . '</a>';
}
$segments[] = $siteHtml;

$mainText = implode(' ', $segments);
if ($rightsText !== '') {
    $mainText .= '. ' . htmlspecialchars($rightsText, ENT_QUOTES, 'UTF-8');
}

?>

<?= $el($props, $attrs) ?>
    <?= $mainText ?>
<?= $el->end() ?>
