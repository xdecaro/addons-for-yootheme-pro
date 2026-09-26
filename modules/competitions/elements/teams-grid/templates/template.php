<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$seasonId = (int) (($props['selected_season_id'] ?? 0) ?: ($props['season_id'] ?? 0));
$teams = $seasonId > 0 ? XdecaroCompetitionsProvider::participatingTeams(null, ['season_id' => $seasonId, 'approved_only' => true]) : [];
$columns = in_array((string) ($props['columns'] ?? '3'), ['2', '3', '4'], true) ? (string) $props['columns'] : '3';
$emptyText = trim((string) ($props['empty_text'] ?? 'No participating teams available.'));
$el = $this->el('div', ['class' => ['el-item']]);
?>
<?= $el($props, $attrs) ?>
    <?php if (!$teams) : ?><p class="uk-text-muted uk-margin-remove"><?= $escape($emptyText) ?></p><?php else : ?>
        <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-<?= $escape($columns) ?>@m" uk-grid>
            <?php foreach ($teams as $team) : $name = trim((string) ($team['name'] ?? '')); $logo = trim((string) ($team['logo'] ?? '')); ?>
                <div><article class="uk-card uk-card-default uk-card-body uk-height-1-1">
                    <div class="uk-flex uk-flex-middle" uk-grid>
                        <?php if ($logo !== '') : ?><div class="uk-width-auto"><img src="<?= $escape($logo) ?>" alt="<?= $escape($name !== '' ? $name . ' logo' : 'Team logo') ?>" width="64" height="64" loading="lazy" class="uk-object-contain"></div><?php endif ?>
                        <div class="uk-width-expand"><h3 class="uk-h4 uk-margin-remove"><?= $escape($name) ?></h3>
                            <?php if (!empty($props['show_short_name']) && !empty($team['short_name']) && strcasecmp((string) $team['short_name'], $name) !== 0) : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($team['short_name']) ?></div><?php endif ?>
                            <?php if (!empty($props['show_country']) && !empty($team['country_code'])) : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($team['country_code']) ?></div><?php endif ?>
                            <?php $fed = trim((string) (($team['federation_short_name'] ?? '') ?: ($team['federation_name'] ?? ''))); if (!empty($props['show_federation']) && $fed !== '') : ?><div class="uk-text-small uk-text-muted uk-margin-small-top"><?= $escape($fed) ?></div><?php endif ?>
                        </div>
                    </div>
                </article></div>
            <?php endforeach ?>
        </div>
    <?php endif ?>
<?= $el->end() ?>
