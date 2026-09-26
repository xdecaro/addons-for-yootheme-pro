<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionFederationType
{
    public static function config(): array
    {
        return [
            'fields' => [
                'id' => ['type' => 'Int', 'metadata' => ['label' => 'Federation ID']],
                'country_id' => ['type' => 'Int', 'metadata' => ['label' => 'Country ID']],
                'name' => ['type' => 'String', 'metadata' => ['label' => 'Name']],
                'short_name' => ['type' => 'String', 'metadata' => ['label' => 'Short Name']],
                'logo' => ['type' => 'String', 'metadata' => ['label' => 'Logo']],
                'website' => ['type' => 'String', 'metadata' => ['label' => 'Website']],
            ],
            'metadata' => ['type' => true, 'label' => 'Xdecaro Competition Federation'],
        ];
    }
}
