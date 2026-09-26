<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$homeName = trim((string) ($props['home_team_name'] ?? ''));
$awayName = trim((string) ($props['away_team_name'] ?? ''));
$homeShort = trim((string) ($props['home_team_short_name'] ?? ''));
$awayShort = trim((string) ($props['away_team_short_name'] ?? ''));
$homeDisplay = $homeShort !== '' ? $homeShort : $homeName;
$awayDisplay = $awayShort !== '' ? $awayShort : $awayName;
$homeScore = $props['home_score'] ?? null;
$awayScore = $props['away_score'] ?? null;
$hasScore = $homeScore !== null && $homeScore !== '' && $awayScore !== null && $awayScore !== '';
$status = trim((string) ($props['match_status'] ?? ''));
$showLogos = !array_key_exists('show_logos', $props) || !empty($props['show_logos']);
$style = (string) ($props['card_style'] ?? 'default');
$style = in_array($style, ['default', 'primary', 'secondary'], true) ? $style : 'default';

$meta = array_filter([
    trim((string) ($props['match_date'] ?? '')),
    trim((string) ($props['kickoff_time'] ?? '')),
    trim((string) ($props['stage'] ?? '')),
    trim((string) ($props['round_name'] ?? '')),
], static fn (string $value): bool => $value !== '');

$el = $this->el('div', ['class' => ['el-item', 'uk-card', 'uk-card-' . $style, 'uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <?php if ($meta) : ?>
        <div class="uk-text-meta uk-text-center uk-margin-small-bottom"><?= $escape(implode(' · ', $meta)) ?></div>
    <?php endif ?>

    <div class="uk-grid-small uk-child-width-expand uk-flex-middle uk-text-center" uk-grid>
        <div>
            <?php if ($showLogos && !empty($props['home_team_logo'])) : ?>
                <img src="<?= $escape($props['home_team_logo']) ?>" alt="" width="64" height="64" loading="lazy" class="uk-object-contain uk-margin-small-bottom">
            <?php endif ?>
            <div class="uk-text-bold"><?= $escape($homeDisplay) ?></div>
        </div>

        <div class="uk-width-auto">
            <?php if ($hasScore) : ?>
                <div class="uk-text-large uk-text-bold"><?= $escape($homeScore) ?> – <?= $escape($awayScore) ?></div>
                <?php if (($props['home_penalties'] ?? '') !== '' && ($props['away_penalties'] ?? '') !== '') : ?>
                    <div class="uk-text-meta">pens <?= $escape($props['home_penalties']) ?>–<?= $escape($props['away_penalties']) ?></div>
                <?php endif ?>
            <?php else : ?>
                <div class="uk-text-meta">VS</div>
            <?php endif ?>

            <?php if ($status !== '') : ?>
                <div class="uk-label uk-margin-small-top"><?= $escape($status) ?></div>
            <?php endif ?>
        </div>

        <div>
            <?php if ($showLogos && !empty($props['away_team_logo'])) : ?>
                <img src="<?= $escape($props['away_team_logo']) ?>" alt="" width="64" height="64" loading="lazy" class="uk-object-contain uk-margin-small-bottom">
            <?php endif ?>
            <div class="uk-text-bold"><?= $escape($awayDisplay) ?></div>
        </div>
    </div>

    <?php if (!empty($props['venue_name'])) : ?>
        <div class="uk-text-meta uk-text-center uk-margin-small-top"><?= $escape($props['venue_name']) ?></div>
    <?php endif ?>
<?= $el->end() ?>
