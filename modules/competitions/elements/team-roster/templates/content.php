<?php

defined('_JEXEC') || die;
$rows = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::rosterBySelection((string) $props['selected_team']) : [];
echo count($rows) . ' players';
