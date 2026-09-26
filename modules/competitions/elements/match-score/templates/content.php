<?php

defined('_JEXEC') || die;

$home = trim((string) ($props['home_team_name'] ?? ''));
$away = trim((string) ($props['away_team_name'] ?? ''));
$homeScore = $props['home_score'] ?? null;
$awayScore = $props['away_score'] ?? null;
$score = ($homeScore !== null && $homeScore !== '' && $awayScore !== null && $awayScore !== '')
    ? ((string) $homeScore . ' - ' . (string) $awayScore)
    : 'vs';

echo htmlspecialchars(trim($home . ' ' . $score . ' ' . $away), ENT_QUOTES, 'UTF-8');
