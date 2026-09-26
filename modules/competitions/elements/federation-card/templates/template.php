<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$safeUrl = static function (mixed $value): string {
    $url = trim((string) ($value ?? ''));
    if ($url === '') {
        return '';
    }
    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    return in_array($scheme, ['http', 'https'], true) ? htmlspecialchars($url, ENT_QUOTES, 'UTF-8') : '';
};
$selectedId = (int) ($props['selected_federation_id'] ?? 0);
$selected = $selectedId > 0 ? XdecaroCompetitionsProvider::federationById($selectedId) : null;
$value = static function (string $key) use ($props, $selected): mixed {
    $override = $props[$key] ?? null;
    return ($override !== null && trim((string) $override) !== '') ? $override : ($selected[$key] ?? null);
};
$name = trim((string) $value('name'));
$short = trim((string) $value('short_name'));
$country = trim((string) $value('country_name'));
$countryCode = trim((string) $value('country_code'));
$logo = trim((string) $value('logo'));
$websiteRaw = $value('website');
$linkRaw = trim((string) ($props['link_override'] ?? '')) !== '' ? $props['link_override'] : $websiteRaw;
$link = $safeUrl($linkRaw);
$website = $safeUrl($websiteRaw);
$style = in_array(($props['card_style'] ?? 'default'), ['default', 'primary', 'secondary'], true) ? $props['card_style'] : 'default';
$el = $this->el('div', ['class' => ['el-item', 'uk-card uk-card-{card_style} uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <div class="uk-flex uk-flex-middle uk-flex-wrap" uk-grid>
        <?php if ($logo !== '') : ?>
            <div class="uk-width-auto"><img src="<?= $escape($logo) ?>" alt="<?= $escape($name !== '' ? $name . ' logo' : 'Federation logo') ?>" width="72" height="72" loading="lazy" class="uk-object-contain"></div>
        <?php endif ?>
        <div class="uk-width-expand">
            <?php if ($name !== '') : ?><h3 class="uk-card-title uk-margin-remove"><?php if ($link !== '') : ?><a class="uk-link-reset" href="<?= $link ?>"><?= $escape($name) ?></a><?php else : ?><?= $escape($name) ?><?php endif ?></h3><?php endif ?>
            <?php if ($short !== '') : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($short) ?></div><?php endif ?>
            <?php $countryLabel = $country !== '' ? $country : $countryCode; if ($countryLabel !== '') : ?><div class="uk-margin-small-top"><?= $escape($countryLabel) ?></div><?php endif ?>
            <?php if (!empty($props['show_website']) && $website !== '') : ?><div class="uk-margin-small-top"><a href="<?= $website ?>" rel="noopener noreferrer">Website</a></div><?php endif ?>
        </div>
    </div>
<?= $el->end() ?>
