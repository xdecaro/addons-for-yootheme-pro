<?php

defined('_JEXEC') || die;

use Joomla\CMS\Factory;

final class XdecaroCompetitionsProvider
{
    private static bool $serviceResolved = false;
    private static mixed $service = null;
    private static ?array $competitionCatalog = null;
    private static ?array $matchCatalog = null;

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
