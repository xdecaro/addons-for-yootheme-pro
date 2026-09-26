from pathlib import Path

path = Path('modules/competitions/src/CompetitionProvider.php')
text = path.read_text(encoding='utf-8')

if 'public static function federationOptions(): array' in text:
    raise SystemExit('Entity provider helpers already present')

text = text.replace(
    '    private static ?array $matchCatalog = null;\n',
    '    private static ?array $matchCatalog = null;\n'
    '    private static ?array $federationCatalog = null;\n'
    '    private static ?array $competitionTeamCatalog = null;\n'
    '    private static array $seasonTeamCache = [];\n'
    '    private static array $rosterCache = [];\n',
    1,
)

marker = '    private static function competitionCatalog(): array\n'
methods = r'''    public static function federationOptions(): array
    {
        $options = ['Choose federation…' => ''];

        foreach (self::federationCatalog() as $federation) {
            $id = (int) ($federation['id'] ?? 0);
            if ($id < 1) {
                continue;
            }

            $name = trim((string) ($federation['name'] ?? ''));
            $short = trim((string) ($federation['short_name'] ?? ''));
            $label = $name !== '' ? $name : ('Federation #' . $id);
            if ($short !== '' && strcasecmp($short, $label) !== 0) {
                $label .= ' (' . $short . ')';
            }

            $options[$label] = (string) $id;
        }

        return $options;
    }

    public static function federationById(int $federationId): ?array
    {
        if ($federationId < 1) {
            return null;
        }

        $row = self::callSingle('getFederation', [$federationId]);
        return is_array($row) ? $row : null;
    }

    public static function competitionTeamOptions(): array
    {
        $options = ['Choose competition / team…' => ''];

        foreach (self::competitionTeamCatalog() as $selection => $item) {
            $options[(string) $item['label']] = $selection;
        }

        return $options;
    }

    public static function teamBySelection(string $selection): ?array
    {
        $ids = self::parseScopedSelection($selection, 2);
        if ($ids === null) {
            return null;
        }

        [$seasonId, $teamId] = $ids;
        foreach (self::teamsForSeason($seasonId) as $team) {
            if ((int) ($team['id'] ?? 0) === $teamId) {
                $team['season_id'] = $seasonId;
                return $team;
            }
        }

        return null;
    }

    public static function competitionRosterPlayerOptions(): array
    {
        $options = ['Choose competition / team / player…' => ''];

        foreach (self::competitionTeamCatalog() as $teamSelection => $item) {
            foreach (self::rosterBySelection($teamSelection) as $row) {
                $rosterId = (int) ($row['roster_id'] ?? 0);
                if ($rosterId < 1) {
                    continue;
                }

                $number = $row['shirt_number'] ?? null;
                $name = trim((string) ($row['display_name'] ?? ''));
                if ($name === '') {
                    $name = trim((string) (($row['first_name'] ?? '') . ' ' . ($row['last_name'] ?? '')));
                }
                $playerLabel = ($number !== null && $number !== '') ? ((int) $number . ' · ' . $name) : $name;
                $label = (string) $item['label'] . ' — ' . ($playerLabel !== '' ? $playerLabel : ('Player #' . $rosterId));
                $options[$label] = $teamSelection . ':' . $rosterId;
            }
        }

        return $options;
    }

    public static function rosterPlayerBySelection(string $selection): ?array
    {
        $ids = self::parseScopedSelection($selection, 3);
        if ($ids === null) {
            return null;
        }

        [$seasonId, $teamId, $rosterId] = $ids;
        foreach (self::rosterBySelection($seasonId . ':' . $teamId) as $row) {
            if (
                (int) ($row['roster_id'] ?? 0) === $rosterId
                && (int) ($row['season_id'] ?? 0) === $seasonId
                && (int) ($row['team_id'] ?? 0) === $teamId
            ) {
                return $row;
            }
        }

        return null;
    }

    public static function rosterBySelection(string $selection): array
    {
        $ids = self::parseScopedSelection($selection, 2);
        if ($ids === null || self::teamBySelection($selection) === null) {
            return [];
        }

        [$seasonId, $teamId] = $ids;
        $cacheKey = $seasonId . ':' . $teamId;
        if (array_key_exists($cacheKey, self::$rosterCache)) {
            return self::$rosterCache[$cacheKey];
        }

        $rows = self::callList('getRoster', [$seasonId, $teamId, true]);
        $rows = array_values(array_filter($rows, static function (mixed $row) use ($seasonId, $teamId): bool {
            return is_array($row)
                && (int) ($row['season_id'] ?? 0) === $seasonId
                && (int) ($row['team_id'] ?? 0) === $teamId;
        }));

        return self::$rosterCache[$cacheKey] = $rows;
    }

'''
if marker not in text:
    raise SystemExit('competitionCatalog marker not found')
text = text.replace(marker, methods + marker, 1)

helper_marker = '    private static function service(): mixed\n'
helpers = r'''    private static function federationCatalog(): array
    {
        if (self::$federationCatalog !== null) {
            return self::$federationCatalog;
        }

        $rows = self::callList('getFederations', [null, 250]);
        $rows = array_values(array_filter($rows, static fn (mixed $row): bool => is_array($row) && (int) ($row['id'] ?? 0) > 0));
        usort($rows, static fn (array $left, array $right): int => strcasecmp((string) ($left['name'] ?? ''), (string) ($right['name'] ?? '')));

        return self::$federationCatalog = $rows;
    }

    private static function competitionTeamCatalog(): array
    {
        if (self::$competitionTeamCatalog !== null) {
            return self::$competitionTeamCatalog;
        }

        $catalog = [];
        foreach (self::competitionCatalog() as $competition) {
            $seasonId = (int) ($competition['season_id'] ?? 0);
            if ($seasonId < 1) {
                continue;
            }

            $competitionLabel = self::competitionLabel($competition);
            foreach (self::teamsForSeason($seasonId) as $team) {
                $teamId = (int) ($team['id'] ?? 0);
                if ($teamId < 1) {
                    continue;
                }

                $teamName = trim((string) ($team['name'] ?? ''));
                if ($teamName === '') {
                    $teamName = trim((string) ($team['short_name'] ?? 'Team #' . $teamId));
                }
                $selection = $seasonId . ':' . $teamId;
                $catalog[$selection] = [
                    'label' => $competitionLabel . ' — ' . $teamName,
                    'season_id' => $seasonId,
                    'team_id' => $teamId,
                    'team' => $team,
                ];
            }
        }

        return self::$competitionTeamCatalog = $catalog;
    }

    private static function teamsForSeason(int $seasonId): array
    {
        if ($seasonId < 1) {
            return [];
        }
        if (array_key_exists($seasonId, self::$seasonTeamCache)) {
            return self::$seasonTeamCache[$seasonId];
        }

        $rows = self::callList('getParticipatingTeams', [$seasonId, true]);
        return self::$seasonTeamCache[$seasonId] = array_values(array_filter(
            $rows,
            static fn (mixed $row): bool => is_array($row) && (int) ($row['id'] ?? 0) > 0
        ));
    }

    private static function competitionLabel(array $competition): string
    {
        $title = trim((string) ($competition['title'] ?? ''));
        if ($title === '') {
            $title = trim((string) ($competition['tournament_name'] ?? 'Competition'));
        }
        $year = trim((string) ($competition['season_year'] ?? ''));

        return $title . ($year !== '' && !str_contains($title, $year) ? ' ' . $year : '');
    }

    private static function parseScopedSelection(string $selection, int $parts): ?array
    {
        $raw = explode(':', trim($selection));
        if (count($raw) !== $parts) {
            return null;
        }

        $ids = [];
        foreach ($raw as $value) {
            if ($value === '' || !ctype_digit($value)) {
                return null;
            }
            $id = (int) $value;
            if ($id < 1) {
                return null;
            }
            $ids[] = $id;
        }

        return $ids;
    }

'''
if helper_marker not in text:
    raise SystemExit('service marker not found')
text = text.replace(helper_marker, helpers + helper_marker, 1)

path.write_text(text, encoding='utf-8')
print('Applied scoped entity provider helpers')
