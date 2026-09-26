from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'modules/competitions/elements'

files = {
'federation-card/element.php': r'''<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_federation_card',
    'title' => 'Federation Card',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => [
        'render' => __DIR__ . '/templates/template.php',
        'content' => __DIR__ . '/templates/content.php',
    ],
    'defaults' => [
        'selected_federation_id' => '',
        'card_style' => 'default',
        'show_website' => true,
    ],
    'fields' => [
        'selected_federation_id' => [
            'label' => 'Federation',
            'type' => 'select',
            'options' => XdecaroCompetitionsProvider::federationOptions(),
            'description' => 'Choose an available federation. Leave empty when using Dynamic Content overrides.',
        ],
        'name' => ['label' => 'Name', 'type' => 'text', 'source' => true],
        'short_name' => ['label' => 'Short Name', 'type' => 'text', 'source' => true],
        'country_name' => ['label' => 'Country', 'type' => 'text', 'source' => true],
        'country_code' => ['label' => 'Country Code', 'type' => 'text', 'source' => true],
        'logo' => ['label' => 'Logo', 'type' => 'text', 'source' => true],
        'website' => ['label' => 'Website', 'type' => 'text', 'source' => true],
        'link_override' => ['label' => 'Link', 'type' => 'text', 'source' => true],
        'show_website' => ['label' => 'Show Website', 'type' => 'checkbox', 'text' => 'Display website link'],
        'card_style' => [
            'label' => 'Card Style',
            'type' => 'select',
            'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary'],
        ],
        'source' => '${builder.source}',
        'name_builder' => '${builder.name}',
        'status' => '${builder.status}',
        'id' => '${builder.id}',
        'class' => '${builder.cls}',
        'attributes' => '${builder.attrs}',
    ],
    'fieldset' => [
        'default' => [
            'type' => 'tabs',
            'fields' => [
                ['title' => 'Content', 'fields' => ['selected_federation_id', 'link_override', 'show_website']],
                ['title' => 'Overrides', 'fields' => ['name', 'short_name', 'country_name', 'country_code', 'logo', 'website']],
                ['title' => 'Style', 'fields' => ['card_style']],
                '${builder.advanced}',
            ],
        ],
    ],
];
''',
'federation-card/templates/content.php': r'''<?php

defined('_JEXEC') || die;

$name = trim((string) ($props['name'] ?? ''));
if ($name === '' && !empty($props['selected_federation_id'])) {
    $row = XdecaroCompetitionsProvider::federationById((int) $props['selected_federation_id']);
    $name = trim((string) ($row['name'] ?? ''));
}

echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
''',
'federation-card/templates/template.php': r'''<?php

defined('_JEXEC') || die;

$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$safeUrl = static function (mixed $value): string {
    $url = trim((string) ($value ?? ''));
    if ($url === '') {
        return '';
    }
    $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME));
    return in_array($scheme, ['http', 'https'], true) ? htmlspecialchars($url, ENT_QUOTES, 'UTF-8') : '';
};
$selectedId = (int) ($props['selected_federation_id'] ?? 0);
$selected = $selectedId > 0 ? XdecaroCompetitionsProvider::federationById($selectedId) : null;
$value = static function (string $key) use ($props, $selected): mixed {
    $override = $props[$key] ?? null;
    return ($override !== null && trim((string) $override) !== '') ? $override : ($selected[$key] ?? null);
};
$name = trim((string) $value('name'));
$short = trim((string) $value('short_name'));
$country = trim((string) $value('country_name'));
$countryCode = trim((string) $value('country_code'));
$logo = trim((string) $value('logo'));
$websiteRaw = $value('website');
$linkRaw = trim((string) ($props['link_override'] ?? '')) !== '' ? $props['link_override'] : $websiteRaw;
$link = $safeUrl($linkRaw);
$website = $safeUrl($websiteRaw);
$style = in_array(($props['card_style'] ?? 'default'), ['default', 'primary', 'secondary'], true) ? $props['card_style'] : 'default';
$el = $this->el('div', ['class' => ['el-item', 'uk-card uk-card-{card_style} uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <div class="uk-flex uk-flex-middle uk-flex-wrap" uk-grid>
        <?php if ($logo !== '') : ?>
            <div class="uk-width-auto"><img src="<?= $escape($logo) ?>" alt="<?= $escape($name !== '' ? $name . ' logo' : 'Federation logo') ?>" width="72" height="72" loading="lazy" class="uk-object-contain"></div>
        <?php endif ?>
        <div class="uk-width-expand">
            <?php if ($name !== '') : ?><h3 class="uk-card-title uk-margin-remove"><?php if ($link !== '') : ?><a class="uk-link-reset" href="<?= $link ?>"><?= $escape($name) ?></a><?php else : ?><?= $escape($name) ?><?php endif ?></h3><?php endif ?>
            <?php if ($short !== '') : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($short) ?></div><?php endif ?>
            <?php $countryLabel = $country !== '' ? $country : $countryCode; if ($countryLabel !== '') : ?><div class="uk-margin-small-top"><?= $escape($countryLabel) ?></div><?php endif ?>
            <?php if (!empty($props['show_website']) && $website !== '') : ?><div class="uk-margin-small-top"><a href="<?= $website ?>" rel="noopener noreferrer">Website</a></div><?php endif ?>
        </div>
    </div>
<?= $el->end() ?>
''',
'federation-card/images/icon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16M6 21V9m12 12V9M3 9h18L12 3 3 9Z"/><path d="M9 12v5m6-5v5"/></svg>''',
'federation-card/images/iconSmall.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h14M5 17V8m10 9V8M3 8h14l-7-5-7 5Z"/><path d="M8 10v4m4-4v4"/></svg>''',

' team-card/element.php': r'''<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_team_card',
    'title' => 'Team Card',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_team' => '', 'card_style' => 'default', 'show_federation' => true],
    'fields' => [
        'selected_team' => ['label' => 'Competition / Team', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionTeamOptions(), 'description' => 'Choose a participating approved team in its competition context.'],
        'name' => ['label' => 'Name', 'type' => 'text', 'source' => true],
        'short_name' => ['label' => 'Short Name', 'type' => 'text', 'source' => true],
        'alias' => ['label' => 'Alias', 'type' => 'text', 'source' => true],
        'logo' => ['label' => 'Logo', 'type' => 'text', 'source' => true],
        'country_code' => ['label' => 'Country', 'type' => 'text', 'source' => true],
        'city' => ['label' => 'City', 'type' => 'text', 'source' => true],
        'federation_name' => ['label' => 'Federation', 'type' => 'text', 'source' => true],
        'federation_short_name' => ['label' => 'Federation Short Name', 'type' => 'text', 'source' => true],
        'link_override' => ['label' => 'Link', 'type' => 'text', 'source' => true],
        'show_federation' => ['label' => 'Show Federation', 'type' => 'checkbox', 'text' => 'Display federation'],
        'card_style' => ['label' => 'Card Style', 'type' => 'select', 'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary']],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_team', 'link_override', 'show_federation']],
        ['title' => 'Overrides', 'fields' => ['name', 'short_name', 'alias', 'logo', 'country_code', 'city', 'federation_name', 'federation_short_name']],
        ['title' => 'Style', 'fields' => ['card_style']], '${builder.advanced}',
    ]]],
];
''',
' team-card/templates/content.php': r'''<?php

defined('_JEXEC') || die;
$row = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::teamBySelection((string) $props['selected_team']) : null;
$name = trim((string) (($props['name'] ?? '') ?: ($row['name'] ?? '')));
echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
''',
' team-card/templates/template.php': r'''<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$safeUrl = static function (mixed $value): string { $url = trim((string) ($value ?? '')); if ($url === '') return ''; $scheme = strtolower((string) parse_url($url, PHP_URL_SCHEME)); return in_array($scheme, ['http', 'https'], true) ? htmlspecialchars($url, ENT_QUOTES, 'UTF-8') : ''; };
$selected = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::teamBySelection((string) $props['selected_team']) : null;
$value = static function (string $key) use ($props, $selected): mixed { $override = $props[$key] ?? null; return ($override !== null && trim((string) $override) !== '') ? $override : ($selected[$key] ?? null); };
$name = trim((string) $value('name')); $short = trim((string) $value('short_name')); $logo = trim((string) $value('logo')); $country = trim((string) $value('country_code')); $city = trim((string) $value('city')); $federation = trim((string) ($value('federation_short_name') ?: $value('federation_name'))); $link = $safeUrl($props['link_override'] ?? '');
$el = $this->el('div', ['class' => ['el-item', 'uk-card uk-card-{card_style} uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <div class="uk-flex uk-flex-middle uk-flex-wrap" uk-grid>
        <?php if ($logo !== '') : ?><div class="uk-width-auto"><img src="<?= $escape($logo) ?>" alt="<?= $escape($name !== '' ? $name . ' logo' : 'Team logo') ?>" width="80" height="80" loading="lazy" class="uk-object-contain"></div><?php endif ?>
        <div class="uk-width-expand">
            <?php if ($name !== '') : ?><h3 class="uk-card-title uk-margin-remove"><?php if ($link !== '') : ?><a class="uk-link-reset" href="<?= $link ?>"><?= $escape($name) ?></a><?php else : ?><?= $escape($name) ?><?php endif ?></h3><?php endif ?>
            <?php if ($short !== '' && strcasecmp($short, $name) !== 0) : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($short) ?></div><?php endif ?>
            <?php $location = implode(' · ', array_values(array_filter([$city, $country], static fn ($v) => $v !== ''))); if ($location !== '') : ?><div class="uk-margin-small-top"><?= $escape($location) ?></div><?php endif ?>
            <?php if (!empty($props['show_federation']) && $federation !== '') : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($federation) ?></div><?php endif ?>
        </div>
    </div>
<?= $el->end() ?>
''',
' team-card/images/icon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6l-7-3Z"/><path d="M8.5 12h7M12 8.5v7"/></svg>''',
' team-card/images/iconSmall.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5 4.5 5v4c0 3.6 2.2 6.4 5.5 8 3.3-1.6 5.5-4.4 5.5-8V5L10 2.5Z"/><path d="M7.5 10h5M10 7.5v5"/></svg>''',

' teams-grid/element.php': r'''<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_teams_grid',
    'title' => 'Teams Grid',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_season_id' => '', 'columns' => '3', 'show_short_name' => true, 'show_country' => true, 'show_federation' => true, 'empty_text' => 'No participating teams available.'],
    'fields' => [
        'selected_season_id' => ['label' => 'Competition', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionOptions(), 'description' => 'Choose a competition to show its approved participating teams.'],
        'season_id' => ['label' => 'Dynamic Season ID', 'type' => 'text', 'source' => true],
        'columns' => ['label' => 'Columns', 'type' => 'select', 'options' => ['2' => '2', '3' => '3', '4' => '4']],
        'show_short_name' => ['label' => 'Short Name', 'type' => 'checkbox', 'text' => 'Show short name'],
        'show_country' => ['label' => 'Country', 'type' => 'checkbox', 'text' => 'Show country'],
        'show_federation' => ['label' => 'Federation', 'type' => 'checkbox', 'text' => 'Show federation'],
        'empty_text' => ['label' => 'Empty Text', 'type' => 'text'],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_season_id', 'empty_text']],
        ['title' => 'Display', 'fields' => ['columns', 'show_short_name', 'show_country', 'show_federation']],
        ['title' => 'Dynamic', 'fields' => ['season_id']], '${builder.advanced}',
    ]]],
];
''',
' teams-grid/templates/content.php': r'''<?php

defined('_JEXEC') || die;
$seasonId = (int) (($props['selected_season_id'] ?? 0) ?: ($props['season_id'] ?? 0));
$rows = $seasonId > 0 ? XdecaroCompetitionsProvider::participatingTeams(null, ['season_id' => $seasonId, 'approved_only' => true]) : [];
echo count($rows) . ' teams';
''',
' teams-grid/templates/template.php': r'''<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$seasonId = (int) (($props['selected_season_id'] ?? 0) ?: ($props['season_id'] ?? 0));
$teams = $seasonId > 0 ? XdecaroCompetitionsProvider::participatingTeams(null, ['season_id' => $seasonId, 'approved_only' => true]) : [];
$columns = in_array((string) ($props['columns'] ?? '3'), ['2', '3', '4'], true) ? (string) $props['columns'] : '3';
$emptyText = trim((string) ($props['empty_text'] ?? 'No participating teams available.'));
$el = $this->el('div', ['class' => ['el-item']]);
?>
<?= $el($props, $attrs) ?>
    <?php if (!$teams) : ?><p class="uk-text-muted uk-margin-remove"><?= $escape($emptyText) ?></p><?php else : ?>
        <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-<?= $escape($columns) ?>@m" uk-grid>
            <?php foreach ($teams as $team) : $name = trim((string) ($team['name'] ?? '')); $logo = trim((string) ($team['logo'] ?? '')); ?>
                <div><article class="uk-card uk-card-default uk-card-body uk-height-1-1">
                    <div class="uk-flex uk-flex-middle" uk-grid>
                        <?php if ($logo !== '') : ?><div class="uk-width-auto"><img src="<?= $escape($logo) ?>" alt="<?= $escape($name !== '' ? $name . ' logo' : 'Team logo') ?>" width="64" height="64" loading="lazy" class="uk-object-contain"></div><?php endif ?>
                        <div class="uk-width-expand"><h3 class="uk-h4 uk-margin-remove"><?= $escape($name) ?></h3>
                            <?php if (!empty($props['show_short_name']) && !empty($team['short_name']) && strcasecmp((string) $team['short_name'], $name) !== 0) : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($team['short_name']) ?></div><?php endif ?>
                            <?php if (!empty($props['show_country']) && !empty($team['country_code'])) : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($team['country_code']) ?></div><?php endif ?>
                            <?php $fed = trim((string) (($team['federation_short_name'] ?? '') ?: ($team['federation_name'] ?? ''))); if (!empty($props['show_federation']) && $fed !== '') : ?><div class="uk-text-small uk-text-muted uk-margin-small-top"><?= $escape($fed) ?></div><?php endif ?>
                        </div>
                    </div>
                </article></div>
            <?php endforeach ?>
        </div>
    <?php endif ?>
<?= $el->end() ?>
''',
' teams-grid/images/icon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>''',
' teams-grid/images/iconSmall.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2.5" y="2.5" width="6" height="6" rx="1"/><rect x="11.5" y="2.5" width="6" height="6" rx="1"/><rect x="2.5" y="11.5" width="6" height="6" rx="1"/><rect x="11.5" y="11.5" width="6" height="6" rx="1"/></svg>''',

' player-card/element.php': r'''<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_player_card',
    'title' => 'Player Card',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_roster_player' => '', 'card_style' => 'default'],
    'fields' => [
        'selected_roster_player' => ['label' => 'Competition / Team / Player', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionRosterPlayerOptions(), 'description' => 'Choose a player from an approved competition roster.'],
        'display_name' => ['label' => 'Display Name', 'type' => 'text', 'source' => true],
        'first_name' => ['label' => 'First Name', 'type' => 'text', 'source' => true],
        'last_name' => ['label' => 'Last Name', 'type' => 'text', 'source' => true],
        'nationality_code' => ['label' => 'Nationality', 'type' => 'text', 'source' => true],
        'shirt_number' => ['label' => 'Shirt Number', 'type' => 'text', 'source' => true],
        'role' => ['label' => 'Role', 'type' => 'text', 'source' => true],
        'photo' => ['label' => 'Photo', 'type' => 'text', 'source' => true],
        'team_name' => ['label' => 'Team', 'type' => 'text', 'source' => true],
        'card_style' => ['label' => 'Card Style', 'type' => 'select', 'options' => ['Default' => 'default', 'Primary' => 'primary', 'Secondary' => 'secondary']],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_roster_player']],
        ['title' => 'Overrides', 'fields' => ['display_name', 'first_name', 'last_name', 'nationality_code', 'shirt_number', 'role', 'photo', 'team_name']],
        ['title' => 'Style', 'fields' => ['card_style']], '${builder.advanced}',
    ]]],
];
''',
' player-card/templates/content.php': r'''<?php

defined('_JEXEC') || die;
$row = !empty($props['selected_roster_player']) ? XdecaroCompetitionsProvider::rosterPlayerBySelection((string) $props['selected_roster_player']) : null;
$name = trim((string) (($props['display_name'] ?? '') ?: ($row['display_name'] ?? '')));
echo htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
''',
' player-card/templates/template.php': r'''<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$selected = !empty($props['selected_roster_player']) ? XdecaroCompetitionsProvider::rosterPlayerBySelection((string) $props['selected_roster_player']) : null;
$value = static function (string $key) use ($props, $selected): mixed { $override = $props[$key] ?? null; return ($override !== null && trim((string) $override) !== '') ? $override : ($selected[$key] ?? null); };
$display = trim((string) $value('display_name')); if ($display === '') { $display = trim((string) $value('first_name') . ' ' . (string) $value('last_name')); }
$photo = trim((string) $value('photo')); $number = trim((string) $value('shirt_number')); $role = trim((string) $value('role')); $nation = trim((string) $value('nationality_code')); $team = trim((string) $value('team_name'));
$initials = ''; foreach (preg_split('/\s+/', $display) ?: [] as $part) { if ($part !== '') $initials .= mb_strtoupper(mb_substr($part, 0, 1)); if (mb_strlen($initials) >= 2) break; }
$el = $this->el('article', ['class' => ['el-item', 'uk-card uk-card-{card_style} uk-card-body']]);
?>
<?= $el($props, $attrs) ?>
    <div class="uk-flex uk-flex-middle uk-flex-wrap" uk-grid>
        <div class="uk-width-auto"><?php if ($photo !== '') : ?><img src="<?= $escape($photo) ?>" alt="<?= $escape($display !== '' ? $display : 'Player') ?>" width="96" height="96" loading="lazy" class="uk-border-circle uk-object-cover"><?php else : ?><div class="uk-border-circle uk-background-muted uk-flex uk-flex-center uk-flex-middle" style="width:96px;height:96px" aria-label="Player photo not available"><span class="uk-text-large uk-text-muted"><?= $escape($initials !== '' ? $initials : '—') ?></span></div><?php endif ?></div>
        <div class="uk-width-expand"><?php if ($display !== '') : ?><h3 class="uk-card-title uk-margin-remove"><?= $escape($display) ?></h3><?php endif ?>
            <?php if ($number !== '') : ?><div class="uk-text-bold uk-margin-small-top">#<?= $escape($number) ?></div><?php endif ?>
            <?php $details = implode(' · ', array_values(array_filter([$role, $nation], static fn ($v) => $v !== ''))); if ($details !== '') : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($details) ?></div><?php endif ?>
            <?php if ($team !== '') : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($team) ?></div><?php endif ?>
        </div>
    </div>
<?= $el->end() ?>
''',
' player-card/images/icon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.6-4.4 3-6.6 7-6.6s6.4 2.2 7 6.6"/></svg>''',
' player-card/images/iconSmall.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="6.5" r="3"/><path d="M4.5 17c.5-3.7 2.3-5.5 5.5-5.5s5 1.8 5.5 5.5"/></svg>''',

' team-roster/element.php': r'''<?php

defined('_JEXEC') || die;

return [
    'name' => 'xdecaro_team_roster',
    'title' => 'Team Roster',
    'group' => 'xdecaro',
    'icon' => '${url:images/icon.svg}',
    'iconSmall' => '${url:images/iconSmall.svg}',
    'element' => true,
    'width' => 500,
    'templates' => ['render' => __DIR__ . '/templates/template.php', 'content' => __DIR__ . '/templates/content.php'],
    'defaults' => ['selected_team' => '', 'mode' => 'grid', 'columns' => '3', 'show_role' => true, 'show_nationality' => true, 'empty_text' => 'No approved roster players available.'],
    'fields' => [
        'selected_team' => ['label' => 'Competition / Team', 'type' => 'select', 'options' => XdecaroCompetitionsProvider::competitionTeamOptions(), 'description' => 'Choose a participating team to render its approved competition roster.'],
        'mode' => ['label' => 'Layout', 'type' => 'select', 'options' => ['Grid' => 'grid', 'List' => 'list']],
        'columns' => ['label' => 'Grid Columns', 'type' => 'select', 'options' => ['2' => '2', '3' => '3', '4' => '4']],
        'show_role' => ['label' => 'Role', 'type' => 'checkbox', 'text' => 'Show role'],
        'show_nationality' => ['label' => 'Nationality', 'type' => 'checkbox', 'text' => 'Show nationality'],
        'empty_text' => ['label' => 'Empty Text', 'type' => 'text'],
        'source' => '${builder.source}', 'name_builder' => '${builder.name}', 'status' => '${builder.status}', 'id' => '${builder.id}', 'class' => '${builder.cls}', 'attributes' => '${builder.attrs}',
    ],
    'fieldset' => ['default' => ['type' => 'tabs', 'fields' => [
        ['title' => 'Content', 'fields' => ['selected_team', 'empty_text']],
        ['title' => 'Display', 'fields' => ['mode', 'columns', 'show_role', 'show_nationality']], '${builder.advanced}',
    ]]],
];
''',
' team-roster/templates/content.php': r'''<?php

defined('_JEXEC') || die;
$rows = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::rosterBySelection((string) $props['selected_team']) : [];
echo count($rows) . ' players';
''',
' team-roster/templates/template.php': r'''<?php

defined('_JEXEC') || die;
$escape = static fn (mixed $value): string => htmlspecialchars(trim((string) ($value ?? '')), ENT_QUOTES, 'UTF-8');
$rows = !empty($props['selected_team']) ? XdecaroCompetitionsProvider::rosterBySelection((string) $props['selected_team']) : [];
$mode = ($props['mode'] ?? 'grid') === 'list' ? 'list' : 'grid';
$columns = in_array((string) ($props['columns'] ?? '3'), ['2', '3', '4'], true) ? (string) $props['columns'] : '3';
$emptyText = trim((string) ($props['empty_text'] ?? 'No approved roster players available.'));
$el = $this->el('div', ['class' => ['el-item']]);
?>
<?= $el($props, $attrs) ?>
<?php if (!$rows) : ?><p class="uk-text-muted uk-margin-remove"><?= $escape($emptyText) ?></p>
<?php elseif ($mode === 'list') : ?>
    <ul class="uk-list uk-list-divider uk-margin-remove">
        <?php foreach ($rows as $row) : $name = trim((string) ($row['display_name'] ?? '')); $photo = trim((string) ($row['photo'] ?? '')); ?>
            <li><div class="uk-flex uk-flex-middle uk-flex-wrap uk-flex-between" uk-grid>
                <div class="uk-width-expand"><div class="uk-flex uk-flex-middle">
                    <?php if ($photo !== '') : ?><img src="<?= $escape($photo) ?>" alt="<?= $escape($name !== '' ? $name : 'Player') ?>" width="48" height="48" loading="lazy" class="uk-border-circle uk-object-cover uk-margin-small-right"><?php endif ?>
                    <div><span class="uk-text-bold"><?php if (($row['shirt_number'] ?? null) !== null) : ?>#<?= $escape($row['shirt_number']) ?> · <?php endif ?><?= $escape($name) ?></span>
                    <?php if (!empty($props['show_role']) && !empty($row['role'])) : ?><div class="uk-text-meta"><?= $escape($row['role']) ?></div><?php endif ?></div>
                </div></div>
                <?php if (!empty($props['show_nationality']) && !empty($row['nationality_code'])) : ?><div class="uk-width-auto uk-text-small"><?= $escape($row['nationality_code']) ?></div><?php endif ?>
            </div></li>
        <?php endforeach ?>
    </ul>
<?php else : ?>
    <div class="uk-grid-small uk-child-width-1-1 uk-child-width-1-2@s uk-child-width-1-<?= $escape($columns) ?>@m" uk-grid>
        <?php foreach ($rows as $row) : $name = trim((string) ($row['display_name'] ?? '')); $photo = trim((string) ($row['photo'] ?? '')); ?>
            <div><article class="uk-card uk-card-default uk-card-body uk-height-1-1 uk-text-center">
                <?php if ($photo !== '') : ?><img src="<?= $escape($photo) ?>" alt="<?= $escape($name !== '' ? $name : 'Player') ?>" width="112" height="112" loading="lazy" class="uk-border-circle uk-object-cover"><?php else : ?><div class="uk-border-circle uk-background-muted uk-flex uk-flex-center uk-flex-middle uk-margin-auto" style="width:112px;height:112px" aria-label="Player photo not available"><span class="uk-text-muted">—</span></div><?php endif ?>
                <h3 class="uk-h4 uk-margin-small-top uk-margin-remove-bottom"><?php if (($row['shirt_number'] ?? null) !== null) : ?><span class="uk-text-muted">#<?= $escape($row['shirt_number']) ?></span> <?php endif ?><?= $escape($name) ?></h3>
                <?php if (!empty($props['show_role']) && !empty($row['role'])) : ?><div class="uk-text-meta uk-margin-small-top"><?= $escape($row['role']) ?></div><?php endif ?>
                <?php if (!empty($props['show_nationality']) && !empty($row['nationality_code'])) : ?><div class="uk-text-small uk-margin-small-top"><?= $escape($row['nationality_code']) ?></div><?php endif ?>
            </article></div>
        <?php endforeach ?>
    </div>
<?php endif ?>
<?= $el->end() ?>
''',
' team-roster/images/icon.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="8" cy="7" r="2.5"/><circle cx="16" cy="7" r="2.5"/><path d="M3 18c.4-3.3 2-5 5-5s4.6 1.7 5 5M11 18c.4-3.3 2-5 5-5s4.6 1.7 5 5"/></svg>''',
' team-roster/images/iconSmall.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="6.5" cy="6" r="2"/><circle cx="13.5" cy="6" r="2"/><path d="M2.5 16c.3-2.8 1.7-4.2 4-4.2s3.7 1.4 4 4.2M9.5 16c.3-2.8 1.7-4.2 4-4.2s3.7 1.4 4 4.2"/></svg>''',
}

# Strip a single leading space accidentally used above to make the dict visually readable.
normalized = {}
for relative, content in files.items():
    normalized[relative.lstrip()] = content

for relative, content in normalized.items():
    target = BASE / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content.rstrip() + '\n', encoding='utf-8')

print(f'Generated {len(normalized)} Competition entity element files')
