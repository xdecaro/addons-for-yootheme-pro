<?php

defined('_JEXEC') || die;

final class XdecaroCompetitionCountryType
{
    public static function config(): array
    {
        return [
            'fields' => [
                'id' => ['type' => 'Int', 'metadata' => ['label' => 'Country ID']],
                'name' => ['type' => 'String', 'metadata' => ['label' => 'Name']],
                'code' => ['type' => 'String', 'metadata' => ['label' => 'Code']],
                'iso2' => ['type' => 'String', 'metadata' => ['label' => 'ISO Alpha-2']],
                'iso3' => ['type' => 'String', 'metadata' => ['label' => 'ISO Alpha-3']],
                'entity_type' => ['type' => 'String', 'metadata' => ['label' => 'Entity Type']],
                'flag' => ['type' => 'String', 'metadata' => ['label' => 'Flag']],
            ],
            'metadata' => ['type' => true, 'label' => 'Xdecaro Competition Country'],
        ];
    }
}
