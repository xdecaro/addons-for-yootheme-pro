<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$selected = !empty($props['selected_roster_player']) ? XdecaroCompetitionsProvider::rosterPlayerBySelection((string) $props['selected_roster_player']) : null;
$value = static function (string $key) use ($props, $selected): mixed { $override = $props[$key] ?? null; return ($override !== null && trim((string) $override) !== '') ? $override : ($selected[$key] ?? null); };
$display = trim((string) $value('display_name')); if ($display === '') { $display = trim((string) $value('first_name') . ' ' . (string) $value('last_name')); }
$photo = trim((string) $value('photo')); $number = trim((string) $value('shirt_number')); $role = trim((string) $value('role')); $nation = trim((string) $value('nationality_code')); $team = trim((string) $value('team_name'));
$initials = ''; foreach (preg_split('/\s+/', $display) ?: [] as $part) { if ($part !== '') $initials .= mb_strtoupper(mb_substr($part, 0, 1)); if (mb_strlen($initials) >= 2) break; }
$el = $this->el('article', ['class' => ['el-item', 'uk-card uk-card-{card_style} uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <div class="uk-flex uk-flex-middle uk-flex-wrap" uk-grid>
        <div class="uk-width-auto"><?php if ($photo !== '') : ?><img src="<?= $escape($photo) ?>" alt="<?= $escape($display !== '' ? $display : 'Player') ?>" width="96" height="96" loading="lazy" class="uk-border-circle uk-object-cover"><?php else : ?><div class="uk-border-circle uk-background-muted uk-flex uk-flex-center uk-flex-middle" style="width:96px;height:96px" aria-label="Player photo not available"><span class="uk-text-large uk-text-muted"><?= $escape($initials !== '' ? $initials : '—') ?></span></div><?php endif ?></div>
        <div class="uk-width-expand"><?php if ($display !== '') : ?><h3 class="uk-card-title uk-margin-remove"><?= $escape($display) ?></h3><?php endif ?>
            <?php if ($number !== '') : ?><div class="uk-text-bold uk-margin-small-top">#<?= $escape($number) ?></div><?php endif ?>
            <?php $details = implode(' · ', array_values(array_filter([$role, $nation], static fn ($v) => $v !== ''))); if ($details !== '') : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($details) ?></div><?php endif ?>
            <?php if ($team !== '') : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($team) ?></div><?php endif ?>
        </div>
    </div>
<?= $el->end() ?>
