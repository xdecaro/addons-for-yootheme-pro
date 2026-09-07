<?php defined('_JEXEC') || die; ?>
<?php foreach ($children as $child): ?>
<?= $builder->render($child, ['element' => $props]) ?>
<?php endforeach ?>
