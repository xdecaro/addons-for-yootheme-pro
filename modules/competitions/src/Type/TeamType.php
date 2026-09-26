<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionTeamType
{
    public static function config(): array
    {
        return [
            'fields' => [
                'id' => self::field('Int', 'Team ID', 'Identity'),
                'name' => self::field('String', 'Name', 'Team'),
                'short_name' => self::field('String', 'Short Name', 'Team'),
                'alias' => self::field('String', 'Alias', 'Team'),
                'logo' => self::field('String', 'Logo', 'Team'),
                'country_code' => self::field('String', 'Country Code', 'Team'),
                'city' => self::field('String', 'City', 'Team'),
                'federation_id' => self::field('Int', 'Federation ID', 'Federation'),
                'federation_name' => self::field('String', 'Federation', 'Federation'),
                'federation_short_name' => self::field('String', 'Federation Short Name', 'Federation'),
                'participation_status' => self::field('String', 'Participation Status', 'Participation'),
            ],
            'metadata' => ['type' => true, 'label' => 'Xdecaro Competition Team'],
        ];
    }

    private static function field(string $type, string $label, string $group): array
    {
        return ['type' => $type, 'metadata' => ['label' => $label, 'group' => $group]];
    }
}
