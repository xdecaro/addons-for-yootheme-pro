# Competitions Federation Team Player Roster Elements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Federation Card, Team Card, Teams Grid, Player Card and Team Roster to the xdecaro YOOtheme Competitions module using only the public Competitions data service.

**Architecture:** `CompetitionProvider` remains a thin cached adapter over `com_xdecarocompetitions` public methods. New element definitions use human-readable scoped selectors and UIkit-based responsive templates; no addon SQL and no private People/Organizations access.

**Tech Stack:** Joomla 6.1.3+, YOOtheme Pro custom elements/content sources, PHP 8.2+, UIkit, existing addon build/test tooling.

**Spec:** `docs/superpowers/specs/2026-09-26-competitions-entities-yootheme-design.md`

## Global Constraints

- Joomla 6.1.3 and later only.
- Vendor remains lowercase `xdecaro`.
- Addon never queries Competitions, People or Organizations private tables directly.
- Sensitive player/review/medical fields are not present in element fields, templates or provider output.
- Existing Competition Card, Match Score and Standings Table behavior remains compatible.
- `1.6.0-beta2` was already built; the next test package is `1.6.0-beta3` or later and beta2 is never reused.

## Review Focus

- Forged scoped selection values must not allow rendering a team/player outside the encoded competition/team context.
- Competitions unavailable or older public API must render empty/fallback UI, not fatal errors.
- Empty logos/photos must produce usable text/card output with correct alt behavior.
- Large option catalogs must be cached per request so repeated element definitions do not repeatedly hit the component service.
- Mobile Team Roster list/grid must not require horizontal scrolling for core content.

---

### Task 1: Extend CompetitionProvider with safe scoped selectors

**Files:**
- Modify: `modules/competitions/src/CompetitionProvider.php`
- Modify: `tests/competitions-elements-builder-contract.php`

**Interfaces:**
- Consumes from Competitions: `getFederation()`, `getFederations()`, `getParticipatingTeams()`, `getRoster()`, `getRosterPlayer()` plus existing competition methods.
- Produces provider helpers for element definitions/templates.

Required provider methods:

```php
public static function federationOptions(): array
public static function federationById(int $federationId): ?array
public static function competitionTeamOptions(): array
public static function teamBySelection(string $selection): ?array
public static function competitionRosterPlayerOptions(): array
public static function rosterPlayerBySelection(string $selection): ?array
public static function rosterBySelection(string $selection): array
```

Selection formats:

```text
team selection:   <seasonId>:<teamId>
player selection: <seasonId>:<teamId>:<rosterId>
```

- [ ] **Step 1: Write failing provider contract assertions**

Assert all required methods exist, no private SQL/table names appear in `CompetitionProvider.php`, and selection parsers reject malformed/zero/negative IDs.

- [ ] **Step 2: Run contract and confirm RED**

Run: `php tests/competitions-elements-builder-contract.php`

Expected: FAIL on missing provider helpers.

- [ ] **Step 3: Implement federation options/cache**

`federationOptions()` returns `Choose federation…` plus human-readable federation labels; `federationById()` calls only the public service and returns null safely if unavailable.

- [ ] **Step 4: Implement scoped team options/cache**

Build labels from the existing competition catalog and approved participating teams, e.g. `DCL Futsal Men 2026 — WOLVES Y.M.`. Cache the generated catalog in static request state.

`teamBySelection()` must parse `seasonId:teamId` and validate that `teamId` is present in `getParticipatingTeams(seasonId, true)` before returning it.

- [ ] **Step 5: Implement scoped roster-player options/cache**

For each cached valid competition/team selection, call `getRoster(seasonId, teamId, true)` once and cache the rows. Build labels like `DCL Futsal Men 2026 — WOLVES Y.M. — 10 · First Last` when shirt number exists.

`rosterPlayerBySelection()` must verify returned `season_id` and `team_id` match the encoded selection. `rosterBySelection()` returns only the validated scoped roster.

- [ ] **Step 6: Run contract and lint**

Run:

```bash
php tests/competitions-elements-builder-contract.php
php -l modules/competitions/src/CompetitionProvider.php
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add modules/competitions/src/CompetitionProvider.php tests/competitions-elements-builder-contract.php
git commit -m "feat: add scoped competition entity selectors"
```

### Task 2: Add Federation Card

**Files:**
- Create: `modules/competitions/elements/federation-card/element.php`
- Create: `modules/competitions/elements/federation-card/templates/content.php`
- Create: `modules/competitions/elements/federation-card/templates/template.php`
- Create: `modules/competitions/elements/federation-card/images/icon.svg`
- Create: `modules/competitions/elements/federation-card/images/iconSmall.svg`
- Modify: `tests/competitions-elements-builder-contract.php`

**Interfaces:**
- Consumes: `CompetitionProvider::federationOptions()` and `federationById()`.
- Produces: YOOtheme element `xdecaro_federation_card`.

- [ ] **Step 1: Add failing element contract**

Assert element name/title/group, direct federation select, two local SVG icon paths, and no sensitive/private fields.

- [ ] **Step 2: Run and confirm RED**

Run: `php tests/competitions-elements-builder-contract.php`

- [ ] **Step 3: Implement element definition**

Normal Content fields: selected federation, optional link override. Overrides remain dynamic-source capable for name, short name, country label, logo and website.

- [ ] **Step 4: Implement accessible UIkit template**

Render logo when present, readable federation name/short name/country, optional website/link. Escape text and URLs using the same patterns as existing Competition elements.

- [ ] **Step 5: Add monochrome SVG icons**

Use local vector artwork suitable for YOOtheme’s element library; no external assets.

- [ ] **Step 6: Run contract/lint and commit**

Expected: PASS.

### Task 3: Add Team Card and Teams Grid

**Files:**
- Create: `modules/competitions/elements/team-card/...`
- Create: `modules/competitions/elements/teams-grid/...`
- Modify: `tests/competitions-elements-builder-contract.php`

**Interfaces:**
- Consumes: `competitionTeamOptions()`, `teamBySelection()`, existing `competitionOptions()` and `participatingTeams()`.
- Produces: `xdecaro_team_card`, `xdecaro_teams_grid`.

- [ ] **Step 1: Add failing contracts for both elements**

Team Card requires one human-readable `Competition — Team` selector. Teams Grid requires Competition selector and approved participating teams only. Assert icons/templates exist.

- [ ] **Step 2: Run and confirm RED**

- [ ] **Step 3: Implement Team Card**

Render logo, name, short name, country, city and optional federation. Do not display approval/status internals unless explicitly mapped as an override.

- [ ] **Step 4: Implement Teams Grid**

Use responsive UIkit grid classes; normal mobile view must collapse without a table or horizontal scroll. Allow toggles for short name, country and federation.

- [ ] **Step 5: Add four SVG icons and run lint/contracts**

- [ ] **Step 6: Commit**

```bash
git add modules/competitions/elements/team-card modules/competitions/elements/teams-grid tests/competitions-elements-builder-contract.php
git commit -m "feat: add team card and teams grid"
```

### Task 4: Add Player Card with privacy guard

**Files:**
- Create: `modules/competitions/elements/player-card/...`
- Modify: `tests/competitions-elements-builder-contract.php`

**Interfaces:**
- Consumes: `competitionRosterPlayerOptions()` and `rosterPlayerBySelection()`.
- Produces: `xdecaro_player_card`.

Allowed content fields only:

```text
display_name
first_name
last_name
nationality_code
shirt_number
role
photo
team_name
```

- [ ] **Step 1: Add failing privacy/element contract**

Assert forbidden names do not occur in Player Card definition/templates: `birth_date`, `external_ref`, `person_uuid`, `review_note`, `iscd`, `medical`.

- [ ] **Step 2: Run and confirm RED**

- [ ] **Step 3: Implement Player Card element and template**

Use the scoped `Competition — Team — Player` selector. Prefer roster photo; render a neutral text/photo placeholder when absent. Preserve dynamic override support only for allowed public fields.

- [ ] **Step 4: Add two SVG icons and run contracts/lint**

- [ ] **Step 5: Commit**

### Task 5: Add Team Roster grid/list element

**Files:**
- Create: `modules/competitions/elements/team-roster/...`
- Modify: `tests/competitions-elements-builder-contract.php`

**Interfaces:**
- Consumes: `competitionTeamOptions()` and `rosterBySelection()`.
- Produces: `xdecaro_team_roster` with `grid` and `list` modes.

- [ ] **Step 1: Add failing roster element/privacy contract**

Assert scoped competition/team selector, `grid|list` mode, icons, and absence of forbidden sensitive field names.

- [ ] **Step 2: Run and confirm RED**

- [ ] **Step 3: Implement Grid mode**

Use UIkit responsive cards with photo, shirt number, display name, role and nationality when available.

- [ ] **Step 4: Implement List mode**

Use stacked/flex rows rather than a mandatory table so mobile never requires horizontal scrolling for core roster data.

- [ ] **Step 5: Add two SVG icons and run contracts/lint**

- [ ] **Step 6: Commit**

### Task 6: Package contract, beta3 artifact and full verification

**Files:**
- Modify: `.github/workflows/test-package-artifact.yml`
- Modify: `tests/competitions-elements-builder-contract.php`
- Modify: `docs/competitions-integration.md`
- Modify: `README.md` if needed for module availability.

**Interfaces:**
- Consumes: all five new elements and provider helpers.
- Produces: verified `1.6.0-beta3` test ZIP containing every new file/icon.

- [ ] **Step 1: Extend package-content contract**

Assert the built archive contains `element.php`, templates, `icon.svg` and `iconSmall.svg` for:

```text
federation-card
team-card
teams-grid
player-card
team-roster
```

- [ ] **Step 2: Change the test artifact workflow from beta2 to beta3**

Do not change the stable `1.5.7` source manifest as part of a test artifact unless a stable release is explicitly prepared. The workflow-stage manifest must use `1.6.0-beta3`.

- [ ] **Step 3: Run complete local-equivalent verification**

Run:

```bash
php tests/competitions-source-contract.php
php tests/competitions-dynamic-sources-contract.php
php tests/competitions-elements-builder-contract.php
find . -type f -name '*.php' -not -path './.git/*' -print0 | xargs -0 -n1 php -l
python3 tools/build.py --check
```

Expected: all PASS.

- [ ] **Step 4: Build beta3 ZIP and inspect real archive contents**

Run the same staging/build commands as the workflow with `1.6.0-beta3`, then `unzip -t` and explicit `unzip -l` checks for all ten new icon files.

- [ ] **Step 5: Push and require green GitHub CI**

Do not claim completion until the branch workflow is green and the beta3 artifact exists.

- [ ] **Step 6: Manual Joomla/YOOtheme verification**

On Joomla 6.1.3+, verify in Builder:
- all five new elements appear with valid icons;
- Federation selector is populated;
- Team/Player/Roster scoped options are readable and do not expose IDs;
- Teams Grid and Team Roster are usable on mobile;
- missing Competitions API fails gracefully.
