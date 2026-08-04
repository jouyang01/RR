# BUILDER SPEC v0.44 — AMENDMENT A

**Read alongside `BUILDER-SPEC-v0.44.md`. Nothing in v0.44 is withdrawn.** This
amendment corrects one factual claim I made in Part 2.5.2, and adds one implementation
requirement to Part 2.5.2 that v0.44 missed. Both were found by reading the Kittens
source in a fresh session, which is the only reason they surfaced.

Build verified this session: the uploaded artifact is **v0.43** — `hexdraulicPlant`,
`arcaneReactor`, `sumpVentilation` and `hexresonance` return **zero matches**, so none
of v0.44 is implemented yet. Everything below applies to the v0.44 build.

---

## A0 — What I got wrong, again, and this time it is in a shipped spec

**v0.44 Part 2.5.2 says: "Kittens has no such multiplier" (a multiplicative science-cap
line). That is false.** Kittens has one, and I asserted otherwise twice — once in the
handoff §2 and once in the spec.

`js/buildings.js:579–580`, inside the Library's `calculateEffects`:

```js
var libraryRatio = game.getEffect("libraryRatio");
effects["scienceMax"] *= (1 + game.bld.get("observatory").on * libraryRatio);
```

`libraryRatio` is fed additively by three workshop upgrades, `0.02` each
(`js/workshop.js:1454, 1471, 1487`):

| Upgrade | libraryRatio | Price |
|---|---|---|
| titaniumMirrors | 0.02 | titanium 15, science 20,000, starchart 20 |
| unobtainiumReflectors | 0.02 | unobtainium 75, science 250,000, starchart 750 |
| eludiumReflectors | 0.02 | eludium 15, science 250,000 |

**Σ = 0.06 per Observatory.** At Kittens' end-of-tree ~25 Observatories the Library term
is multiplied by **×2.50** — each Library carries 625 science-max instead of 250.

So the honest statement is: *Kittens does have a multiplicative science-cap line; it is
worth ×2.5, it applies to the Library term only, and it is gated behind
titanium/unobtainium/eludium* — material tiers beyond anything RR's Era 3 contains.

**This does not withdraw the Part 2.5.2 directive.** For the Era 0–3 window RR is
actually being balanced against, Kittens' Library really is flat 250, so the
30 / 30 / 25 / 13 target stock and the `SCHOLAR_CAPS = { culture: 1, devotion: 1 }`
change both stand exactly as written. What changes is the justification — and it opens
a slot, which is A2.

Two smaller source corrections while I am conceding things:

- **The compendium clamp ceiling is not purely the building cap.**
  `js/workshop.js:2769–2786`: `scienceMaxCap = bld.getEffect("scienceMax") + … +
  bld.getEffect("scienceMaxCompendia")`, and Data Centers contribute `+1000` each to
  that second term. Pre-Data-Center — i.e. all of RR's scope — the handoff's
  simplification is exact, so **RR's implementation is correct and should not be
  touched.** The phrasing in the handoff should be tightened, not the code.
- **The tech ladder is 64 science-costed techs, not 61.** All fourteen landmark prices
  in the handoff re-verify against source: calendar 30, writing 3,600, philosophy
  9,500, steel 12,000, machinery 15,000, theology 20,000, astronomy 28,000, navigation
  35,000, architecture 42,000, physics 50,000, electricity 75,000, biology 85,000,
  industrialization 100,000, electronics 135,000, ai 250,000, exogeophysics 25,000,000.
  **So v0.44's re-priced ladder — Sparks 20,000 = theology, Icathia 135,000 =
  electronics — is confirmed against source.** Build it as specified.

All of Part 1 re-verifies too, from `js/buildings.js`: Magneto `magnetoRatio 0.02`,
`priceRatio 1.25`; Steamworks `magnetoBoostRatio 0.15`, `priceRatio 1.25`; Reactor
`productionRatio 0.05`, **`priceRatio 1.15`**; Mine `mineralsRatio 0.20` @ 1.15;
Quarry `mineralsRatio 0.35` @ 1.15. **Part 1 ships unchanged.**

---

## A1 — Part 2.5.2 is incomplete: three other multipliers sit between the buildings and the knowledge cap

This is the item that will make the Part 2.5.2 pass condition fail if it is not fixed,
and it is the reason I am sending an amendment rather than waiting a round.

Removing Scholarship from `SCHOLAR_CAPS` is necessary but **not sufficient**. In
`computeCaps()` (v0.43, lines 1966–1980) knowledge is still multiplied by three more
things after the Scholarship line:

```js
caps[rs] *= (SCHOLAR_CAPS[rs] ? scholarMult : masonryMult) * champStore;   // 1971
...
var mountainMult = 1 + drakeBonus("mountain", 0.6);
for (var r2 in caps) caps[r2] *= mountainMult;                            // 1977-78
if (leaderIs("poppy")) for (var r3 in caps) caps[r3] *= 1.25;             // 1980
```

Delete `knowledge` from `SCHOLAR_CAPS` and the `SCHOLAR_CAPS[rs] ? … : …` ternary
silently routes knowledge to **`masonryMult`** — which reaches ×22.4 with the full
storage line. That is strictly worse than the ×3.99 we are removing. **This is a live
trap in the spec as written and must be handled explicitly.**

Then, even with that fixed, the residue is:

| Multiplier | Source | Realistic value |
|---|---|---|
| `champStore` | Poppy's Steadfast Keeper, base +8%, grows with training | ×1.08 – ×1.20 |
| `mountainMult` | Mountain Drake, +6%/kill, `limitedDR` cap 0.60 | ×1.00 – ×1.60 |
| Poppy leading | Keeper's Verdict, flat | ×1.25 |
| **Product** | | **×1.08 – ×2.40** |

A player who leads with Poppy and farms Mountain Drakes reaches any knowledge ceiling
with **42% of the buildings** of a player who does neither. The pass condition
"30 Archives / 30 Academies / 25 Observatories / 13 Hexcore Laboratories" would then
measure as low as **13 / 13 / 10 / 5** — the brief missed, and missed in a way that
looks like a pacing problem rather than a cap problem.

### A1.1 — The fix: knowledge takes no storage multiplier at all

Kittens' knowledge ceiling in the Era 0–3 window is `Σ(building scienceMax)` plus the
clamped compendium term and **nothing else**. Match that literally:

```js
// v0.44 A1. Knowledge is Kittens' formula exactly: building sum + clamped compendia.
// It takes NO storage multiplier — not Scholarship, not Masonry, not champStore,
// not Mountain Drakes, not Poppy's lead. Every one of those is a divergence that
// shrinks the number of Archives, Academies, Observatories and Hexcore Laboratories
// the player must build, which is the one thing Jerry asked us to copy exactly.
var CAP_MULT_EXEMPT = { vigor: 1, knowledge: 1 };   // was STORAGE_EXEMPT = { vigor: 1 }
var SCHOLAR_CAPS   = { culture: 1, devotion: 1 };   // knowledge removed

for (var rs in caps) {
  if (CAP_MULT_EXEMPT[rs]) continue;
  caps[rs] *= (SCHOLAR_CAPS[rs] ? scholarMult : masonryMult) * champStore;
}
...
var mountainMult = 1 + drakeBonus("mountain", 0.6);
for (var r2 in caps) { if (CAP_MULT_EXEMPT[r2]) continue; caps[r2] *= mountainMult; }
if (leaderIs("poppy")) for (var r3 in caps) { if (r3 === "knowledge") continue; caps[r3] *= 1.25; }

// compendium term applies afterwards, unchanged — it is already correct:
var buildingKnowledgeCap = caps.knowledge;
caps.knowledge += Math.min(150 * Math.floor(S.res.morellonomicon || 0), buildingKnowledgeCap);
```

Note the deliberate asymmetry: **Renown (`vigor`) stays exempt for the opposite reason**
— it has no Kittens equivalent and is meant to scale freely — while knowledge becomes
exempt because it has an exact Kittens equivalent we are copying. Same keyword, two
different design intents; keep the comment so the next person does not merge them.

**Poppy's Keeper's Verdict description must change.** It currently promises "ALL
storage caps +25%, even Renown, Vigor, Devotion and Culture". Renown is already exempt
in v0.43 and the prose was already wrong; now knowledge leaves too. Generate the string
from `CAP_MULT_EXEMPT` the same way `SCHOLAR_LINE` generates its descriptions — this is
the third time a storage-line tooltip has drifted from the code, and the fix that
worked twice is derivation, not restatement.

### A1.2 — The arithmetic this produces

With knowledge on Kittens' bare formula, and compendia at full stock doubling the
ceiling, required building stock is set by `Σ(building) = tech price ÷ 2`:

| Tech | Price | Σ needed | Stock |
|---|---|---|---|
| Sparks | 20,000 | 10,000 | 20 Archives (5,000) + 10 Academies (5,000) |
| Chemtech | 50,000 | 25,000 | 20 Arch + 20 Acad (15,000) + 10 Obs (10,000) → 30,000 ✓ |
| Icathia | 135,000 | 67,500 | 30 Arch (7,500) + 30 Acad (15,000) + 25 Obs (25,000) + 13 Labs (19,500) = **67,000** |

67,000 against 67,500 needed — the target stock lands within 1%. **The v0.44 table is
arithmetically sound; A1.1 is what makes the game actually reach it.**

---

## A2 — The design slot A0 opens (do NOT build this yet)

Because Kittens *does* have a multiplicative science-cap line, RR is entitled to one —
in the right place, at the right magnitude, at the right tier. The Scholarship line does
not have to die, it has to be rebuilt in Kittens' shape:

- **Applies to the Archive term only**, never to Academies, Observatories or Hexcore
  Laboratories — the multiplier lives on the cheapest building so it rewards breadth,
  not the expensive one where it would erase the build requirement.
- **Scales with Observatories owned**, so the player earns it by building the very
  things the brief wants built: `archiveCap *= 1 + 0.02 × observatories × upgradesOwned`.
- **Gated on Icathia-tier or later material** — Kittens' equivalents cost unobtainium
  and eludium. Nothing before The Doors of Icathia.
- Total worth **×2.5 at most**, matching Kittens' three-upgrade Σ = 0.06.

That is a clean home for `cataloguing` / `crossReferencing` / `greatIndex` /
`annotatedIndex` / `livingLibrary` if Jerry wants the flavour kept. **It is deferred
deliberately: shipping it in the same build as A1 would mask whether A1 worked.** Ship
A1 alone, measure the building counts, then decide.

---

## A3 — Amended pass conditions for Part 2.5.2

Replacing the v0.44 wording, which did not specify measurement conditions:

- Science-building stock at Icathia lands at **30 / 30 / 25 / 13 (±20%)**, measured on
  **both** a Poppy-leading Mountain-Drake save and a save with neither. **The two must
  agree within 10% of each other** — that difference is the whole point of A1 and it is
  the only condition that proves the exemption is wired through every multiplier, not
  just the Scholarship one.
- `caps.knowledge` before the compendium term equals `Σ(building caps.knowledge)`
  **exactly**, asserted directly in a unit test at three save states. Not "approximately";
  the whole claim is that nothing multiplies it.
- No regression: `caps.culture` and `caps.devotion` still receive `scholarMult`, and
  material caps still receive `masonryMult` — the ternary rewrite is the highest-risk
  edit in this amendment.

---

## Order

A1 is a change to Part 2.5.2, which v0.44 Part 4 already schedules in step 1 alongside
Part 1.1, 1.2 and 2.5. **Fold A1 into that same step** — it is not a separate lever, it
is the part of Part 2.5.2 that makes Part 2.5.2 do anything. A2 is deferred. A0 is a
correction to the record and requires no code.

**Sources read this session:** `nuclear-unicorn/kittensgame` —
`js/buildings.js:579–580` (libraryRatio), `:1355–1364` (magneto), `:1246–1256`
(steamworks), `:1550–1568` (reactor), `:959–1015` (mine, quarry), `:574–575, 627–629,
671–672, 687–718` (science buildings); `js/workshop.js:1454, 1471, 1487` (libraryRatio
upgrades), `:2769–2786` (compendium clamp); `js/science.js` (full 64-tech price table).
Verified against `index_v043.html` lines 263–278, 1693–1705, 1734–1738, 1953–1990.
