# BUILDER SPEC v0.48 — the 591 years, and a +5% global building nobody has ever been able to build

Measured against `index_47_1.html`, verified line by line. Every Kittens value below was read
from `nuclear-unicorn/kittensgame` in this session.

**Part 1 landing Icathia at y1,005.3 is the best measurement this project has produced.**
This spec is almost entirely about the gap between that and the y435.9 the full build
delivered — and the leading suspect is not the one either of us named.

**Convergence is deferred.** Jerry's ruling: prestige and resets are a later round. The
diagnosis is recorded in Part 4 so that round starts with it rather than re-deriving it, and
nothing in this spec touches Worship, Ascent or the stripe.

Two UI documents ship alongside this one: `ANIMATION-CHANGES-v0.48.md` and
`TOOLTIP-CHANGES-v0.48.md`. Neither touches pacing.

---

## Part 0 — Concessions

**0.1 — My Part 1.1/1.2 tables named 17 techs for 18 slots.** Your §7.1 is right and your
resolution — retiring Coinage as the second, keeping Kindling at 50,000 — is the one I would
have picked. Ratified, no change.

**0.2 — My Part 1.1 and Part 4.2 contradicted each other on Sparks.** Your §7.2 gave Sparks
its material cost and asserted knowledge-only over ranks 1–19. Correct: the rule was always
meant to be "before Era 3," not "before rank 21." Ratified.

**0.3 — Part 4.2 put `voidglass 6` on a 125,000 tech when voidessence is gated on Icathia at
135,000.** I wrote a deadlock into the same spec that added the audit to catch deadlocks.
Your substitution stands.

**0.4 — I asked for one graph walk and it found six violations, five of them pre-existing.**
`auditCostGraph()` is the most valuable thing added to this build in five rounds. Part 1
below is what happens when you actually read the fifth one.

**0.5 — And I carried your Storehouse guess forward without checking the arithmetic on it.**
Your §1 named the Storehouse because it was the only Part 4 item touching a repeated cost,
which was a reasonable place to point. I then built a whole spec section on it. **On the
numbers it is a weak suspect, and Part 2 explains why.** That is my error, not yours — you
flagged it as unisolated and I treated it as a lead.

**One correction to your §6, for the record even though Convergence is deferred.** You report
"Convergence read 0.0% at Sparks on three of four seeds" and read it as the near end
overshooting. It is not the curve: **the Convergence wtech has `threshold: 1500` and Worship
at Sparks is 1,352** — it is not purchasable yet. At that stock the curve returns **1.22%**.

---

## Part 1 — The Petricite Monument has been unbuildable in every round we have ever measured

This is the finding, and it came out of re-reading your own §3 table rather than from
anything in the spec. **Jerry then named the thing that makes it actionable: the Monument's
Kittens analogue is the Reactor.** He is right on the numbers, and following it exposes a
category census RR has never had. That is §1.4, and it is the part that matters most.

### 1.1 The deadlock

`index_46.html`, the shipped build every previous measurement was taken on:

```js
// the craft — unlocks at Petricite Masonry, 4,600 knowledge in v0.46 / 9,500 in v0.47
{ id: "petriciteBlock", cost: { stoneSlab: 25, hexSlab: 10, crystals: 15 }, out: "petriciteBlock",
  show: function (s) { return s.techs.petricite; } },

// hexSlab <- hexore 20, and hexore requires the Hexcore tech at 75,000 knowledge
```

```js
// and the building that needs it
{ id: "petricite", name: "Petricite Monument", tech: "petricite",
  effect: "All production +5% each",
  cost: { gold: 600, crystals: 40, petriciteBlock: 2 }, ratio: 1.25, globalBoost: 0.05 },
```

**A +5% global production building, at ratio 1.25, has been gated behind a tech roughly
65,000 knowledge above its own** — from rank 16 to rank ~30 — in v0.42, v0.43, v0.44, v0.45,
v0.46 and every isolation run taken on them. Your §3 lists it as the oldest of the six and
correctly calls it out; what neither of us did was ask what it is worth.

### 1.2 What it is worth

`globalBoost` feeds `catMonument`, which multiplies every non-transient resource — ore,
timber, gold, mana, crystals and every craft input downstream of them. At ratio 1.25 a
settlement that owns twelve is at **+60% on all production**, and it now reaches them from
**Petricite Masonry (9,500)** instead of **Hexcore (75,000)**.

That is a large production multiplier arriving in the middle of Era 2 that has never
existed in a measured build. **It is a far better candidate for cancelling a ×2.46 tech-price
lever than a storage building.**

### 1.3 Jerry's ruling, checked: it is the Reactor, and RR has five of a category Kittens caps at two

**Kittens' entire global-production tier, from source:**

| Building | effect | ratio | unlocked by | price |
|---|---|---|---|---|
| Steamworks | `magnetoBoostRatio 0.15` *(amplifier only)* | 1.25 | `machinery` | **15,000** |
| Magneto | `magnetoRatio 0.02` | 1.25 | `electricity` | **75,000** |
| Reactor | **`productionRatio 0.05`** | **1.15** | `nuclearFission` | **150,000** |

**Two multipliers and one amplifier. That is all of it.**

**RR v0.47 has five multipliers and one amplifier:**

| Building | globalBoost | ratio | tech | price | maps to |
|---|---|---|---|---|---|
| **Petricite Monument** | **0.05** | 1.25 | petricite | **9,500** | Reactor's magnitude, Magneto's ratio, no rank |
| Hextech Foundry | 0.06 | 1.25 | hexcore | **75,000** | **Magneto — exact price parity** ✅ |
| Arcane Reactor | 0.04 | **1.15** | greyReclamation | 115,000 | **Reactor — right ratio, near-right rank** |
| Ward of the Watchers | 0.03 | 1.25 | watchersBelow | 125,000 | nothing |
| The Frozen Watcher | 0.04 | 1.25 | icathia | 135,000 | nothing |
| Hexdraulic Plant | *amplifier +0.15* | 1.25 | hexcore | 75,000 | Steamworks — **60,000 late**, see 1.5 |

**Jerry's claim verifies exactly on magnitude: 0.05 is `productionRatio 0.05`, to the
digit.** And Kittens' Reactor unlocks at `nuclearFission`, **150,000** — which is past the
end of RR's entire ladder (Icathia, 135,000, rank 38). RR's is at **9,500, rank 16**. That
is a Reactor-class effect arriving **twenty-two ranks and a factor of 15.8 early**, and it
is the best explanation anyone has offered for the 591 years.

**But it also means RR has two buildings claiming the Reactor slot, and two more claiming
nothing.** The Arcane Reactor is the closer fit — ratio **1.15**, which is the *defining*
property of that tier and the reason a Kittens player can own thirty of them; my own v0.44
Part 1.2 said "the gentle ratio is the whole point." The Petricite Monument has the
Reactor's strength on the Magneto's ratio, at neither one's rank.

### 1.3.1 Jerry's follow-up: merge the Monument into the Quarry — yes, and it is the best answer

**Jerry asked whether the Petricite Monument can replace the Quarry. It can, and it resolves
the open question in Option A below without inventing anything.** The two buildings are
already on the same tech — `petricite`, 9,500 — so nothing moves rank.

**But the merge only works in one direction: the Monument takes the Quarry's stats, never
the reverse.** The Quarry's `stoneSlab 1000 + steel 125 + scaffold 50` at ratio 1.15 *is*
Kittens' Quarry transliterated, and re-pricing it was v0.46 Part 1 — the largest lever in
the project, worth ×1,016 the Mine. If the merged building inherited the Monument's
`gold 600 + crystals 40 + petriciteBlock 2` at ratio 1.25, that lever is undone.

**Keep the `quarry` id and change the name.** The id is referenced in exactly two places
outside its own definition, and both would break on a rename:

```js
var MINERALS_LINE = { mine: ["zauniteDrills", 0.05], quarry: ["sumpVentilation", 0.05] };
//                                            ^^^^^^ keys off the id
```

— plus the ore-category formula `1 + 0.25M + 0.40Q` that every measurement since v0.46 is
stated in. Changing the display name touches none of it and needs no save migration;
changing the id touches all of it.

```js
{ id: "quarry", name: "Petricite Quarry", group: "Village", tech: "petricite",
  lore: "Demacian stone steadies the land — and the hillside gives it up a course at a time.",
  effect: "Miner effectiveness +35% each",
  cost: { stoneSlab: 1000, steel: 125, scaffold: 50, petriciteBlock: 2 },
  ratio: 1.15, jobBoost: { miner: 0.35 } },

// and the separate `petricite` building is deleted entirely
```

**Keep `petriciteBlock 2` in the cost.** It is otherwise orphaned: the only other reference
in the file is a Demacia trade slot that *produces* Petricite Blocks
(`{ res: "petriciteBlock", amt: 1 }`). Delete the Monument without moving the block cost and
the craft the builder just unblocked has **no consumer anywhere in the game**. A fourth
component on Kittens' three-component Quarry is a small divergence in the safe direction —
slightly more expensive — and it is the entire point of the name.

**Keep `group: "Village"`, not the Monument's `"Industry"`.** The Mine and this building are
Kittens' two-member `mineralsRatio` pair and the composition argument is the whole reason
the building exists; they should sit adjacent in the UI.

**Three things this settles at once:** the `globalBoost 0.05` at rank 16 is gone, which was
the objective; RR keeps Kittens' two-building ore composition, which v0.46 Part 2 took two
rounds to get right; and the Monument's replacement effect stops being an open design
question.

**One consequence worth naming.** Petricite Masonry now unlocks one building instead of two.
It is not left empty — it still carries the Petricite Block craft and the Stonecut Guild
discovery — but it is a thinner tech than it was, and if that reads badly the cheapest fix is
to move a Discovery onto it rather than to invent a building.

**The name is Jerry's, and it is settled: `Petricite Quarry`.** "Monument" reading "Miner
effectiveness +35%" was the odd pairing; this keeps the Demacian-stone identity and
describes what the building does. **The string `"Petricite Monument"` should not survive
anywhere in the build** — the old building's definition goes, and the Demacia trade slot's
`label: "a quenched petricite block"` is the only other place the material is named, which
is correct as-is.

### 1.3.2 The two options this replaces, kept for the record

**Option A — superseded by 1.3.1, which is the same move with the replacement effect
decided. The Petricite Monument leaves the category; the Arcane Reactor becomes the Reactor
outright.**

```js
// RR's global-production tier becomes exactly Kittens': one Magneto, one Reactor.
{ id: "hextechFoundry", tech: "hexcore",         globalBoost: 0.06, ratio: 1.25 },  // 75,000 — already exact
{ id: "arcaneReactor",  tech: "greyReclamation", globalBoost: 0.05, ratio: 1.15 },  // 0.04 -> 0.05, Kittens' figure
{ id: "petricite",      tech: "petricite",       /* globalBoost removed */ },
```

1.3.1 is this option with the landing spot chosen: the `<res>Ratio` term, delivered by
merging into the Quarry rather than by adding an effect to a second building.

**Why this over the literal reading:** it removes the early multiplier Jerry is objecting to,
it keeps an Era-2 building the player already owns at the rank they already know, and it
keeps the Arcane Reactor's Hextech Core / Hexcrete / Focused Hexcrystal sink — which is the
answer to "what are Hextech Cores *for* after the Observatory," and the only reason that
material has a use.

**Option B — the literal reading. The Monument moves to the Reactor rung and the Arcane
Reactor is absorbed into it.** Petricite Monument → `icathia` (135,000, the nearest rung to
Kittens' 150,000 that exists), ratio 1.25 → **1.15**, `globalBoost` stays 0.05; Arcane
Reactor retired. **Cost:** Era 2 loses a building, Era 3 loses the Hextech Core sink, and a
rank-16 flavour piece becomes a rank-38 one. Take this only if you want the Monument
specifically to *be* the capstone.

**Both options end with RR at exactly two global-production buildings, which is the point.**

### 1.4 The other two are a fourth and fifth member of a two-member category

| | globalBoost | ratio | tech |
|---|---|---|---|
| Ward of the Watchers | 0.03 | 1.25 | `watchersBelow` 125,000 |
| The Frozen Watcher | 0.04 | 1.25 | `icathia` 135,000 |

Both are Freljord capstones and both carry a **global production multiplier on top of their
own real effects** (True Ice production, Void Essence cap, poro ratio). Kittens has no third
or fourth member of this category at any rank.

**Strip `globalBoost` from both and let their named effects carry them.** They are
end-of-ladder buildings, so the pacing effect is small — but +3% and +4% per copy at ratio
1.25 is another twenty to thirty per cent on the whole economy at exactly the point Era 3 is
supposed to be at its hardest, and it is a category Jerry's standing rule says must not
exceed Kittens'. This is the cheapest correction in the spec.

### 1.5 One divergence in the same category, running the safe way

**Kittens' Steamworks is unlocked by `machinery`, 15,000 — RR's rank 19, Call to Arms.** The
Magneto it amplifies is at `electricity`, **75,000**. Kittens hands the player the amplifier
**sixty thousand science before the thing it amplifies exists.**

Your §3 moved the Hexdraulic Plant from `hexdraulics` (50,000) to `hexcore` (75,000) to clear
its deadlock, so RR now delivers both **simultaneously**. That is a real divergence, it makes
RR slower rather than faster, and it is not worth fixing in the same round as everything
else. **Recorded, not actioned** — revisit when `catMonument` is being tuned.

### 1.6 The question that has to be answered before anything else

Your isolation is labelled **"+ Part 1 only (the ladder at Kittens' prices)"**. Six things
could reasonably have been inside that build:

1. the 38 tech prices (Part 1.1 / 1.2)
2. beam and scaffold onto Carpentry (Part 1.4a)
3. the Warehouse onto Carpentry (Part 1.4b)
4. `auditCostGraph()` itself (Part 1.4c)
5. **the six deadlock fixes the audit found** (your §3)
6. the Scriptorium promotion and Carpentry's creation (Part 1)

**Tell me which.** If the deadlock fixes were *outside* the Part 1 build, they are in the
591-year residual and Part 1.2 is very likely the whole answer. If they were *inside* it,
then y1,005.3 already includes an early Petricite Monument and the residual is elsewhere.

**This one answer may resolve the round without running anything.** It costs a grep of the
isolation build, not a 4,000-year run.

### 1.7 What ships

**§1.3.1 Option A and §1.4, together** — they are one correction: RR's global-production
category goes from five members to Kittens' two.

- Arcane Reactor `globalBoost` **0.04 → 0.05** (Kittens' `productionRatio`), ratio 1.15
  unchanged.
- Hextech Foundry unchanged — it is already at exact Magneto parity, 0.06 at ratio 1.25 on
  the 75,000 rung, and nobody noticed.
- **The Petricite Monument merges into the Quarry** per §1.3.1: the `quarry` id keeps its
  cost, ratio and `jobBoost`, gains `petriciteBlock 2`, is renamed **`Petricite Quarry`**,
  and the separate `petricite` building is deleted.
- **`globalBoost` removed** from the Ward of the Watchers and The Frozen Watcher. Both keep
  every other effect they have.

**Ship this alongside Part 2's isolation runs, not instead of them.** It changes
`catMonument` at every point in the game, so the runs must be taken on the build that has
it — otherwise we are attributing 591 years on an economy that no longer exists.

---

## Part 2 — The isolation runs, re-aimed (Jerry Q2)

**Yes, run them — approved.** Three changes to the shape from what I specced last round.

### 2.1 Subtractive, not additive

Your runs were `v0.46 + Part 1` and `v0.46 + Part 2`. That shape answers "what is this worth
alone," which is right for a lever. It does **not** decompose a loss, because the terms
interact — an early Petricite Monument is worth more with a longer era, not less. And note
what the table actually says: **full v0.47 at y413.6 is *faster than the v0.46 baseline* at
y443.0**, while containing a lever worth y1,005.3 on its own. That is not 591 years of
give-back; that is something more than cancelling a ×2.46.

**Run full-v0.47-minus-X**, seed 1, 4,000 years, everything else at v0.47.

### 2.2 Two candidates — the Petricite run is retired, and it needs no replacement

**Jerry: "we don't need Run A any more because the Monument is now the Quarry." Correct, and
it is better than that — the question Run A was going to answer comes out of the round for
free.**

Run A was going to revert the Petricite Block to `stoneSlab 25, hexSlab 10, crystals 15`,
restoring the deadlock so the Monument went back to arriving at Hexcore, and measure what an
early +5% global building was worth. **After Part 1.7 there is no early +5% global building
to measure** — the `globalBoost` is deleted outright, so its value is zero in every build
from here. Reverting the Petricite Block now would only re-gate the **Quarry**, since the
merged building carries `petriciteBlock 2`, which is a different and much worse experiment.

**And the number is available anyway, at no cost.** Part 1.7 lands before the runs, so the
builder is producing a full v0.48 multi-seed regardless. Comparing **full v0.48 seed 1
against full v0.47 seed 1 (Icathia y413.6)** measures exactly what removing three
`globalBoost` buildings was worth. That is Run A's answer, obtained by subtraction from work
already scheduled.

| Run | Revert, from full v0.48 | Why |
|---|---|---|
| **B** | **Cultivation's `+10% provisions`** removed | A production multiplier on food, at rank 2, feeding population, feeding every job. **It is the one item in v0.47 with no Kittens counterpart at all** — `agriculture` grants no production effect — and I added it on my own instruction. |
| **C** | **Shelter `vigor: 75` → `40`** | ×1.875 on the vigor ceiling opened the trade layer for the first time (first trade y169.7 against never). Trade yields 350–500 timber or 28–38 steel a run. |

**Note the baseline moved.** B and C are now full-**v0.48**-minus-X, not full-v0.47-minus-X,
because Part 1.7 ships first and changes `catMonument` everywhere. Measuring them against
the old economy would attribute years to a game that no longer exists.

**The Storehouse is not on this list.** Part 3 is why.

If the v0.48-vs-v0.47 delta plus B and C account for less than half the gap, the residual is
in the other four deadlock fixes — the Harbor and the Hexdraulic Plant both moved *later*,
so the net of §3 is not obviously positive and may need splitting.

### 2.3 Report the full milestone set per run

Rites of Targon, Call to Arms, Sparks, Chemtech, Hexcore, Deep Works, Icathia, peak
population, and **Petricite Quarry count at Sparks and at Icathia**. A lever that moves
Era 0–2 and one that moves Era 3 need different answers, and Icathia alone cannot separate
them. Your §9.2 already shows the early eras moving *later* while Sparks moved earlier;
that pattern is only legible with the full set.

---

## Part 3 — The Storehouse: nothing is wrong with it, and the ore cost stays off (Jerry Q3)

**Jerry's question is the right one and the answer is that there is no problem to fix.**
Setting out the whole comparison, because the previous two specs left it implied:

| | Kittens barn | RR Storehouse v0.47 |
|---|---|---|
| unlocked by | `agriculture` — **rank 2** | Cultivation — **rank 2** |
| cost | `wood 50` | `timber 50` |
| price ratio | **1.75** | **1.75** |
| material caps | wood 200 · minerals 250 · gold 10 | timber 200 · ore 250 · gold 10 |
| food cap | catnip 5000 | provisions 750 |
| other | coal 60 · iron 50 · titanium 2 | mana 100 |

**Every line with a clean analogue is identical.** The two that differ are the two Jerry
already ruled on: RR splits Kittens' catnip into provisions *and* mana, so `catnipMax 5000`
has no single counterpart and was correctly left alone.

### 3.1 What actually changed in v0.47 — and it was not the price

The v0.46 Storehouse cost `timber 60, ore 75` and unlocked at Cultivation, **rank 2, 100
knowledge**. Ore came from the Mine at Mining, which in v0.46 was **rank 6, 1,200
knowledge**.

**So RR's first storage building was unbuildable for four ranks of every run ever
measured.** The whole opening ran on base caps. That is the same class of defect as the
Petricite Block, the scaffold gate and the other four — it is violation number seven, and it
is the one that got fixed a round before the audit existed to name it.

**The v0.47 change did not make the Storehouse cheap. It made it reachable.** And putting
`ore 75` back would restore the deadlock: `auditCostGraph()` would fail on it immediately,
which is exactly the check that just caught six of these.

**Kittens' `wood 50` is not incidental parity either.** In Kittens, `agriculture` is rank 2
and `mining` is rank 4 — a barn priced in minerals would be unreachable when it unlocks.
Bloodrizer priced it in wood for precisely the reason RR must.

### 3.2 Why it is a weak suspect for the 591 years

Storage effects are front-loaded. By the middle of Era 3 the settlement owns dozens of
Storehouses in either build; the difference is *when the first fifteen arrive*, not how many
exist at Icathia. For that to cancel a ×2.46 tech-price lever it would have to compound
through four hundred game-years from a four-rank head start — possible, but it is a much
weaker mechanism than a **+60% global production multiplier arriving 65,000 knowledge
early**.

**If run A clears the Petricite Monument and the gap survives, put the Storehouse back on the
list** — but as a cap question, not a cost one. Every Kittens-mapped number on it is at
parity; the un-derived ones are `provisions 750` and `mana 100`, and **`mana 100` is the
suspect**: mana has no barn counterpart at all and it is the input to Transmute, RR's entire
bootstrap faucet before any job exists.

### 3.3 One live prose drift, found while reading it

```js
effect: "+750 provisions, +200 timber, +150 ore, +100 mana cap",
…
caps: { provisions: 750, timber: 200, ore: 250, mana: 100, gold: 10 } },
```

**The string says 150 ore, the code gives 250, and the gold term is missing entirely.**
Sixth drift of this class in this project. `TOOLTIP-CHANGES-v0.48.md` §4 kills the category
by generating these lines from `caps`; this one is the argument for doing it now.

---

## Part 4 — Convergence: deferred, with the diagnosis recorded

**No code this round.** Jerry has ruled that prestige and resets come later, and Convergence
belongs to that round. Recording the finding so it does not have to be re-derived:

**RR's curve is Kittens' curve.** `worshipBonus()` is `0.01 × unlimitedDR(S.worship, 1000)`;
Kittens' `getSolarRevolutionRatio` is `getUnlimitedDR(this.faith, 1000) / 100`. Same
expression, same constant. **A Kittens player holding 1,682,246 faith would also see
+57.5%.**

| Worship / faith | Convergence, both games |
|---|---|
| 1,352 *(RR at Sparks)* | 1.22% |
| 10,000 | 4.00% |
| 100,000 | 13.65% |
| **1,682,246** *(RR at Icathia)* | **57.51%** |

**Kittens never gets there because it empties the pool.** `js/religion.js:1647`:

```js
_resetFaithInternal: function(bonusRatio) {
    this.faithRatio += this.faith / 1000000 * ttPlus1 * ttPlus1 * bonusRatio;
    this.faith = 0.01;                       // <<<< the Worship pool is emptied
},
```

Adore the Galaxy converts the accumulated pool into **Epiphany** (`faithRatio`), a permanent
and much flatter counter, and zeroes Worship. Epiphany pays into the **next Praise's yield**
(`praise()`, line 1601) — never into production. So Solar Revolution's input is a sawtooth
the player chooses when to reset, not a lifetime integral.

**Your §6 is right that no supply fix flattens an integral.** Kittens' answer is the sink,
and it is the centre of its religion loop. RR built tier one (Ascent → Worship →
Convergence) and has no tier two.

Three things the prestige round will need, so they are on the record now:

- Kittens' divisor is **1,000,000**, and it lands correctly against RR's magnitudes —
  adoring at 100,000 Worship yields +0.1 Epiphany, worth **+10%** on the next Ascent through
  `unlimitedDR(epiphany, 0.1) × 0.1`.
- **Epiphany must never enter `computeRates()`.** Kittens keeps Apocrypha religion-internal;
  putting RR's equivalent in the production stack would replace one runaway multiplier with
  another.
- **The WTECH thresholds gate on `S.worship`** (50 / 200 / 400 / 600 / 1500). Zeroing the
  pool would revoke access to any unpurchased upgrade — a save-destroying interaction. That
  round needs a never-reset `S.worshipLifetime` for the gates, keeping "how much have I
  given" separate from "how much is banked right now."

---

## Part 5 — Carried forward, unchanged

**5.1 — First trade at y169.7, after Sparks.** Your §9.3 is right that the ceiling is no
longer binding (gold cap 12,373 against a 30-gold trade) and that the remaining gate is the
bot's surplus rule. **Take the lever the spec named: cheapest route 150 → 100 vigor.** One
line, and it is the last item on the trade gate before we start blaming the bot.

**5.2 — Vigor at cap 16.9–26.3%.** Halved from 40.5–43.2%, exactly as predicted, still above
10%. **Report again, do not tune.** Part 5.1 opens the sink further.

**5.3 — The Foundry/Reactor *price* separation, still deferred.** RR ×0.525 against Kittens'
×181 in effective-raw terms. Part 1.7 fixes the category's *membership*; this is its
*pricing*, and it stays deferred until the isolation runs land on the new `catMonument`.
Note the two interact: with three buildings leaving the category, thirty Arcane Reactors at
0.05 is now the whole tier rather than part of it, so the price question gets sharper, not
softer.

**5.4 — `auditCostGraph()` stays in the test suite permanently.** Five of six violations were
pre-existing and silent, and the seventh (the Storehouse, §3.1) was fixed a round before the
audit existed. Every new building, craft and tech price runs through it from now on.

---

## Part 6 — Order, and what to verify

### Order

1. **Answer Part 1.6 first — it is a grep, not a run.** What was inside the "+ Part 1 only"
   build? That answer may close the round.
2. **Part 1.7** — the global-production category down to Kittens' two. This changes
   `catMonument` everywhere, so it must land *before* the isolation runs, not after.
3. **Part 2's two isolation runs** (B and C), subtractive from full v0.48, with the full
   milestone set. Run A is retired — §2.2 — and its answer falls out of comparing full v0.48
   against v0.47's y413.6.
4. **Part 5.1** — the trade cost. One line.
5. **The two UI documents.** The tooltip prose split is 113 strings and is the long pole;
   start it early, land it whenever, nothing measures against it.
6. **No Convergence code. No prestige code.**

### Pass conditions

- **The contents of the "+ Part 1 only" isolation build are stated explicitly**, item by
  item against the six candidates in Part 1.6.
- **Exactly two buildings in the game carry `globalBoost`** — the Hextech Foundry and the
  Arcane Reactor — matching Kittens' Magneto and Reactor. Grep-level assertion.
- **Arcane Reactor `globalBoost` is 0.05 at ratio 1.15**, Kittens' `productionRatio` and
  `priceRatio` exactly.
- **The Ward of the Watchers and The Frozen Watcher each keep every non-`globalBoost`
  effect they had.**
- **The merged Quarry costs `stoneSlab 1000, steel 125, scaffold 50, petriciteBlock 2` at
  ratio 1.15 with `jobBoost: { miner: 0.35 }`**, the `quarry` id is unchanged, and
  `MINERALS_LINE.quarry` and the ore-category formula `1 + 0.25M + 0.40Q` still resolve.
- **`petriciteBlock` has at least one consumer**, and the string `"Petricite Monument"`
  appears nowhere in the build. Two grep-level assertions — deleting the old building
  without moving its block cost orphans a craft.
- **The Petricite Quarry passes `auditCostGraph()` with its new `petriciteBlock 2`
  component.** The merge gives RR's second ore-ratio building a dependency on the Petricite
  Block craft, and therefore on **crystals** — which arrive with the Hextech Refinery at
  rank 14 against the Quarry's rank 16, so it should be clean. Assert it rather than assume
  it; this is the same shape as the six violations already found.
- **The ore category measures identically to v0.47 at equal building counts.** The merge
  must be visible only as the loss of `globalBoost`, not as a change to ore income.
- **Full v0.48 seed 1 reported against v0.47's y413.6**, so the value of removing three
  `globalBoost` buildings is stated. This replaces Run A.
- **Two subtractive isolation runs reported** (B and C, from full v0.48), each with Rites of
  Targon, Call to Arms, Sparks, Chemtech, Hexcore, Deep Works, Icathia, peak population, and
  **Petricite Quarry count at Sparks and at Icathia**.
- **`catMonument` reported at Sparks, Hexcore and Icathia**, decomposed by building. This is
  the category Part 1 just changed and nobody has ever measured it with the Monument
  available.
- **The Storehouse still costs timber alone**, and `auditCostGraph()` is green on the whole
  graph — including a direct assertion that a Storehouse priced in ore would fail it.
- **The Storehouse `effect` string is generated from `caps`**, or corrected by hand to 250
  ore with the gold term added, if the tooltip work has not landed.
- First trade before Sparks on every seed, with the cheapest route at 100 vigor.
- **No change to Worship, Ascent, the stripe, the Shrine, the Acolyte or any WTECH.**
- No regression: all 38 tech prices unchanged; the five ladder conditions still hold
  together; knowledge cap exact; `buildingJobBoost` unbounded; morale ≥ 0.90 at Icathia;
  offline replay still 0% drift.

**Sources, all read this session.** `nuclear-unicorn/kittensgame` —
`js/buildings.js:1246–1256` (steamworks, `magnetoBoostRatio 0.15`, ratio 1.25),
`:1355–1364` (magneto, `magnetoRatio 0.02`, ratio 1.25), `:1550–1568` (reactor,
`productionRatio 0.05`, **ratio 1.15**); `js/science.js` unlocks — `machinery` 15,000 →
steamworks, `electricity` 75,000 → magneto, `nuclearFission` **150,000** → reactor;
`js/buildings.js:758–790` (barn: `wood 50`, ratio 1.75, `woodMax 200`, `mineralsMax 250`,
`goldMax 10`, `catnipMax 5000`); `js/science.js` (`agriculture` rank 2, `mining` rank 4 —
the reason the barn is priced in wood); `js/religion.js:1548–1551`
(`getSolarRevolutionRatio`, stripe 1000), `:1553–1555` (`getApocryphaBonus`), `:1599–1613`
(`praise`), `:1624–1652` (`_resetFaithInternal` — `this.faith = 0.01`). Verified against
`index_46.html` lines 431–433 (Petricite Monument), 3101–3103 (Petricite Block with
`hexSlab 10`), 509 (Petricite Masonry 4,600), and the v0.46 Storehouse and Mining ranks;
and against `index_47_1.html` lines 269–277 (Storehouse), 455–457, 3280–3282 (the fixed
Petricite Block), 885–893 (WTECHS, the 1,500 Convergence threshold), 918–945.
