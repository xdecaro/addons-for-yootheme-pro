# Competitions Entities for YOOtheme Design

Date: 2026-09-26
Status: Approved

## Goal

Extend the existing xdecaro YOOtheme Competitions integration with public, reusable elements for federations, teams, players and competition rosters while keeping Competitions as the sole owner of its domain data.

## Platform constraints

- Joomla 6.1.3 and later only.
- Vendor name remains lowercase `xdecaro`.
- The YOOtheme addon must consume the public Competitions service; it must not query `#__xdecarocompetitions_*`, People private tables, or Organizations private tables directly.
- Competitions remains the authoritative owner of competition, team, federation, player and roster presentation data.
- Public presentation surfaces must not expose sensitive/private People or competition-review data.
- Existing Competition Card, Match Score and Standings Table remain compatible.

## Chosen architecture

Use two explicit layers:

1. `com_xdecarocompetitions` extends `PublicBuilderDataService` with a small read-only public contract for federations, teams and approved roster data.
2. `addons-for-yootheme-pro` extends `CompetitionProvider` as a thin adapter and adds dedicated YOOtheme elements.

Rejected alternatives:

- Direct SQL from the YOOtheme addon: rejected because it couples the addon to private Competitions schema and bypasses the public boundary.
- One large multi-mode YOOtheme element: rejected because configuration becomes difficult and mixes unrelated presentation responsibilities.

## Public navigation model

Primary relationship:

`Competition -> Team -> Roster -> Player`

Federation relationship:

`Country -> Federation -> Team`

YOOtheme selection should follow these relationships so editors are never forced to know technical IDs.

## First implementation block

### Federation Card

Selection: Federation.

Public fields:
- id
- country_id
- country_name when available
- country_code when available
- name
- short_name
- logo
- website

No private Organizations fields are exposed.

### Team Card

Selection: Competition, then Team filtered to approved participating teams of that competition.

Public fields:
- id
- name
- short_name
- alias
- logo
- country_code
- city
- federation_id
- federation_name
- federation_short_name
- participation_status when selected in a competition context

### Teams Grid

Selection: Competition.

Data source: approved participating teams for the selected competition/season.

Presentation:
- responsive grid
- logo
- team name/short name
- country
- optional federation
- no mandatory horizontal scrolling on mobile

### Player Card

Selection chain: Competition -> Team -> approved roster player.

Public fields may include only:
- roster_id
- player_id
- first_name
- last_name
- display_name
- nationality_code
- shirt_number
- role
- public roster photo
- team_id
- team_name
- season_id

Explicitly excluded from the public YOOtheme contract:
- birth date
- external reference/card identifiers
- person UUID/internal People identifiers
- approval/review notes
- medical/ISCD information
- private People profile data

### Team Roster

Selection chain: Competition -> Team.

Only published/approved roster entries are returned.

Modes:
- Grid: photo-oriented player cards.
- List: compact roster rows.

Public row fields are the same safe subset defined for Player Card.

## Public Competitions service additions

The exact implementation may use these public methods or equivalent names fixed by the implementation plan:

- `getFederation(int $federationId): ?array`
- `getTeams(?int $federationId = null, int $limit = 250): array`
- `getFederationTeams(int $federationId, int $limit = 250): array`
- `getRoster(int $seasonId, int $teamId, bool $approvedOnly = true): array`
- `getRosterPlayer(int $rosterId): ?array`

The public service may query only Competitions-owned tables. Any future enrichment from People or Organizations must go through their public contracts and is out of scope for this block.

## Approval and publication rules

Public output must fail closed:

- unpublished teams are not returned;
- unapproved teams are not returned where approval applies;
- unpublished participations are not returned;
- non-approved participations are excluded by default;
- unpublished roster rows are not returned;
- non-approved roster rows are excluded from public roster output;
- rejected/pending player approval must not leak into frontend output unless a future explicit public rule says otherwise.

## YOOtheme provider additions

`modules/competitions/src/CompetitionProvider.php` remains the only adapter between the addon and Competitions public service.

Add cached option/catalog helpers for:
- federation options
- team options scoped by season/competition
- roster-player options scoped by season + team

The adapter must degrade gracefully to empty options when Competitions is unavailable or when a method is unavailable.

## YOOtheme element behavior

All new elements must:
- support direct selection from real available entities;
- retain YOOtheme dynamic-source override capability where appropriate;
- avoid exposing raw numeric IDs in the normal editor UI;
- include local valid monochrome SVG icons;
- work on mobile without mandatory horizontal overflow;
- escape textual output and sanitize URLs/media consistently with existing addon patterns.

## Styling

Use existing YOOtheme/UIkit patterns and the addon’s established visual language.

Do not create a second generic design system. Element-specific CSS is allowed only where needed for team/player grids, roster layout, logos/photos and responsive presentation.

## Accessibility

- Images require useful alt semantics.
- Essential information cannot be icon-only.
- Grid and list layouts must remain readable with enlarged text.
- Player/team selection labels must be human-readable.
- No interaction may require pointer precision only.

## Versioning

The currently tested addon build is `1.6.0-beta2`.

Any changed package from this work must use a new version (at least `1.6.0-beta3`); never reuse `1.6.0-beta2` with different contents.

If the Competitions public API must be changed, its version must also advance according to that repository’s SemVer/release policy; never reuse an already published Competitions version.

## Tests

Competitions must add contract tests proving:
- the new public methods exist;
- public roster queries require published/approved records;
- sensitive player fields are absent from returned public row contracts;
- the service does not query People/Organizations private tables.

The YOOtheme addon must add tests proving:
- provider methods call only the public Competitions service;
- option lists are human-readable and correctly scoped;
- Federation Card, Team Card, Teams Grid, Player Card and Team Roster are registered;
- all five elements include valid packaged SVG icons;
- Player Card/Team Roster do not expose sensitive fields in element schemas or templates;
- package build includes every new element file and icon.

## Out of scope for this block

- Match List
- Results List
- Tournament Card
- Season/Edition Card
- new ranking/coefficient elements
- standings/scoring engine changes
- People profile editing
- roster approval workflow changes
- new biometric/medical/ISCD presentation

These can be a following block after federation/team/player/roster integration is stable.

## Success criteria

The feature is successful when a YOOtheme editor can:

1. choose a competition from a real list;
2. see only participating approved teams for that competition;
3. choose a team;
4. render a Team Card or Teams Grid;
5. see only approved public roster players for that competition/team;
6. choose one roster player for Player Card or render the complete Team Roster;
7. choose and render a Federation Card;
8. do all of the above without entering technical IDs and without the addon reading private component tables.