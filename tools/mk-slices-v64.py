import hashlib, os, sys
s0 = open("snapshots/v64/s0.html").read()
final = open("index.html").read()

def block(txt, start, end, tag=""):
    if start not in txt: sys.exit("START missing %s: %r" % (tag, start[:80]))
    i = txt.index(start)
    if end not in txt[i:]: sys.exit("END missing %s: %r" % (tag, end[:80]))
    j = txt.index(end, i) + len(end)
    return txt[i:j]

steps = []

old = block(s0, '  { id: "longhouse", name: "Longhouse"', 'caps: { vigor: 50 } },  // Kittens logHouse: manpowerMax 50; provisions x10 in v0.55 Part 3.3', "s1old")
new = block(final, '  // ==========================================================================================\n  // v0.64 PART 1.2a', 'NO food component', "s1new")
# The VERSION constant rides with the first slice: everything from s1 on IS v0.64 work, and s0 is
# the v0.63 file verbatim. The constant has no gameplay effect and is PRNG-neutral by construction.
steps.append(("s1", "Part 1.2a — the Longhouse's provisions component deleted (and VERSION -> v0.64)",
              [(old, new), ('var VERSION = "v0.63";', 'var VERSION = "v0.64";')]))

old_a = '// v0.63 PART 1 — THE PER-RUNG CEILING. The divisor is NOT the problem and it does not move.'
new_a = block(final, '// v0.64 PART 5 / DEV NOTE 4', '// v0.63 PART 1 — THE PER-RUNG CEILING [RETIRED AT v0.64 PART 5 — see above].', "s2new_a")
old_b = block(s0, 'var DISCOVERY_RUNG_CAP = 2.43;', '  });\n})();', "s2old_b")
new_b = block(final, '// v0.64 PART 5 — `DISCOVERY_RUNG_CAP` AND ITS LOAD-TIME MUTATION ARE DELETED.', '// distribution got away from everybody in the first place.', "s2new_b")
old_c = '  { id: "masterOfTheHunt", name: "Master of the Hunt", cost: { furs: 120, steel: 80, knowledge: 12000 }, tech: "drakeLore",'
new_c = block(final, '  // v0.64 PART 5 — knowledge 12,000 -> 3,600.', 'knowledge: 3600 }, tech: "drakeLore",', "s2new_c")
old_d = '  { id: "greatLibrary", name: "The Great Library", cost: { culture: 1800, tome: 20, knowledge: 40000 }, tech: "ritesOfTargon",'
new_d = block(final, '  // v0.64 PART 5 — knowledge 40,000 -> 12,000.', 'knowledge: 12000 }, tech: "ritesOfTargon",', "s2new_d")
steps.append(("s2", "Part 5 — DISCOVERY_RUNG_CAP retired, the two authored outliers re-based",
              [(old_a, new_a), (old_b, new_b), (old_c, new_c), (old_d, new_d)]))

BL_OLD = 'var BOOST_LIMIT = { devotion: 2.0, culture: 2.0, gold: 1.5, vigor: 1.0, crystals: 2.0,\n                    provisions: 1.5, mana: 1.0 };'
BL_HDR = block(final, "// v0.64 PART 2 / JERRY'S RULING", 'still stands.', "s3hdr")
mk = lambda d, c, g, v, cr, p, m: 'var BOOST_LIMIT = { devotion: %s, culture: %s, gold: %s, vigor: %s, crystals: %s,\n                    provisions: %s, mana: %s };' % (d, c, g, v, cr, p, m)
steps.append(("s3", "Part 2 — the PROVISIONS rail (1.5 -> 3.0), ALONE and first, per the spec's order",
              [(BL_OLD, '// ==========================================================================================\n' + BL_HDR + '\n' + mk("2.0","2.0","1.5","1.0","2.0","3.0","1.0"))]))
steps.append(("s4", "Part 2 — the VIGOR rail (1.0 -> 8.0) joins. The largest lever in the round",
              [(mk("2.0","2.0","1.5","1.0","2.0","3.0","1.0"), mk("2.0","2.0","1.5","8.0","2.0","3.0","1.0"))]))
steps.append(("s5", "Part 2 — the DEVOTION (2.0 -> 5.0) and MANA (1.0 -> 2.0) rails join",
              [(mk("2.0","2.0","1.5","8.0","2.0","3.0","1.0"), mk("5.0","2.0","1.5","8.0","2.0","3.0","2.0"))]))

old_t = block(s0, '// v0.61 PART 6.3 / DEV NOTE 11 (Jerry): "All trades cost provisions, ~5,000."', 'var TRADE_PROVISIONS = 5000;', "s6oldT")
new_t = block(final, '// v0.61 PART 6.3 / DEV NOTE 11 (Jerry): "All trades cost provisions, ~5,000."', 'var TRADE_PROVISIONS = 3500;', "s6newT")
old_s = '    // and are asserted distinct.\n'
new_s = block(final, '    // and are asserted distinct.\n', '// `test-v64` asserts both the distinctness and the greppability.\n', "s6newS")
steps.append(("s6", "Parts 4 and 6 — TRADE_PROVISIONS 3,500, and Swain's two slots recorded as distinct",
              [(old_t, new_t), (old_s, new_s)]))

old_v = block(s0, '  { id: "coalgasVent", name: "Coalgas Vent"', 'cost: { timber: 250, ore: 420, steel: 20 }, ratio: 1.15,', "s7oldV")
new_v = block(final, '  // ==========================================================================================\n  // v0.64 PART 3.1 / DEV NOTE 1 (spec)', 'cost: { timber: 250, ore: 420, steel: 20, plating: 8 }, ratio: 1.15,', "s7newV")
old_q = block(s0, '  { id: "hexQuarry", name: "Hexcrystal Quarry"', 'cost: { timber: 350, ore: 600, gear: 8 }, ratio: 1.15,', "s7oldQ")
new_q = block(final, '  // v0.64 PART 3.2 — THE SECOND AND LAST GENUINE HOLE', 'cost: { timber: 350, ore: 600, gear: 8, alloy: 6 }, ratio: 1.15,', "s7newQ")
steps.append(("s7", "Part 3 — the era-tier gates (Coalgas Vent + plating 8, Hexcrystal Quarry + alloy 6)",
              [(old_v, new_v), (old_q, new_q)]))

d = []
d.append((block(s0, 'var MARUS_DEVOTION = 0.03;', 'var MARUS_DEVOTION_CAP = 200;      // dev note 10, directed', "d1o"),
          block(final, '// ==========================================================================================\n// v0.64 DEV NOTE 4 (Jerry): "Devotion comes too quickly still.', 'var CHAPEL_DEVOTION = 0.015;       // dev note 4 — directed, was 0.025', "d1n")))
d.append((block(s0, '    cost: { timber: 120, mana: 200, culture: 40, ore: 150 }, ratio: 1.15, prod: { devotion: 0.0075', 'caps: { devotion: 75, culture: 15 } },', "d2o"),
          block(final, '    // v0.64 DEV NOTE 4 — devotion cap 75 -> 50, directed.', 'caps: { devotion: SHRINE_DEVOTION_CAP, culture: 15 } },', "d2n")))
d.append((block(s0, '    cost: { ore: 600, culture: 120, parchment: 12 }, ratio: 1.15,\n    prod: { devotion: 0.025', 'caps: { culture: 200 },', "d3o"),
          block(final, '    // v0.64 DEV NOTE 4 — devotion 0.025 -> 0.015, directed.', 'caps: { culture: 200 },', "d3n")))
d.append(('    effect: "Devotion at scale, needing no workers, and a ceiling to match.",',
          '    effect: "The settlement\'s devotion ceiling, raised further than anything else can raise it.",'))
d.append((block(s0, '    cost: { gold: 800, ore: 400, steel: 60, crystals: 40, culture: 150 }, ratio: 1.15, prod: { devotion: MARUS_DEVOTION }', 'caps: { devotion: MARUS_DEVOTION_CAP },', "d4o"),
          block(final, '    // v0.64 DEV NOTE 4 — the `prod` key is REMOVED, not zeroed.', 'caps: { devotion: MARUS_DEVOTION_CAP },', "d4n")))
d.append((block(s0, 'var MINERALS_LINE = { mine:', 'quarry: ["sumpVentilation", 0.05] };', "d5o"),
          block(final, '// v0.64 DEV NOTE 1 (Jerry): "Sump Ventilation improves Quarry', 're-homed from the Quarry to ore', "d5n")))
d.append((block(s0, '  { id: "sumpVentilation", name: "Sump Ventilation"', 'effect: "Every Quarry\'s miner bonus rises 35% → 40%."},', "d6o"),
          block(final, '  // v0.64 DEV NOTE 1 — the effect is a RESOURCE boost now', 'Math.round(SUMP_VENTILATION_ORE * 100) + "%."},', "d6n")))
d.append(('  { id: "ritesOfInsight",      family: "knowledge",  amt: 0.10, kind: "wtech"   }\n];',
          block(final, '  { id: "ritesOfInsight",      family: "knowledge",  amt: 0.10, kind: "wtech"   },', 'kind: "upgrade" }\n];', "d7n")))
d.append((block(s0, 'var BOOST_SIGMA_OF_RECORD = { gold: 0.45', 'devotion: 0.25, knowledge: 0.10 };', "d8o"),
          block(final, '// v0.64 — EDITED, WHICH IS THE POINT OF THE RULE.', 'devotion: 0.25, knowledge: 0.10, ore: 0.05 };', "d8n")))
d.append((block(s0, 'function convMultBreakdown(isAutoprod) {', 'return { terms: terms, product: product, autoprod: !!isAutoprod };\n}', "d9o"),
          block(final, '// ==========================================================================================\n// v0.64 DEV NOTE 2 (Jerry): "Banked Coals, Infernal Drake', 'return { terms: terms, product: product, autoprod: !!isAutoprod };\n}', "d9n")))
d.append((block(s0, 'function convDiscDesc(id, extra) {', 'Discoveries add together rather than compounding.";\n}', "d10o"),
          block(final, '// v0.64 DEV NOTE 2 — the SCOPE in this string was accurate and is now superseded.', 'Discoveries add together rather than compounding.";\n}', "d10n")))
d.append((block(s0, '  // crystal production alone, priced at 40 crystals on the very rung that first produces', 'Old saves carrying `hexCapacitors` are migrated.', "d11o"),
          block(final, '  // crystal production alone, priced at 40 crystals on the very rung that first produces', "See `convMultBreakdown()`.", "d11n")))
d.append((block(s0, '  var boosts = { knowledge: 0, gold: 0', 'mana: 0, provisions: 0 };', "d12o"),
          block(final, '  // ==========================================================================================\n  // v0.64 DEV NOTE 1, SECOND INSTANCE', 'provisions: 0, timber: 0, ore: 0 };', "d12n")))
d.append(('  { id: "sumpCrawl", name: "The Sump Crawl", tech: "sumpEcology", renown: 4,',
          block(final, '  // ==========================================================================================\n  // v0.64 DEV NOTE 3 (Jerry): "Sump Crawl should be on a cooldown', 'renown: 4, cooldown: 450,', "d13n")))
steps.append(("s8", "Jerry's four dev notes — **PRNG RE-ROLL SLICE**: the Sump Crawl cooldown changes how often a random-consuming path fires (§32 rule 3), so it is deliberately LAST", d))

cur = s0
man = ["# v0.64 cumulative-prefix isolation slices — STANDING-RULINGS §9",
       "#",
       "# Each slice IS the shipped file up to that point, built FORWARD from s0 one Part at a time,",
       "# never reconstructed by reverse-patching the finished file. The proof that the chain is",
       "# faithful is the last line: s8 must be BYTE-IDENTICAL to the shipped index.html.",
       "#",
       "# §32 corollary: a cumulative prefix is only attributable if every slice is PRNG-NEUTRAL with",
       "# respect to the ones before it. s1-s7 alter prices, ceilings and multipliers only — no code",
       "# path changes how many Math.random() calls it makes. s8 does, and is labelled.",
       "",
       "s0  v0.63 shipped file, UNCHANGED. The round's instrumentation lives in sim/, not in index.html,",
       "    so s0 is measurable with every readout this round adds."]
for name, desc, reps in steps:
    for old, new in reps:
        if old not in cur: sys.exit("SLICE %s: pattern absent -> %r" % (name, old[:100]))
        cur = cur.replace(old, new, 1)
    open("snapshots/v64/%s.html" % name, "w").write(cur)
    man.append("%-3s %s" % (name, desc))
ok = cur == final
man += ["", "s8 == shipped index.html byte-for-byte: %s" % ok,
        "   s8       sha256 %s" % hashlib.sha256(cur.encode()).hexdigest(),
        "   index    sha256 %s" % hashlib.sha256(final.encode()).hexdigest()]
open("snapshots/v64/README.md", "w").write("\n".join(man) + "\n")
print("\n".join(man))
if not ok: sys.exit("PREFIX CHAIN DOES NOT REACH THE SHIPPED FILE")
