# Competitions integration for YOOtheme Pro

## Goal

Expose public data from `com_xdecarocompetitions` to YOOtheme Pro as native Dynamic Content sources and specialized Builder elements, while keeping Competitions independent from YOOtheme and keeping Essential Addons safe when Competitions is absent.

The integration targets Joomla 6.1.3 and later only. It must not duplicate competition-domain data inside Essential Addons and must never read Competitions, People or Organizations private tables directly.

## Architecture

```text
com_xdecarocompetitions
  └─ PublicBuilderDataService (read-only public contract)
       └─ published/approved presentation-safe arrays
            ↓
plg_system_xdecaro (Essential Addons for YOOtheme Pro)
  ├─ detects Competitions safely
  ├─ CompetitionProvider adapter/cache
  ├─ YOOtheme Dynamic Content sources
  └─ specialized Builder elements
            ↓
YOOtheme Pro Builder
```

Competitions must not import or depend on YOOtheme classes. Essential Addons may consume only the public Competitions service. Missing or older APIs must degrade to empty choices/output rather than causing a Joomla/YOOtheme fatal error.

## Domain mapping

The Competitions model distinguishes tournaments, seasons/editions, participations, teams, players, rosters, matches, standings/rankings, countries and federations. In Builder terminology a **Competition** is a season/edition enriched with its parent tournament.

Primary public navigation:

```text
Competition -> Team -> Roster -> Player
Country -> Federation -> Team
```

## Dynamic Content sources

Sources are grouped under `XDECARO / Competitions` and include competition/season, participating-team, match/result, ranking, calendar, country and federation datasets. They consume only the component public service and do not duplicate scoring or business rules.

Public teams include identifiers, name/short name, alias, logo, country/city and public federation presentation fields. Public match and ranking fields remain based on the real component schema; the addon must never invent missing scores, standings rules or frontend routes.

## Specialized Builder elements

### Existing elements

- **Competition Card** — direct Competition selector plus Dynamic Content overrides.
- **Match Score** — direct Match selector plus Dynamic Content overrides.
- **Standings Table** — direct Competition/Season selector; canonical standings only.

### Entity elements added for 1.6.0-beta3

These elements require **com_xdecarocompetitions 1.5.24 or later**, because that version adds the safe federation/team/roster public API.

- **Federation Card** — choose a real federation; renders public name, short name, country, logo and optional website.
- **Team Card** — choose a human-readable `Competition — Team` entry; the provider validates that the team is an approved participant in that competition before rendering it.
- **Teams Grid** — choose a Competition and render only its published/approved participating teams in a responsive UIkit grid.
- **Player Card** — choose a human-readable `Competition — Team — Player` roster entry. Only presentation-safe roster/player fields are available.
- **Team Roster** — choose `Competition — Team`, then render the approved roster as responsive **Grid** or compact **List**.

The normal Builder UI does not require editors to type technical IDs. Scoped selection values are internal stable strings:

```text
team:   <seasonId>:<teamId>
player: <seasonId>:<teamId>:<rosterId>
```

Every scoped value is revalidated by `CompetitionProvider`; changing the stored value manually must not permit a team/player to be rendered outside its valid competition/team context.

## Public player/roster allowlist

Player Card and Team Roster may consume only:

- `roster_id`
- `player_id`
- `first_name`
- `last_name`
- `display_name`
- `nationality_code`
- `shirt_number`
- `role`
- public roster/player photo
- `team_id`
- `team_name`
- `season_id`

They must not expose birth dates, external/card references, People UUIDs, review notes/rejection reasons, private contacts, membership data, medical information or ISCD information.

## YOOtheme integration rules

- Register sources through the official `source.init` event.
- Use serializable resolver callables; no closures in cached GraphQL schema definitions.
- Keep source registration and provider logic under `modules/competitions`.
- Builder elements consume `CompetitionProvider`; the provider alone adapts the public Competitions service.
- No SQL or private table prefixes in the YOOtheme provider.
- Preserve Dynamic Content overrides where useful.
- All element-library icons are packaged local monochrome SVG files.
- If Competitions or a required method is unavailable, return empty options/output rather than throwing.

## Performance

Catalogs are cached for the current request. Competition/team and roster option builders reuse those caches so repeated element definitions do not repeatedly resolve the same public dataset. The component public service owns joins/filters; the addon does not reimplement them in SQL.

## Responsive design and accessibility

- Use YOOtheme/UIkit patterns rather than a second design system.
- Teams Grid and Team Roster collapse naturally on small screens and do not require a horizontal table for core content.
- Images have useful alt semantics and missing photos/logos retain readable text output.
- Player/Team selector labels are human-readable.
- Essential information is not conveyed by icons alone.

## Security and privacy

- Read-only integration only; no mutations.
- Public data must respect publication and approval status.
- Templates escape textual output and accept only safe URL schemes where links are rendered.
- Essential Addons never queries private People/Organizations tables.
- Sensitive player/review/medical data is excluded from schemas, element fields and templates.

## Graceful degradation

- YOOtheme absent: existing plugin behavior remains unchanged.
- Competitions absent: all unrelated Essential Addons remain available and the Competitions module stays dormant.
- Competitions installed but older than the required public entity API: entity choices resolve empty; no frontend fatal error.

## Versioning

The stable repository manifest remains `1.5.7` while feature testing continues. The current test artifact is **1.6.0-beta3**; beta2 is not reused with changed contents. Stable 1.6.0 metadata/update feeds are changed only when a stable release is explicitly prepared.

The new federation/team/player/roster elements require **Competitions 1.5.24+**. Existing Competition Card, Match Score and Standings Table remain compatible with their existing public contracts.

## Acceptance criteria

The integration is accepted when YOOtheme Builder can select real competitions, federations, approved participating teams and approved roster players without manual IDs; the five new elements render with valid packaged icons; scoped values cannot cross competition/team boundaries; roster/player public surfaces contain no sensitive fields; mobile grid/list output does not require horizontal scrolling; missing/incompatible Competitions fails gracefully; and the real beta3 ZIP passes syntax, contract and archive-content verification on Joomla 6.1.3+.
