<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$selectedMatchId = (int) ($props['selected_match_id'] ?? 0);
$selected = $selectedMatchId > 0
    ? XdecaroCompetitionsProvider::match(null, ['match_id' => $selectedMatchId])
    : null;
$selected = is_array($selected) ? $selected : [];

$value = static function (string $key, mixed $default = '') use ($props, $selected): mixed {
    $manual = $props[$key] ?? null;
    if ($manual !== null && $manual !== '') {
        return $manual;
    }

    return $selected[$key] ?? $default;
};

$homeName = trim((string) $value('home_team_name'));
$awayName = trim((string) $value('away_team_name'));
$homeShort = trim((string) $value('home_team_short_name'));
$awayShort = trim((string) $value('away_team_short_name'));
$homeDisplay = $homeShort !== '' ? $homeShort : $homeName;
$awayDisplay = $awayShort !== '' ? $awayShort : $awayName;
$homeScore = $value('home_score', null);
$awayScore = $value('away_score', null);
$hasScore = $homeScore !== null && $homeScore !== '' && $awayScore !== null && $awayScore !== '';
$status = trim((string) $value('match_status', $selected['status'] ?? ''));
$showLogos = !array_key_exists('show_logos', $props) || !empty($props['show_logos']);
$style = (string) ($props['card_style'] ?? 'default');
$style = in_array($style, ['default', 'primary', 'secondary'], true) ? $style : 'default';

$meta = array_filter([
    trim((string) $value('match_date')),
    trim((string) $value('kickoff_time')),
    trim((string) $value('stage')),
    trim((string) $value('round_name')),
], static fn (string $item): bool => $item !== '');

$homeLogo = trim((string) $value('home_team_logo'));
$awayLogo = trim((string) $value('away_team_logo'));
$venueName = trim((string) $value('venue_name'));
$homePenalties = $value('home_penalties', null);
$awayPenalties = $value('away_penalties', null);
$hasPenalties = $homePenalties !== null && $homePenalties !== '' && $awayPenalties !== null && $awayPenalties !== '';

$el = $this->el('div', ['class' => ['el-item', 'uk-card', 'uk-card-' . $style, 'uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <?php if ($meta) : ?>
        <div class="uk-text-meta uk-text-center uk-margin-small-bottom"><?= $escape(implode(' · ', $meta)) ?></div>
    <?php endif ?>

    <div class="uk-grid-small uk-child-width-expand uk-flex-middle uk-text-center" uk-grid>
        <div>
            <?php if ($showLogos && $homeLogo !== '') : ?>
                <img src="<?= $escape($homeLogo) ?>" alt="" width="64" height="64" loading="lazy" class="uk-object-contain uk-margin-small-bottom">
            <?php endif ?>
            <div class="uk-text-bold"><?= $escape($homeDisplay) ?></div>
        </div>

        <div class="uk-width-auto">
            <?php if ($hasScore) : ?>
                <div class="uk-text-large uk-text-bold"><?= $escape($homeScore) ?> – <?= $escape($awayScore) ?></div>
                <?php if ($hasPenalties) : ?>
                    <div class="uk-text-meta">pens <?= $escape($homePenalties) ?>–<?= $escape($awayPenalties) ?></div>
                <?php endif ?>
            <?php else : ?>
                <div class="uk-text-meta">VS</div>
            <?php endif ?>

            <?php if ($status !== '') : ?>
                <div class="uk-label uk-margin-small-top"><?= $escape($status) ?></div>
            <?php endif ?>
        </div>

        <div>
            <?php if ($showLogos && $awayLogo !== '') : ?>
                <img src="<?= $escape($awayLogo) ?>" alt="" width="64" height="64" loading="lazy" class="uk-object-contain uk-margin-small-bottom">
            <?php endif ?>
            <div class="uk-text-bold"><?= $escape($awayDisplay) ?></div>
        </div>
    </div>

    <?php if ($venueName !== '') : ?>
        <div class="uk-text-meta uk-text-center uk-margin-small-top"><?= $escape($venueName) ?></div>
    <?php endif ?>
<?= $el->end() ?>
