<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$rows = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::rosterBySelection((string) $props['selected_team']) : [];
$mode = ($props['mode'] ?? 'grid') === 'list' ? 'list' : 'grid';
$columns = in_array((string) ($props['columns'] ?? '3'), ['2', '3', '4'], true) ? (string) $props['columns'] : '3';
$emptyText = trim((string) ($props['empty_text'] ?? 'No approved roster players available.'));
$el = $this->el('div', ['class' => ['el-item']]);
?>
<?= $el($props, $attrs) ?>
<?php if (!$rows) : ?><p class="uk-text-muted uk-margin-remove"><?= $escape($emptyText) ?></p>
<?php elseif ($mode === 'list') : ?>
    <ul class="uk-list uk-list-divider uk-margin-remove">
        <?php foreach ($rows as $row) : $name = trim((string) ($row['display_name'] ?? '')); $photo = trim((string) ($row['photo'] ?? '')); ?>
            <li><div class="uk-flex uk-flex-middle uk-flex-wrap uk-flex-between" uk-grid>
                <div class="uk-width-expand"><div class="uk-flex uk-flex-middle">
                    <?php if ($photo !== '') : ?><img src="<?= $escape($photo) ?>" alt="<?= $escape($name !== '' ? $name : 'Player') ?>" width="48" height="48" loading="lazy" class="uk-border-circle uk-object-cover uk-margin-small-right"><?php endif ?>
                    <div><span class="uk-text-bold"><?php if (($row['shirt_number'] ?? null) !== null) : ?>#<?= $escape($row['shirt_number']) ?> · <?php endif ?><?= $escape($name) ?></span>
                    <?php if (!empty($props['show_role']) && !empty($row['role'])) : ?><div class="uk-text-meta"><?= $escape($row['role']) ?></div><?php endif ?></div>
                </div></div>
                <?php if (!empty($props['show_nationality']) && !empty($row['nationality_code'])) : ?><div class="uk-width-auto uk-text-small"><?= $escape($row['nationality_code']) ?></div><?php endif ?>
            </div></li>
        <?php endforeach ?>
    </ul>
<?php else : ?>
    <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-<?= $escape($columns) ?>@m" uk-grid>
        <?php foreach ($rows as $row) : $name = trim((string) ($row['display_name'] ?? '')); $photo = trim((string) ($row['photo'] ?? '')); ?>
            <div><article class="uk-card uk-card-default uk-card-body uk-height-1-1 uk-text-center">
                <?php if ($photo !== '') : ?><img src="<?= $escape($photo) ?>" alt="<?= $escape($name !== '' ? $name : 'Player') ?>" width="112" height="112" loading="lazy" class="uk-border-circle uk-object-cover"><?php else : ?><div class="uk-border-circle uk-background-muted uk-flex uk-flex-center uk-flex-middle uk-margin-auto" style="width:112px;height:112px" aria-label="Player photo not available"><span class="uk-text-muted">—</span></div><?php endif ?>
                <h3 class="uk-h4 uk-margin-small-top uk-margin-remove-bottom"><?php if (($row['shirt_number'] ?? null) !== null) : ?><span class="uk-text-muted">#<?= $escape($row['shirt_number']) ?></span> <?php endif ?><?= $escape($name) ?></h3>
                <?php if (!empty($props['show_role']) && !empty($row['role'])) : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($row['role']) ?></div><?php endif ?>
                <?php if (!empty($props['show_nationality']) && !empty($row['nationality_code'])) : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($row['nationality_code']) ?></div><?php endif ?>
            </article></div>
        <?php endforeach ?>
    </div>
<?php endif ?>
<?= $el->end() ?>
