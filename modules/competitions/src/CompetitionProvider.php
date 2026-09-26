<?php

defined('_JEXEC') || die;

use Joomla\CMS\Factory;

final class XdecaroCompetitionsProvider
{
    private static bool $serviceResolved = false;
    private static mixed $service = null;
    private static ?array $competitionCatalog = null;
    private static ?array $matchCatalog = null;
    private static ?array $federationCatalog = null;
    private static ?array $competitionTeamCatalog = null;
    private static array $seasonTeamCache = [];
    private static array $rosterCache = [];

    public static function available(): bool
    {
        return self::service() !== null;
    }

    public static function competitionOptions(): array
    {
        $options = ['Choose competition…' => ''];

        foreach (self::competitionCatalog() as $competition) {
            $seasonId = (int) ($competition['season_id'] ?? 0);
            if ($seasonId <= 0) {
                continue;
            }

            $title = trim((string) ($competition['title'] ?? ''));
            if ($title === '') {
                $title = trim((string) ($competition['tournament_name'] ?? 'Competition'));
            }

            $year = trim((string) ($competition['season_year'] ?? ''));
            $city = trim((string) ($competition['host_city'] ?? ''));
            $status = trim((string) ($competition['temporal_status'] ?? ''));
            $details = array_values(array_filter([$year, $city, $status], static fn (string $value): bool => $value !== ''));
            $label = $title . ($details ? ' — ' . implode(' · ', $details) : '');

            $options[$label] = (string) $seasonId;
        }

        return $options;
    }

    public static function matchOptions(): array
    {
        $options = ['Choose match…' => ''];

        foreach (self::matchCatalog() as $match) {
            $matchId = (int) ($match['id'] ?? 0);
            if ($matchId <= 0) {
                continue;
            }

            $home = trim((string) ($match['home_team_short_name'] ?? $match['home_team_name'] ?? ''));
            $away = trim((string) ($match['away_team_short_name'] ?? $match['away_team_name'] ?? ''));
            $date = trim((string) ($match['match_date'] ?? ''));
            $time = trim((string) ($match['kickoff_time'] ?? ''));
            $competition = trim((string) ($match['tournament_name'] ?? ''));
            $year = trim((string) ($match['season_year'] ?? ''));

            $fixture = trim($home . ' vs ' . $away);
            if ($fixture === 'vs') {
                $fixture = 'Match #' . $matchId;
            }

            $context = array_values(array_filter([$competition, $year, trim($date . ' ' . $time)], static fn (string $value): bool => $value !== ''));
            $label = $fixture . ($context ? ' — ' . implode(' · ', $context) : '');
            $options[$label] = (string) $matchId;
        }

        return $options;
    }

    public static function competitionBySeasonId(int $seasonId): ?array
    {
        if ($seasonId <= 0) {
            return null;
        }

        foreach (self::competitionCatalog() as $competition) {
            if ((int) ($competition['season_id'] ?? 0) === $seasonId) {
                return $competition;
            }
        }

        return null;
    }

    public static function currentCompetitions($obj, array $args): array
    {
        return self::callList('getCurrentCompetitions', [(int) ($args['limit'] ?? 12)]);
    }

    public static function upcomingCompetitions($obj, array $args): array
    {
        return self::callList('getUpcomingCompetitions', [(int) ($args['limit'] ?? 12)]);
    }

    public static function previousCompetitions($obj, array $args): array
    {
        return self::callList('getPreviousCompetitions', [(int) ($args['limit'] ?? 12)]);
    }

    public static function competitionsByYear($obj, array $args): array
    {
        return self::callList('getCompetitionsByYear', [
            (int) ($args['year'] ?? 0),
            (int) ($args['limit'] ?? 50),
        ]);
    }

    public static function competitionsByTournament($obj, array $args): array
    {
        return self::callList('getCompetitionsByTournament', [
            (int) ($args['tournament_id'] ?? 0),
            (int) ($args['limit'] ?? 50),
        ]);
    }

    public static function upcomingSeasons($obj, array $args): array
    {
        $year = (int) date('Y');

        return self::callList('getUpcomingSeasons', [
            (int) ($args['from_year'] ?? $year),
            (int) ($args['to_year'] ?? ($year + 5)),
            (int) ($args['limit'] ?? 100),
        ]);
    }

    public static function participatingTeams($obj, array $args): array
    {
        return self::callList('getParticipatingTeams', [
            (int) ($args['season_id'] ?? 0),
            self::boolArg($args, 'approved_only', true),
        ]);
    }

    public static function team($obj, array $args): mixed
    {
        return self::callSingle('getTeam', [(int) ($args['team_id'] ?? 0)]);
    }

    public static function upcomingMatches($obj, array $args): array
    {
        return self::callList('getUpcomingMatches', [
            self::nullableInt($args['season_id'] ?? null),
            self::nullableInt($args['team_id'] ?? null),
            (int) ($args['limit'] ?? 20),
        ]);
    }

    public static function latestResults($obj, array $args): array
    {
        return self::callList('getLatestResults', [
            self::nullableInt($args['season_id'] ?? null),
            self::nullableInt($args['team_id'] ?? null),
            (int) ($args['limit'] ?? 20),
        ]);
    }

    public static function matchesBySeason($obj, array $args): array
    {
        return self::callList('getMatchesBySeason', [
            (int) ($args['season_id'] ?? 0),
            (int) ($args['limit'] ?? 100),
        ]);
    }

    public static function match($obj, array $args): mixed
    {
        return self::callSingle('getMatch', [(int) ($args['match_id'] ?? 0)]);
    }

    public static function standings($obj, array $args): array
    {
        return self::callList('getStandings', [(int) ($args['season_id'] ?? 0)]);
    }

    public static function rankings($obj, array $args): array
    {
        return self::callList('getRankings', [
            self::nullableInt($args['season_id'] ?? null),
            (int) ($args['limit'] ?? 100),
        ]);
    }

    public static function countries($obj, array $args): array
    {
        return self::callList('getCountries', [(int) ($args['limit'] ?? 250)]);
    }

    public static function federations($obj, array $args): array
    {
        return self::callList('getFederations', [
            self::nullableInt($args['country_id'] ?? null),
            (int) ($args['limit'] ?? 250),
        ]);
    }

    public static function federationOptions(): array
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

    private static function competitionCatalog(): array
    {
        if (self::$competitionCatalog !== null) {
            return self::$competitionCatalog;
        }

        $indexed = [];
        foreach ([
            self::currentCompetitions(null, ['limit' => 100]),
            self::upcomingCompetitions(null, ['limit' => 100]),
            self::previousCompetitions(null, ['limit' => 100]),
        ] as $group) {
            foreach ($group as $competition) {
                if (!is_array($competition)) {
                    continue;
                }

                $seasonId = (int) ($competition['season_id'] ?? 0);
                if ($seasonId > 0) {
                    $indexed[$seasonId] = $competition;
                }
            }
        }

        uasort($indexed, static function (array $left, array $right): int {
            $leftYear = (int) ($left['season_year'] ?? 0);
            $rightYear = (int) ($right['season_year'] ?? 0);
            if ($leftYear !== $rightYear) {
                return $rightYear <=> $leftYear;
            }

            return strcasecmp((string) ($left['title'] ?? ''), (string) ($right['title'] ?? ''));
        });

        return self::$competitionCatalog = array_values($indexed);
    }

    private static function matchCatalog(): array
    {
        if (self::$matchCatalog !== null) {
            return self::$matchCatalog;
        }

        $indexed = [];
        foreach ([
            self::upcomingMatches(null, ['limit' => 100]),
            self::latestResults(null, ['limit' => 100]),
        ] as $group) {
            foreach ($group as $match) {
                if (!is_array($match)) {
                    continue;
                }

                $matchId = (int) ($match['id'] ?? 0);
                if ($matchId > 0) {
                    $indexed[$matchId] = $match;
                }
            }
        }

        return self::$matchCatalog = array_values($indexed);
    }

    private static function federationCatalog(): array
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

    private static function service(): mixed
    {
        if (self::$serviceResolved) {
            return self::$service;
        }

        self::$serviceResolved = true;

        try {
            $app = Factory::getApplication();
            if (!method_exists($app, 'bootComponent')) {
                return null;
            }

            $component = $app->bootComponent('com_xdecarocompetitions');
            if (!is_object($component) || !method_exists($component, 'getPublicBuilderDataService')) {
                return null;
            }

            self::$service = $component->getPublicBuilderDataService();
        } catch (\Throwable) {
            self::$service = null;
        }

        return self::$service;
    }

    private static function callList(string $method, array $arguments): array
    {
        $service = self::service();
        if (!is_object($service) || !method_exists($service, $method)) {
            return [];
        }

        try {
            $result = $service->{$method}(...$arguments);
            return is_array($result) ? $result : [];
        } catch (\Throwable) {
            return [];
        }
    }

    private static function callSingle(string $method, array $arguments): mixed
    {
        $service = self::service();
        if (!is_object($service) || !method_exists($service, $method)) {
            return null;
        }

        try {
            return $service->{$method}(...$arguments);
        } catch (\Throwable) {
            return null;
        }
    }

    private static function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = (int) $value;
        return $value > 0 ? $value : null;
    }

    private static function boolArg(array $args, string $key, bool $default): bool
    {
        if (!array_key_exists($key, $args)) {
            return $default;
        }

        $value = $args[$key];
        if (is_bool($value)) {
            return $value;
        }

        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? $default;
    }
}
