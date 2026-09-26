<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionsQueryType
{
    private const GROUP = 'XDECARO / Competitions';

    public static function config(): array
    {
        return [
            'fields' => [
                'xdecaro_current_competitions' => self::listField(
                    'XdecaroCompetition',
                    'Current Competitions',
                    'currentCompetitions',
                    ['limit' => self::intArg('Limit', 12)]
                ),
                'xdecaro_upcoming_competitions' => self::listField(
                    'XdecaroCompetition',
                    'Upcoming Competitions',
                    'upcomingCompetitions',
                    ['limit' => self::intArg('Limit', 12)]
                ),
                'xdecaro_previous_competitions' => self::listField(
                    'XdecaroCompetition',
                    'Previous Competitions',
                    'previousCompetitions',
                    ['limit' => self::intArg('Limit', 12)]
                ),
                'xdecaro_competitions_by_year' => self::listField(
                    'XdecaroCompetition',
                    'Competitions by Year',
                    'competitionsByYear',
                    [
                        'year' => self::intArg('Year', (int) date('Y'), true),
                        'limit' => self::intArg('Limit', 50),
                    ]
                ),
                'xdecaro_competitions_by_tournament' => self::listField(
                    'XdecaroCompetition',
                    'Competitions by Tournament',
                    'competitionsByTournament',
                    [
                        'tournament_id' => self::intArg('Tournament ID', 0, true),
                        'limit' => self::intArg('Limit', 50),
                    ]
                ),
                'xdecaro_upcoming_seasons' => self::listField(
                    'XdecaroCompetition',
                    'Upcoming Seasons',
                    'upcomingSeasons',
                    [
                        'from_year' => self::intArg('From Year', (int) date('Y')),
                        'to_year' => self::intArg('To Year', (int) date('Y') + 5),
                        'limit' => self::intArg('Limit', 100),
                    ]
                ),
                'xdecaro_participating_teams' => self::listField(
                    'XdecaroCompetitionTeam',
                    'Participating Teams',
                    'participatingTeams',
                    [
                        'season_id' => self::intArg('Season ID', 0, true),
                        'approved_only' => self::boolArg('Approved Only', true),
                    ]
                ),
                'xdecaro_team' => self::singleField(
                    'XdecaroCompetitionTeam',
                    'Team',
                    'team',
                    ['team_id' => self::intArg('Team ID', 0, true)]
                ),
                'xdecaro_upcoming_matches' => self::listField(
                    'XdecaroCompetitionMatch',
                    'Upcoming Matches',
                    'upcomingMatches',
                    [
                        'season_id' => self::intArg('Season ID', 0),
                        'team_id' => self::intArg('Team ID', 0),
                        'limit' => self::intArg('Limit', 20),
                    ]
                ),
                'xdecaro_latest_results' => self::listField(
                    'XdecaroCompetitionMatch',
                    'Latest Results',
                    'latestResults',
                    [
                        'season_id' => self::intArg('Season ID', 0),
                        'team_id' => self::intArg('Team ID', 0),
                        'limit' => self::intArg('Limit', 20),
                    ]
                ),
                'xdecaro_matches_by_season' => self::listField(
                    'XdecaroCompetitionMatch',
                    'Matches by Season',
                    'matchesBySeason',
                    [
                        'season_id' => self::intArg('Season ID', 0, true),
                        'limit' => self::intArg('Limit', 100),
                    ]
                ),
                'xdecaro_match' => self::singleField(
                    'XdecaroCompetitionMatch',
                    'Match',
                    'match',
                    ['match_id' => self::intArg('Match ID', 0, true)]
                ),
                'xdecaro_standings' => self::listField(
                    'XdecaroCompetitionStanding',
                    'Standings',
                    'standings',
                    ['season_id' => self::intArg('Season ID', 0, true)]
                ),
                'xdecaro_rankings' => self::listField(
                    'XdecaroCompetitionRanking',
                    'Rankings',
                    'rankings',
                    [
                        'season_id' => self::intArg('Season End ID', 0),
                        'limit' => self::intArg('Limit', 100),
                    ]
                ),
                'xdecaro_countries' => self::listField(
                    'XdecaroCompetitionCountry',
                    'Countries',
                    'countries',
                    ['limit' => self::intArg('Limit', 250)]
                ),
                'xdecaro_federations' => self::listField(
                    'XdecaroCompetitionFederation',
                    'Federations',
                    'federations',
                    [
                        'country_id' => self::intArg('Country ID', 0),
                        'limit' => self::intArg('Limit', 250),
                    ]
                ),
            ],
        ];
    }

    private static function listField(string $type, string $label, string $method, array $args): array
    {
        return self::field(['listOf' => $type], $label, $method, $args);
    }

    private static function singleField(string $type, string $label, string $method, array $args): array
    {
        return self::field($type, $label, $method, $args);
    }

    private static function field(mixed $type, string $label, string $method, array $args): array
    {
        $metadataFields = [];
        foreach ($args as $name => $config) {
            $metadataFields[$name] = $config['metadata_field'];
            unset($args[$name]['metadata_field']);
        }

        return [
            'type' => $type,
            'args' => $args,
            'metadata' => [
                'label' => $label,
                'group' => self::GROUP,
                'fields' => $metadataFields,
            ],
            'extensions' => [
                'call' => XdecaroCompetitionsProvider::class . '::' . $method,
            ],
        ];
    }

    private static function intArg(string $label, int $default, bool $required = false): array
    {
        return [
            'type' => 'Int',
            'defaultValue' => $default,
            'metadata_field' => [
                'label' => $label,
                'type' => 'number',
                'attrs' => [
                    'min' => $required ? 1 : 0,
                    'step' => 1,
                ],
            ],
        ];
    }

    private static function boolArg(string $label, bool $default): array
    {
        return [
            'type' => 'Boolean',
            'defaultValue' => $default,
            'metadata_field' => [
                'label' => $label,
                'type' => 'checkbox',
                'text' => $label,
            ],
        ];
    }
}
