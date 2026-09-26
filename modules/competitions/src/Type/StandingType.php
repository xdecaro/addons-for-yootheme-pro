<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionStandingType
{
    public static function config(): array
    {
        $fields = [];
        foreach ([
            'position' => ['Int', 'Position'],
            'team_id' => ['Int', 'Team ID'],
            'team_name' => ['String', 'Team'],
            'team_short_name' => ['String', 'Team Short Name'],
            'team_logo' => ['String', 'Team Logo'],
            'played' => ['Int', 'Played'],
            'won' => ['Int', 'Won'],
            'drawn' => ['Int', 'Drawn'],
            'lost' => ['Int', 'Lost'],
            'goals_for' => ['Int', 'Goals For'],
            'goals_against' => ['Int', 'Goals Against'],
            'goal_difference' => ['Int', 'Goal Difference'],
            'points' => ['Int', 'Points'],
        ] as $name => [$type, $label]) {
            $fields[$name] = ['type' => $type, 'metadata' => ['label' => $label, 'group' => 'Standing']];
        }

        return [
            'fields' => $fields,
            'metadata' => ['type' => true, 'label' => 'Xdecaro Competition Standing'],
        ];
    }
}
