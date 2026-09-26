<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionRankingType
{
    public static function config(): array
    {
        $fields = [];
        foreach ([
            'id' => ['Int', 'Ranking ID'],
            'tournament_id' => ['Int', 'Tournament ID'],
            'tournament_name' => ['String', 'Tournament'],
            'ranking_type' => ['String', 'Ranking Type'],
            'entity_id' => ['Int', 'Entity ID'],
            'entity_name' => ['String', 'Name'],
            'entity_short_name' => ['String', 'Short Name'],
            'season_end_id' => ['Int', 'Season End ID'],
            'seasons_count' => ['Int', 'Seasons Count'],
            'coefficient_total' => ['Float', 'Coefficient'],
            'position' => ['Int', 'Position'],
            'calculated_at' => ['String', 'Calculated At'],
        ] as $name => [$type, $label]) {
            $fields[$name] = ['type' => $type, 'metadata' => ['label' => $label, 'group' => 'Ranking']];
        }

        return [
            'fields' => $fields,
            'metadata' => ['type' => true, 'label' => 'Xdecaro Competition Ranking'],
        ];
    }
}
