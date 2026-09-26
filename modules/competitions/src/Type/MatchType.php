<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionMatchType
{
    public static function config(): array
    {
        $fields = [];
        foreach ([
            'id' => ['Int', 'Match ID', 'Identity'],
            'season_id' => ['Int', 'Season ID', 'Competition'],
            'tournament_id' => ['Int', 'Tournament ID', 'Competition'],
            'tournament_name' => ['String', 'Tournament', 'Competition'],
            'season_name' => ['String', 'Season', 'Competition'],
            'season_year' => ['Int', 'Season Year', 'Competition'],
            'home_team_id' => ['Int', 'Home Team ID', 'Teams'],
            'home_team_name' => ['String', 'Home Team', 'Teams'],
            'home_team_short_name' => ['String', 'Home Team Short Name', 'Teams'],
            'home_team_logo' => ['String', 'Home Team Logo', 'Teams'],
            'away_team_id' => ['Int', 'Away Team ID', 'Teams'],
            'away_team_name' => ['String', 'Away Team', 'Teams'],
            'away_team_short_name' => ['String', 'Away Team Short Name', 'Teams'],
            'away_team_logo' => ['String', 'Away Team Logo', 'Teams'],
            'venue_id' => ['Int', 'Venue ID', 'Venue'],
            'venue_name' => ['String', 'Venue', 'Venue'],
            'venue_city' => ['String', 'Venue City', 'Venue'],
            'match_date' => ['String', 'Match Date', 'Schedule'],
            'kickoff_time' => ['String', 'Kick-off Time', 'Schedule'],
            'stage' => ['String', 'Stage', 'Schedule'],
            'group_name' => ['String', 'Group', 'Schedule'],
            'round_name' => ['String', 'Round', 'Schedule'],
            'matchday' => ['Int', 'Matchday', 'Schedule'],
            'status' => ['String', 'Status', 'Result'],
            'home_score' => ['Int', 'Home Score', 'Result'],
            'away_score' => ['Int', 'Away Score', 'Result'],
            'home_score_extra' => ['Int', 'Home Extra-Time Score', 'Result'],
            'away_score_extra' => ['Int', 'Away Extra-Time Score', 'Result'],
            'home_penalties' => ['Int', 'Home Penalties', 'Result'],
            'away_penalties' => ['Int', 'Away Penalties', 'Result'],
        ] as $name => [$type, $label, $group]) {
            $fields[$name] = ['type' => $type, 'metadata' => ['label' => $label, 'group' => $group]];
        }

        return [
            'fields' => $fields,
            'metadata' => ['type' => true, 'label' => 'Xdecaro Competition Match'],
        ];
    }
}
