<?php

defined('_JEXEC') || die;

$seasonId = (int) ($props['season_id'] ?? 0);
$rows = $seasonId > 0
    ? XdecaroCompetitionsProvider::standings(null, ['season_id' => $seasonId])
    : [];

$parts = [];
foreach ($rows as $row) {
    $parts[] = trim((string) ($row['team_name'] ?? '')) . ' ' . trim((string) ($row['points'] ?? ''));
}

echo htmlspecialchars(trim(implode(' ', $parts)), ENT_QUOTES, 'UTF-8');
