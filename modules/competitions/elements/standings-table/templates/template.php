<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$selectedSeasonId = (int) ($props['selected_season_id'] ?? 0);
$mappedSeasonId = (int) ($props['season_id'] ?? 0);
$seasonId = $selectedSeasonId > 0 ? $selectedSeasonId : $mappedSeasonId;
$rows = $seasonId > 0
    ? XdecaroCompetitionsProvider::standings(null, ['season_id' => $seasonId])
    : [];
$showGoals = !array_key_exists('show_goal_columns', $props) || !empty($props['show_goal_columns']);
$emptyText = trim((string) ($props['empty_text'] ?? 'Standings are not available yet.'));
$el = $this->el('div', ['class' => ['el-item', 'uk-overflow-auto']]);
?>
<?= $el($props, $attrs) ?>
    <?php if (!$rows) : ?>
        <p class="uk-text-muted uk-margin-remove"><?= $escape($emptyText) ?></p>
    <?php else : ?>
        <table class="uk-table uk-table-small uk-table-divider uk-table-hover uk-table-middle">
            <thead>
                <tr>
                    <th class="uk-table-shrink">#</th>
                    <th>Team</th>
                    <th class="uk-text-center">P</th>
                    <th class="uk-text-center">W</th>
                    <th class="uk-text-center">D</th>
                    <th class="uk-text-center">L</th>
                    <?php if ($showGoals) : ?>
                        <th class="uk-text-center">GF</th>
                        <th class="uk-text-center">GA</th>
                        <th class="uk-text-center">GD</th>
                    <?php endif ?>
                    <th class="uk-text-center">PTS</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($rows as $row) : ?>
                    <tr>
                        <td><?= $escape($row['position'] ?? '') ?></td>
                        <td>
                            <?php if (!empty($row['team_logo'])) : ?>
                                <img src="<?= $escape($row['team_logo']) ?>" alt="" width="28" height="28" loading="lazy" class="uk-object-contain uk-margin-small-right">
                            <?php endif ?>
                            <span class="uk-text-bold"><?= $escape($row['team_name'] ?? '') ?></span>
                        </td>
                        <td class="uk-text-center"><?= $escape($row['played'] ?? '') ?></td>
                        <td class="uk-text-center"><?= $escape($row['won'] ?? '') ?></td>
                        <td class="uk-text-center"><?= $escape($row['drawn'] ?? '') ?></td>
                        <td class="uk-text-center"><?= $escape($row['lost'] ?? '') ?></td>
                        <?php if ($showGoals) : ?>
                            <td class="uk-text-center"><?= $escape($row['goals_for'] ?? '') ?></td>
                            <td class="uk-text-center"><?= $escape($row['goals_against'] ?? '') ?></td>
                            <td class="uk-text-center"><?= $escape($row['goal_difference'] ?? '') ?></td>
                        <?php endif ?>
                        <td class="uk-text-center uk-text-bold"><?= $escape($row['points'] ?? '') ?></td>
                    </tr>
                <?php endforeach ?>
            </tbody>
        </table>
    <?php endif ?>
<?= $el->end() ?>
