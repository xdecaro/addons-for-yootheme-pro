<?php

defined('_JEXEC') || die;

$name = trim((string) ($props['name'] ?? ''));
if ($name === '' && !empty($props['selected_federation_id'])) {
    $row = XdecaroCompetitionsProvider::federationById((int) $props['selected_federation_id']);
    $name = trim((string) ($row['name'] ?? ''));
}

echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
