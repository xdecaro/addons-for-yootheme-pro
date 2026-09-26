<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$selectedSeasonId = (int) ($props['selected_season_id'] ?? 0);
$selected = $selectedSeasonId > 0
    ? (XdecaroCompetitionsProvider::competitionBySeasonId($selectedSeasonId) ?? [])
    : [];

$value = static function (string $key, mixed $default = '') use ($props, $selected): mixed {
    $manual = $props[$key] ?? null;
    if ($manual !== null && $manual !== '') {
        return $manual;
    }

    return $selected[$key] ?? $default;
};

$title = trim((string) $value('title'));
$meta = trim((string) ($props['meta'] ?? 'Competition'));
$link = trim((string) ($props['link_override'] ?? ''));
$buttonText = trim((string) ($props['button_text'] ?? 'View competition')) ?: 'View competition';
$style = (string) ($props['card_style'] ?? 'default');
$style = in_array($style, ['default', 'primary', 'secondary'], true) ? $style : 'default';

$details = [];
$discipline = trim((string) $value('discipline'));
$gender = trim((string) $value('gender'));
if ($discipline !== '') {
    $details[] = $discipline;
}
if ($gender !== '') {
    $details[] = $gender;
}
$seasonYear = trim((string) $value('season_year'));
if ($seasonYear !== '') {
    $details[] = $seasonYear;
}

$place = array_filter([
    trim((string) $value('host_city')),
    trim((string) $value('host_country_code')),
], static fn (string $item): bool => $item !== '');

$dates = array_filter([
    trim((string) $value('start_date')),
    trim((string) $value('end_date')),
], static fn (string $item): bool => $item !== '');

$teamCount = trim((string) $value('team_count'));
$classes = ['el-item', 'uk-card', 'uk-card-' . $style, 'uk-card-body'];
$el = $this->el('div', ['class' => $classes]);
?>
<?= $el($props, $attrs) ?>
    <?php if ($meta !== '') : ?>
        <div class="uk-text-meta uk-text-uppercase"><?= $escape($meta) ?></div>
    <?php endif ?>

    <?php if ($title !== '') : ?>
        <h3 class="uk-card-title uk-margin-small-top"><?= $escape($title) ?></h3>
    <?php endif ?>

    <?php if ($details) : ?>
        <p class="uk-margin-small"><?= $escape(implode(' · ', $details)) ?></p>
    <?php endif ?>

    <?php if ($place || $dates || $teamCount !== '') : ?>
        <ul class="uk-list uk-list-collapse uk-text-small uk-margin-small-top">
            <?php if ($place) : ?><li><?= $escape(implode(', ', $place)) ?></li><?php endif ?>
            <?php if ($dates) : ?><li><?= $escape(implode(' – ', $dates)) ?></li><?php endif ?>
            <?php if ($teamCount !== '') : ?><li><?= $escape($teamCount) ?> teams</li><?php endif ?>
        </ul>
    <?php endif ?>

    <?php if ($link !== '') : ?>
        <div class="uk-margin-medium-top">
            <a class="uk-button uk-button-default" href="<?= $escape($link) ?>"><?= $escape($buttonText) ?></a>
        </div>
    <?php endif ?>
<?= $el->end() ?>
