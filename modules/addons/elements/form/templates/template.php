<?php

defined('_JEXEC') or die;

$manualId = isset($props['manual_id']) ? (int) $props['manual_id'] : 0;
$selectedId = isset($props['form_id']) ? (int) $props['form_id'] : 0;
$formId = $manualId > 0 ? $manualId : $selectedId;
?>
<?php if ($formId > 0) : ?>
{form id="<?= $formId ?>"}
<?php else : ?>
<div class="uk-alert uk-alert-warning" uk-alert>Seleziona un modulo Forms nelle impostazioni dell’elemento.</div>
<?php endif ?>
