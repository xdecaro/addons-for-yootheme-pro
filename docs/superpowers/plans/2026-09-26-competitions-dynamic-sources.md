# Competitions Dynamic Sources 1.6.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Release Essential Addons for YOOtheme Pro 1.6.0 with native Dynamic Content sources for Xdecaro Competitions plus the first three specialized Builder elements: Competition Card, Match Score and Standings Table.

**Architecture:** Add a separate `modules/competitions/` YOOtheme module. It activates only when the public `PublicBuilderDataService` from `com_xdecarocompetitions` is available, registers GraphQL types/query fields on YOOtheme's official `source.init` event, and registers Competitions-specific Builder elements. Existing `modules/addons/` elements remain untouched except shared asset registration where truly necessary.

**Tech Stack:** Joomla 6.1.3 target runtime, PHP 8.3 target runtime, YOOtheme Pro module API, YOOtheme Builder Source/GraphQL API, UIkit/YOOtheme styling, existing Essential Addons packaging pipeline.

**Spec:** `docs/competitions-integration.md`

## Global Constraints

- Current Essential Addons manifest version is 1.5.7; feature target is 1.6.0.
- Competitions is optional. Missing/incompatible Competitions must not break Joomla, YOOtheme or existing addons.
- Do not query Competitions tables directly in Essential Addons once the public Competitions service exists.
- Dynamic sources are primary; custom elements are only for UI structures that native Grid/Panel/Text cannot model well.
- Register sources through YOOtheme `source.init` using serializable static resolver callables; no closures in GraphQL schema definitions.
- Use snake_case GraphQL field names and UpperCamelCase object type names.
- No hard-coded DCL colors; custom elements inherit YOOtheme/UIkit Style.
- No private People data or internal approval/review metadata.
- No frontend URL is fabricated if Competitions has no stable public route; Competition Card uses an optional manual link override.

## Review Focus

- Competitions absent: module must stay dormant and all existing XDECARO elements must still load.
- YOOtheme schema cache: source configuration and resolver callables must be serializable and survive cached schema generation.
- Empty queries: zero competitions/matches/standings must render empty safely, not warnings/fatals.
- Large datasets: list sources require bounded limits and must not create N+1 calls through the provider.
- Builder/frontend parity: preview and rendered site must resolve the same fields and specialized elements must remain responsive.

---

### Task 1: Add conditional Competitions module bootstrap

**Files:**
- Create: `modules/competitions/bootstrap.php`
- Create: `modules/competitions/src/Availability.php`
- Create: `tests/competitions-module-contract.php`
- Modify: `.github/workflows/validate.yml`

**Interfaces:**
- Consumes: existing plugin loader in `xdecaro.php`, which already loads `modules/*/bootstrap.php`.
- Produces:
  - `XdecaroCompetitionsAvailability::isAvailable(): bool`
  - conditional YOOtheme module registration without a hard dependency.

- [ ] **Step 1: Write failing module contract**

Create `tests/competitions-module-contract.php` asserting that `modules/competitions/bootstrap.php` and `Availability.php` exist, the bootstrap references no raw `#__xdecarocompetitions_` table names, and availability checks for the public Competitions service class without instantiating it during schema registration.

- [ ] **Step 2: Add contract tests to CI**

Modify `.github/workflows/validate.yml` to run each `tests/*.php` file after PHP syntax and before package build. The command must fail the job on the first failing contract.

- [ ] **Step 3: Run CI-equivalent validation and confirm failure**

Run:

```bash
find . -type f -name '*.php' -not -path './.git/*' -print0 | xargs -0 -n1 php -l
for test in tests/*.php; do php "$test" || exit 1; done
```

Expected: contract FAIL because module files do not exist.

- [ ] **Step 4: Implement Availability and bootstrap skeleton**

`Availability::isAvailable()` checks only for the public service class (and, if needed, Joomla component extension enablement through a safe Joomla API). `bootstrap.php` returns no Competitions events/extensions when unavailable. Do not query data here.

- [ ] **Step 5: Run syntax + tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add modules/competitions .github/workflows/validate.yml tests/competitions-module-contract.php
git commit -m "feat: add optional Competitions YOOtheme module"
```

### Task 2: Add provider adapter for the public Competitions service

**Files:**
- Create: `modules/competitions/src/CompetitionProvider.php`
- Modify: `tests/competitions-module-contract.php`

**Interfaces:**
- Consumes: `Xdecaro\Component\Competitions\Administrator\Service\PublicBuilderDataService` (use the real namespace from the Competitions implementation branch; do not guess if it differs) and Joomla `DatabaseInterface`.
- Produces static resolver-facing methods:
  - `currentCompetitions(array $args): array`
  - `upcomingCompetitions(array $args): array`
  - `previousCompetitions(array $args): array`
  - `competitionsByYear(array $args): array`
  - `competitionsByTournament(array $args): array`
  - `upcomingSeasons(array $args): array`
  - `participatingTeams(array $args): array`
  - `team(array $args): ?array`
  - `upcomingMatches(array $args): array`
  - `latestResults(array $args): array`
  - `matchesBySeason(array $args): array`
  - `match(array $args): ?array`
  - `standings(array $args): array`
  - `rankings(array $args): array`
  - `countries(array $args): array`
  - `federations(array $args): array`

- [ ] **Step 1: Extend failing contract**

Assert the provider exposes the exact resolver-facing methods and contains no SQL table literals.

- [ ] **Step 2: Run contract and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement provider construction internally**

Resolve Joomla `DatabaseInterface` from the container only when a resolver method is invoked, instantiate the public Competitions service, normalize/clamp numeric arguments, then delegate. Keep provider methods small and read-only.

- [ ] **Step 4: Add argument safety assertions**

Contract must pin positive integer clamping for limits and reject/normalize invalid IDs/years without SQL or fatal errors.

- [ ] **Step 5: Run syntax + tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add modules/competitions/src/CompetitionProvider.php tests/competitions-module-contract.php
git commit -m "feat: add Competitions data provider adapter"
```

### Task 3: Register GraphQL object types

**Files:**
- Create: `modules/competitions/src/Type/CompetitionType.php`
- Create: `modules/competitions/src/Type/TeamType.php`
- Create: `modules/competitions/src/Type/MatchType.php`
- Create: `modules/competitions/src/Type/StandingType.php`
- Create: `modules/competitions/src/Type/CountryType.php`
- Create: `modules/competitions/src/Type/FederationType.php`
- Create: `tests/competitions-source-contract.php`

**Interfaces:**
- Produces YOOtheme object type configs named:
  - `XdecaroCompetition`
  - `XdecaroCompetitionTeam`
  - `XdecaroCompetitionMatch`
  - `XdecaroCompetitionStanding`
  - `XdecaroCompetitionCountry`
  - `XdecaroCompetitionFederation`

- [ ] **Step 1: Write failing source contract**

Assert all type files exist, each exposes `public static function config(): array`, type names are UpperCamelCase at registration time, field keys are snake_case, and no resolver closure is present.

- [ ] **Step 2: Run contract and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement CompetitionType**

Expose the public spec fields: `season_id`, `tournament_id`, `title`, `tournament_name`, `tournament_code`, `discipline`, `gender`, `season_name`, `season_year`, `host_city`, `host_country_code`, `start_date`, `end_date`, `temporal_status`, `team_count`.

- [ ] **Step 4: Implement Team/Country/Federation types**

Expose only public keys from the spec. Do not add email/phone/review/internal IDs beyond public entity IDs.

- [ ] **Step 5: Implement Match/Standing types from the actual public service contracts**

Read the implemented Competitions service output first. Do not invent match or standing field names in Essential Addons.

- [ ] **Step 6: Run syntax + tests**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add modules/competitions/src/Type tests/competitions-source-contract.php
git commit -m "feat: define Competitions dynamic content types"
```

### Task 4: Register Dynamic Content query fields via `source.init`

**Files:**
- Create: `modules/competitions/src/SourceListener.php`
- Create: `modules/competitions/src/Type/CompetitionQueryType.php`
- Modify: `modules/competitions/bootstrap.php`
- Modify: `tests/competitions-source-contract.php`

**Interfaces:**
- `XdecaroCompetitionsSourceListener::initSource(YOOtheme\Builder\Source $source): void`
- Query metadata group: `XDECARO / Competitions`.
- Query fields:
  - `xdecaro_current_competitions`
  - `xdecaro_upcoming_competitions`
  - `xdecaro_previous_competitions`
  - `xdecaro_competitions_by_year`
  - `xdecaro_competitions_by_tournament`
  - `xdecaro_upcoming_seasons`
  - `xdecaro_participating_teams`
  - `xdecaro_team`
  - `xdecaro_upcoming_matches`
  - `xdecaro_latest_results`
  - `xdecaro_matches_by_season`
  - `xdecaro_match`
  - `xdecaro_standings`
  - `xdecaro_rankings`
  - `xdecaro_countries`
  - `xdecaro_federations`

- [ ] **Step 1: Extend the source contract with all query field names**

Assert `source.init` is registered only in the Competitions module when availability passes and each query uses a static callable into `CompetitionProvider`.

- [ ] **Step 2: Run contract and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement SourceListener registration**

Register all six object types with `Source::objectType()` and merge query config with `Source::queryType()`.

- [ ] **Step 4: Implement query metadata and args**

Provide Builder controls for relevant IDs, year ranges, approved-only flag where supported and bounded limit. Use user-facing labels such as `Current Competitions`, `Upcoming Matches`, `Latest Results` and group `XDECARO / Competitions`.

- [ ] **Step 5: Verify schema serialization constraints**

Inspect every type/query config and confirm there are no closures or unserializable service instances captured in config arrays.

- [ ] **Step 6: Run syntax + tests**

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add modules/competitions/bootstrap.php modules/competitions/src/SourceListener.php modules/competitions/src/Type/CompetitionQueryType.php tests/competitions-source-contract.php
git commit -m "feat: register Competitions dynamic sources"
```

### Task 5: Add Competition Card element

**Files:**
- Create: `modules/competitions/elements/competition-card/element.php`
- Create: `modules/competitions/elements/competition-card/templates/template.php`
- Create: `modules/competitions/elements/competition-card/templates/content.php`
- Create: `modules/competitions/elements/competition-card/images/icon.svg`
- Create: `modules/competitions/elements/competition-card/images/iconSmall.svg`
- Modify: `modules/competitions/bootstrap.php`
- Create: `tests/competitions-elements-contract.php`

**Interfaces:**
- Builder element name: `xdecaro_competition_card`.
- Group: `xdecaro`.
- Inputs: Dynamic Content-mappable fields for title, meta/year, host, status, optional image/logo if supplied later, and `link_override`.

- [ ] **Step 1: Write failing element contract**

Assert files, element name/group, dynamic-content-capable field definitions, optional manual link override and absence of hard-coded DCL hex colors.

- [ ] **Step 2: Run contract and verify failure**

Expected: FAIL.

- [ ] **Step 3: Register the Competitions element path conditionally**

In `modules/competitions/bootstrap.php`, extend `YOOtheme\Builder` with `modules/competitions/elements/*/element.php` only when Competitions is available.

- [ ] **Step 4: Implement element + templates**

Use UIkit/YOOtheme classes, semantic heading/text, optional status label and optional link. Escape output. If no link override is supplied, render non-clickable content instead of fabricating a route.

- [ ] **Step 5: Run syntax + tests**

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add modules/competitions/elements/competition-card modules/competitions/bootstrap.php tests/competitions-elements-contract.php
git commit -m "feat: add Competition Card element"
```

### Task 6: Add Match Score element

**Files:**
- Create: `modules/competitions/elements/match-score/element.php`
- Create: `modules/competitions/elements/match-score/templates/template.php`
- Create: `modules/competitions/elements/match-score/templates/content.php`
- Create: `modules/competitions/elements/match-score/images/icon.svg`
- Create: `modules/competitions/elements/match-score/images/iconSmall.svg`
- Modify: `tests/competitions-elements-contract.php`

**Interfaces:**
- Builder element name: `xdecaro_match_score`.
- Inputs must map to the actual public Match type from Task 3: home/away display fields, score/status/date and optional logos where available.

- [ ] **Step 1: Extend failing element contract**

Assert element registration, safe escaping, responsive UIkit classes and no duplicated match-status/scoring logic.

- [ ] **Step 2: Run and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement Match Score**

Render score only when present; render scheduled/status state without fake `0-0`. Keep team names accessible if logos are missing.

- [ ] **Step 4: Run syntax + tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add modules/competitions/elements/match-score tests/competitions-elements-contract.php
git commit -m "feat: add Match Score element"
```

### Task 7: Add Standings Table element

**Files:**
- Create: `modules/competitions/elements/standings-table/element.php`
- Create: `modules/competitions/elements/standings-table/templates/template.php`
- Create: `modules/competitions/elements/standings-table/templates/content.php`
- Create: `modules/competitions/elements/standings-table/images/icon.svg`
- Create: `modules/competitions/elements/standings-table/images/iconSmall.svg`
- Modify: `tests/competitions-elements-contract.php`

**Interfaces:**
- Builder element name: `xdecaro_standings_table`.
- Consumes repeated Standing objects from the Dynamic Content source.

- [ ] **Step 1: Extend failing element contract**

Assert semantic `<table>` usage, headers associated with cells, no scoring formulas, no fixed DCL colors and a responsive container/behavior.

- [ ] **Step 2: Run and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement desktop and small-screen rendering**

Use the actual public Standing field set. Preserve numeric alignment. On small screens use controlled overflow or a compact semantic representation; do not hide critical points/position/team information.

- [ ] **Step 4: Run syntax + tests**

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add modules/competitions/elements/standings-table tests/competitions-elements-contract.php
git commit -m "feat: add Standings Table element"
```

### Task 8: Update docs and release metadata for 1.6.0

**Files:**
- Modify: `README.md`
- Modify: `docs/competitions-integration.md` only if implementation differs from the approved contract
- Modify: `xdecaro.xml`
- Modify: `changelog.xml`
- Modify: `tools/build.py`
- Generated by build: `update.xml`

**Interfaces:**
- Produces: `plg_system_xdecaro_1.6.0.zip` and matching SHA-256/update feed.

- [ ] **Step 1: Update manifest version and description**

Set `xdecaro.xml` version to `1.6.0` and extend description to mention Dynamic Content/Competitions integration without removing existing elements.

- [ ] **Step 2: Add first changelog entry for 1.6.0**

Document Dynamic Content sources and the three new elements.

- [ ] **Step 3: Update README**

Add the new sources/elements, optional Competitions dependency, graceful-degradation behavior and a short DCL example: `Grid → Dynamic Content → XDECARO / Competitions → Current Competitions`.

- [ ] **Step 4: Update `tools/build.py` update-feed description**

Ensure generated update metadata no longer lists only the old five elements.

- [ ] **Step 5: Run validation/build**

Run:

```bash
python3 tools/build.py --check
for test in tests/*.php; do php "$test" || exit 1; done
python3 tools/build.py
unzip -t build/plg_system_xdecaro_1.6.0.zip
```

Expected: all PASS; ZIP exists and contains `modules/competitions/`.

- [ ] **Step 6: Verify generated update.xml**

Assert version `1.6.0`, release URL contains `/v1.6.0/plg_system_xdecaro_1.6.0.zip`, SHA matches `build/SHA256SUMS.txt` and existing Joomla compatibility metadata is not changed as part of this feature unless separately approved.

- [ ] **Step 7: Commit**

```bash
git add README.md docs/competitions-integration.md xdecaro.xml changelog.xml tools/build.py update.xml .github/workflows/validate.yml tests modules/competitions
git commit -m "release: prepare Essential Addons 1.6.0"
```

### Task 9: Real Joomla/YOOtheme verification

**Files:**
- No source changes unless a verified defect is found.

**Interfaces:**
- Produces: evidence that 1.6.0 works on the DCL site before release/tagging.

- [ ] **Step 1: Install upgrade ZIP on Joomla 6.1.3 + PHP 8.3 with Competitions installed**

Expected: existing Form, Forms List, Pagination, Unfold and Footer Copyright remain available.

- [ ] **Step 2: Open YOOtheme Builder Dynamic Content**

Expected: group `XDECARO / Competitions` lists Current/Upcoming/Previous Competitions, calendar/seasons, teams, matches/results, standings/rankings, countries/federations.

- [ ] **Step 3: Rebuild the DCL `CURRENT COMPETITIONS` prototype with native Grid**

Bind Grid repeated content to `Current Competitions`; bind child title/meta fields. Change one real season/current record in Competitions and confirm the Grid updates without editing the Builder layout.

- [ ] **Step 4: Verify Home data blocks**

Render Upcoming Matches, Latest Results and future 3–5 year Calendar using real data; zero-data cases must remain clean.

- [ ] **Step 5: Verify specialized elements**

Check Competition Card, Match Score and Standings Table on desktop, tablet and smartphone. Check keyboard focus and visible text when images/logos are absent.

- [ ] **Step 6: Verify missing-Competitions degradation**

On a test installation without Competitions (or with the component temporarily disabled), verify Joomla/YOOtheme loads and all non-Competitions XDECARO elements remain usable.

- [ ] **Step 7: Inspect logs/console**

Expected: no PHP warnings/fatals, no GraphQL schema errors, no browser console errors, no duplicate assets.

- [ ] **Step 8: Only after all checks pass, tag/release v1.6.0 using the repository's existing release workflow**

Do not publish a release before this verification gate.
