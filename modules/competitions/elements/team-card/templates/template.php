<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$safeUrl = static function (mixed $value): string { $url = trim((string) ($value ?? '')); if ($url === '') return ''; $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME)); return in_array($scheme, ['http', 'https'], true) ? htmlspecialchars($url, ENT_QUOTES, 'UTF-8') : ''; };
$selected = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::teamBySelection((string) $props['selected_team']) : null;
$value = static function (string $key) use ($props, $selected): mixed { $override = $props[$key] ?? null; return ($override !== null && trim((string) $override) !== '') ? $override : ($selected[$key] ?? null); };
$name = trim((string) $value('name')); $short = trim((string) $value('short_name')); $logo = trim((string) $value('logo')); $country = trim((string) $value('country_code')); $city = trim((string) $value('city')); $federation = trim((string) ($value('federation_short_name') ?: $value('federation_name'))); $link = $safeUrl($props['link_override'] ?? '');
$el = $this->el('div', ['class' => ['el-item', 'uk-card uk-card-{card_style} uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <div class="uk-flex uk-flex-middle uk-flex-wrap" uk-grid>
        <?php if ($logo !== '') : ?><div class="uk-width-auto"><img src="<?= $escape($logo) ?>" alt="<?= $escape($name !== '' ? $name . ' logo' : 'Team logo') ?>" width="80" height="80" loading="lazy" class="uk-object-contain"></div><?php endif ?>
        <div class="uk-width-expand">
            <?php if ($name !== '') : ?><h3 class="uk-card-title uk-margin-remove"><?php if ($link !== '') : ?><a class="uk-link-reset" href="<?= $link ?>"><?= $escape($name) ?></a><?php else : ?><?= $escape($name) ?><?php endif ?></h3><?php endif ?>
            <?php if ($short !== '' && strcasecmp($short, $name) !== 0) : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($short) ?></div><?php endif ?>
            <?php $location = implode(' · ', array_values(array_filter([$city, $country], static fn ($v) => $v !== ''))); if ($location !== '') : ?><div class="uk-margin-small-top"><?= $escape($location) ?></div><?php endif ?>
            <?php if (!empty($props['show_federation']) && $federation !== '') : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($federation) ?></div><?php endif ?>
        </div>
    </div>
<?= $el->end() ?>
