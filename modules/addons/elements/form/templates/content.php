<?php

defined('_JEXEC') or die;

$manualId = isset($props['manual_id']) ? (int) $props['manual_id'] : 0;
$selectedId = isset($props['form_id']) ? (int) $props['form_id'] : 0;
$formId = $manualId > 0 ? $manualId : $selectedId;
?>
<?= $formId > 0 ? '{form id="' . $formId . '"}' : '' ?>
