<?php

defined('_JEXEC') || die;

use Joomla\CMS\Factory;

final class XdecaroCompetitionsProvider
{
    private static bool $serviceResolved = false;
    private static mixed $service = null;

    public static function available(): bool
    {
        return self::service() !== null;
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
