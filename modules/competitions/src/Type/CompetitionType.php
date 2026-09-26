<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionType
{
    public static function config(): array
    {
        return [
            'fields' => [
                'season_id' => self::field('Int', 'Season ID', 'Identity'),
                'tournament_id' => self::field('Int', 'Tournament ID', 'Identity'),
                'title' => self::field('String', 'Title', 'Competition'),
                'tournament_name' => self::field('String', 'Tournament', 'Competition'),
                'tournament_code' => self::field('String', 'Tournament Code', 'Competition'),
                'discipline' => self::field('String', 'Discipline', 'Competition'),
                'gender' => self::field('String', 'Gender', 'Competition'),
                'season_name' => self::field('String', 'Season', 'Season'),
                'season_year' => self::field('Int', 'Season Year', 'Season'),
                'host_city' => self::field('String', 'Host City', 'Event'),
                'host_country_code' => self::field('String', 'Host Country Code', 'Event'),
                'start_date' => self::field('String', 'Start Date', 'Event'),
                'end_date' => self::field('String', 'End Date', 'Event'),
                'temporal_status' => self::field('String', 'Temporal Status', 'Competition'),
                'team_count' => self::field('Int', 'Approved Teams', 'Competition'),
            ],
            'metadata' => [
                'type' => true,
                'label' => 'Xdecaro Competition',
            ],
        ];
    }

    private static function field(string $type, string $label, string $group): array
    {
        return ['type' => $type, 'metadata' => ['label' => $label, 'group' => $group]];
    }
}
