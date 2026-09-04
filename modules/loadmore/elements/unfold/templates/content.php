<?php foreach ($children as $child): ?>
<?= $builder->render($child, ['element' => $props]) ?>
<?php endforeach ?>
