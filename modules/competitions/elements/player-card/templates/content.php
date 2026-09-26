<?php

defined('_JEXEC') || die;
$row = !empty($props['selected_roster_player']) ? XdecaroCompetitionsProvider::rosterPlayerBySelection((string) $props['selected_roster_player']) : null;
$name = trim((string) (($props['display_name'] ?? '') ?: ($row['display_name'] ?? '')));
echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
