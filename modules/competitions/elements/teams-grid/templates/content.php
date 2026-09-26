<?php

defined('_JEXEC') || die;
$seasonId = (int) (($props['selected_season_id'] ?? 0) ?: ($props['season_id'] ?? 0));
$rows = $seasonId > 0 ? XdecaroCompetitionsProvider::participatingTeams(null, ['season_id' => $seasonId, 'approved_only' => true]) : [];
echo count($rows) . ' teams';
