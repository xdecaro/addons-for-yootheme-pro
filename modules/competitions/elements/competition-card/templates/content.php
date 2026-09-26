<?php

defined('_JEXEC') || die;

$title = trim((string) ($props['title'] ?? ''));
$details = array_filter([
    trim((string) ($props['discipline'] ?? '')),
    trim((string) ($props['gender'] ?? '')),
    trim((string) ($props['season_year'] ?? '')),
    trim((string) ($props['host_city'] ?? '')),
], static fn (string $value): bool => $value !== '');

$text = trim($title . ' ' . implode(' ', $details));
echo htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
