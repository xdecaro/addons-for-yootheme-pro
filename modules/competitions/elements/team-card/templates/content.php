<?php

defined('_JEXEC') || die;
$row = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::teamBySelection((string) $props['selected_team']) : null;
$name = trim((string) (($props['name'] ?? '') ?: ($row['name'] ?? '')));
echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
