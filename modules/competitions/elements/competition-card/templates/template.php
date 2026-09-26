<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$title = trim((string) ($props['title'] ?? ''));
$meta = trim((string) ($props['meta'] ?? ''));
$link = trim((string) ($props['link_override'] ?? ''));
$buttonText = trim((string) ($props['button_text'] ?? 'View competition')) ?: 'View competition';
$style = (string) ($props['card_style'] ?? 'default');
$style = in_array($style, ['default', 'primary', 'secondary'], true) ? $style : 'default';

$details = [];
$discipline = trim((string) ($props['discipline'] ?? ''));
$gender = trim((string) ($props['gender'] ?? ''));
if ($discipline !== '') {
    $details[] = $discipline;
}
if ($gender !== '') {
    $details[] = $gender;
}
$seasonYear = trim((string) ($props['season_year'] ?? ''));
if ($seasonYear !== '') {
    $details[] = $seasonYear;
}

$place = array_filter([
    trim((string) ($props['host_city'] ?? '')),
    trim((string) ($props['host_country_code'] ?? '')),
], static fn (string $value): bool => $value !== '');

$dates = array_filter([
    trim((string) ($props['start_date'] ?? '')),
    trim((string) ($props['end_date'] ?? '')),
], static fn (string $value): bool => $value !== '');

$teamCount = trim((string) ($props['team_count'] ?? ''));
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
