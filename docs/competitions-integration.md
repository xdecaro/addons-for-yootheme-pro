# Competitions integration for YOOtheme Pro

## Goal

Expose public data from `com_xdecarocompetitions` to YOOtheme Pro as native Dynamic Content sources, while keeping Competitions independent from YOOtheme Pro and keeping Essential Addons independent when Competitions is not installed.

The integration must support the DCL site on Joomla 6.1.3 and must not duplicate competition-domain data inside Essential Addons.

## Architecture

```text
com_xdecarocompetitions
  └─ public read-only data service
       └─ stable arrays/DTO-like objects
            ↓
plg_system_xdecaro (Essential Addons for YOOtheme Pro)
  ├─ detects Competitions safely
  ├─ registers YOOtheme `source.init`
  ├─ exposes GraphQL object/query types
  └─ optional specialized Builder elements
            ↓
YOOtheme Pro Builder
```

Competitions must not import or depend on YOOtheme classes. Essential Addons may depend optionally on the public Competitions service, but absence of Competitions must never break YOOtheme or Joomla.

## Domain mapping

The current Competitions schema distinguishes:

- `tournaments`: persistent competition families/types such as Football Men, Futsal Men, Futsal Women and U21 Futsal;
- `seasons`: dated editions of a tournament, including year, host city/country and start/end dates;
- `participations`: team participation in a season;
- `teams`: clubs/teams;
- `matches` and `match_events`: fixtures, results and timeline data;
- coefficient/standing data;
- countries and federations.

For Builder terminology, a **Competition** means a season/edition enriched with its parent tournament. This avoids showing an abstract tournament without its current edition.

## Initial public Dynamic Content sources

Group all sources under `XDECARO / Competitions`.

### Competition sources

- Current Competitions
- Upcoming Competitions
- Previous Competitions
- Competitions by Year
- Competitions by Tournament

Each Competition object should expose only public fields that exist or can be safely derived from existing data:

- `season_id`
- `tournament_id`
- `title` (derived display title, e.g. tournament name + season year/name)
- `tournament_name`
- `tournament_code`
- `discipline`
- `gender`
- `season_name`
- `season_year`
- `host_city`
- `host_country_code`
- `start_date`
- `end_date`
- `temporal_status` (`current`, `upcoming`, `past`) derived from dates
- `team_count` from approved/active participations

Do not invent a public URL until Competitions has a stable frontend route. Specialized elements may provide a manual link override until then.

### Team sources

- Participating Teams by season
- Team by ID

Public fields:

- `id`
- `name`
- `short_name`
- `alias`
- `logo`
- `country_code`
- `city`
- `federation_id`
- `federation_name`
- `federation_short_name`

Only published/active teams and approved public participation data should be returned by default.

### Match sources

- Upcoming Matches
- Latest Results
- Matches by Season
- Matches by Team

Public fields should be based on the real matches table in the implementation branch. At minimum expose identifiers, date/time, season, home/away team, score when available, match status and venue when available. Do not fabricate fields that are absent from the installed schema.

### Standing/ranking sources

- Standings by Season
- Rankings/Coefficients where a stable public dataset already exists

The first implementation must inspect current competition models/services and use their existing scoring/standing rules rather than reimplementing standings inside Essential Addons.

### Calendar sources

- Upcoming Seasons
- Seasons in year range

This source is intended for the DCL 3–5 year Calendar. It is not the same as a current-season Events component.

### Geographic sources

- Countries
- Federations

Expose only published/active records.

## Initial specialized elements for Essential Addons 1.6.0

Dynamic sources remain the primary integration. Add custom elements only where native Grid/Panel/Text elements are not sufficient.

1. `Competition Card`
   - consumes a Competition object or manual season ID;
   - shows tournament/edition title, season/year, host and optional status;
   - optional manual link override;
   - uses YOOtheme classes and current Style, not hard-coded DCL colors.

2. `Match Score`
   - consumes a Match object or manual match ID;
   - home/away names and logos;
   - score/status/date;
   - responsive and accessible output.

3. `Standings Table`
   - consumes a season/standings source;
   - semantic table on desktop;
   - controlled responsive behavior on small screens;
   - no duplicated scoring logic.

Future elements (not required for 1.6.0): Team Card, Team Roster, Season Calendar, Match Timeline, Competition Hero, Bracket.

## YOOtheme integration rules

- Register sources through the official `source.init` event.
- Use serializable resolver callables; no closures in cached GraphQL schema definitions.
- Use snake_case field names and UpperCamelCase type names.
- Keep source registration in a dedicated module under `modules/`.
- Existing Builder elements continue to be registered by the current addon module.
- If Competitions is missing or incompatible, omit Competitions sources/elements cleanly and do not throw a fatal error.
- Do not query private People data directly from Essential Addons.

## Performance

- No N+1 queries for teams, federations or standings.
- Public provider methods must support limits and filters.
- Dynamic source resolvers should query only when invoked.
- Prefer bulk joins/lookup maps over per-row database queries.
- YOOtheme schema generation must not require live result datasets; type registration must remain cheap.

## Security and privacy

- Read-only integration only.
- No state-changing mutations.
- Respect `state`, approval/publication status and existing public-domain rules.
- Do not expose review notes, rejection reasons, user IDs, private emails/phones, medical data, membership/card data, internal approval metadata or People-private fields.
- Escape output in custom element templates.

## Graceful degradation

- YOOtheme absent: Essential Addons already does not load YOOtheme modules; preserve this behavior.
- Competitions absent: all existing Essential Addons remain available; Competitions-specific module stays dormant.
- Competitions installed but schema/API incompatible: omit the source and show no frontend fatal error; diagnostics may be logged in administrator/development context.

## Versioning

Essential Addons current repository manifest is 1.5.7. The Dynamic Content capability plus Competitions integration is a feature release and targets **1.6.0**.

Do not reuse a version already released. Update manifest, changelog, README and release/update metadata coherently only after implementation and verification.

The current GitHub `xdecaro/competitions` main branch reports VERSION 1.5.23. Before changing its version, reconcile that branch with any newer installed/test package so no newer local version is overwritten or reused.

## Acceptance criteria

The feature is accepted when:

- YOOtheme Builder lists the new `XDECARO / Competitions` sources;
- a normal YOOtheme Grid can render Current Competitions dynamically without hard-coded four cards;
- changing published/current season data changes the Builder output without editing the layout;
- Latest Results and Upcoming Matches can render from real Competitions data;
- Calendar can query a configurable future year range;
- missing Competitions produces no fatal error;
- no private fields are exposed;
- package build/validation succeeds;
- Joomla 6.1.3 + PHP 8.3 smoke test succeeds on desktop, tablet and smartphone.
