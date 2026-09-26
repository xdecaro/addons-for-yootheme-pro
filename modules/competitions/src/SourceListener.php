<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionsSourceListener
{
    public static function initSource($source): void
    {
        if (!XdecaroCompetitionsProvider::available()) {
            return;
        }

        $source->objectType('XdecaroCompetition', XdecaroCompetitionType::config());
        $source->objectType('XdecaroCompetitionTeam', XdecaroCompetitionTeamType::config());
        $source->objectType('XdecaroCompetitionMatch', XdecaroCompetitionMatchType::config());
        $source->objectType('XdecaroCompetitionStanding', XdecaroCompetitionStandingType::config());
        $source->objectType('XdecaroCompetitionRanking', XdecaroCompetitionRankingType::config());
        $source->objectType('XdecaroCompetitionCountry', XdecaroCompetitionCountryType::config());
        $source->objectType('XdecaroCompetitionFederation', XdecaroCompetitionFederationType::config());
        $source->queryType(XdecaroCompetitionsQueryType::config());
    }
}
