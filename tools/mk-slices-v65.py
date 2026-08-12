# v0.65 — the §9 cumulative-prefix builder, re-pointed from v0.64's.
#
# Each slice IS the shipped file up to that point, built FORWARD from s0 one Part at a time,
# never reconstructed by reverse-patching the finished file. The proof that the chain is
# faithful is the last line: the final prefix must be BYTE-IDENTICAL to the shipped index.html.
#
# ONE DIFFERENCE FROM v0.64's CHAIN, and it is stated rather than hidden: **s4 (Part 5) and s5
# (Part 6) change `sim/` ONLY.** `index.html` is byte-identical across s3, s4 and s5, so this
# tool emits three identical files under three names rather than pretending otherwise. That is
# also why s4's §32 neutrality proof cannot be a file comparison — it is run by
# `tools/prove-s4-neutral.sh`, which runs ONE index.html against the harness with and without
# the marker and requires the seeded figures to match to the digit.
import hashlib, os, sys

s0 = open("snapshots/v65/s0.html").read()
final = open("index.html").read()


def block(txt, start, end, tag=""):
    if start not in txt:
        sys.exit("START missing %s: %r" % (tag, start[:90]))
    i = txt.index(start)
    if end not in txt[i:]:
        sys.exit("END missing %s: %r" % (tag, end[:90]))
    return txt[i:txt.index(end, i) + len(end)]


steps = []

# ---- s1: Part 2 — the Training Ground's vigor boost out, the weapon line in ----
s1 = []
s1.append((block(s0, '    lore: "Wanderers learn the spear, and someone writes down who won."',
                 'caps: { vigor: 150 }, boost: { vigor: 0.10 } },   // provisions x10, v0.55 Part 3.3', "s1a"),
           block(final, '    // ========================================================================================\n    // v0.65 PART 2 / DEV NOTE 1',
                 'caps: { vigor: 150 } },   // provisions x10, v0.55 Part 3.3', "s1b")))
SUMPLINE = 'var SUMP_VENTILATION_ORE = 0.05;   // dev note 1 — the same 5%, re-homed from the Quarry to ore'
SEP = '// =========================================================================================='
# The two constant blocks that sit between SUMPLINE and BOOST_MEMBERS in the shipped file, in
# shipped order: Part 4's first, then Part 2.4's. Each is inserted by ITS OWN slice, which is why
# they are extracted separately rather than as one span.
WEAPON_BLOCK = block(final, SEP + "\n// v0.65 PART 2.4 — THE WEAPON LINE",
                     '"% more Vigor from the Wilds. The weapon line adds together rather than compounding.";\n}', "WL")
MANA_BLOCK = block(final, SEP + "\n// v0.65 PART 4 — THE FOURTH MANA DISCOVERY",
                   'var LEYLINE_LENSING_MANA = 0.25;   // Part 4 — the fourth member, on `hexcore` and NOT on `sparks`', "P4")
s1.append((SUMPLINE, SUMPLINE + "\n" + WEAPON_BLOCK))
s1.append(('  { id: "sumpVentilation",     family: "ore",        amt: SUMP_VENTILATION_ORE, kind: "upgrade" }\n];',
           block(final, '  { id: "sumpVentilation",     family: "ore",        amt: SUMP_VENTILATION_ORE, kind: "upgrade" },',
                 'amt: VIGOR_WEAPON_LINE[2][1], kind: "upgrade" }\n];', "s1d")))
s1.append((block(s0, '  { id: "ironShodWheels", name: "Iron-Shod Wheels"', 'effect: wildsVigorDesc(10, true)},', "s1e"),
           block(final, '  { id: "ironShodWheels", name: "Iron-Shod Wheels"', 'effect: weaponDesc("arclightLance")},', "s1f")))
# NOTE: this content is DELETED again by s6 (Part 1 removes the named set outright), so it
# cannot be extracted from `final` — the intermediate state does not survive to the end of the
# chain. Written literally, which is the honest way to express "s1 added this and s6 removed it".
s1.append(('  "clockworkBellows", "resonanceCoils", "celestialCharts", "facetedCuts"\n];',
           '  "clockworkBellows", "resonanceCoils", "celestialCharts", "facetedCuts",\n'
           '  // v0.65 PART 2.4 — the weapon line. A weapon rung is a METHOD by this set\'s own rule (a\n'
           '  // technique someone had to work out), and the source charges science on all three. Note this\n'
           '  // membership becomes moot at Part 1, which deletes the set and prices every Discovery.\n'
           '  "huntersDraw", "latchAndLever", "arclightLance"\n];'))
s1.append((block(s0, 'var BOOST_SIGMA_OF_RECORD = { gold: 0.45', 'ore: 0.05 };', "s1h"),
           block(final, '// v0.65 — EDITED AGAIN, WHICH IS THE RULE WORKING.', 'the rail was never the binding thing here.', "s1i")
           + '\nvar BOOST_SIGMA_OF_RECORD = { gold: 0.45, provisions: 0.10, mana: 0.75, crystals: 0.50,\n                              devotion: 0.25, knowledge: 0.10, ore: 0.05, vigor: 1.00 };'))
s1.append(('var VERSION = "v0.64";', 'var VERSION = "v0.65";'))
steps.append(("s1", "Part 2 — the Training Ground's vigor boost deleted, Kittens' weapon line ported (and VERSION -> v0.65)", s1))

# ---- s2: Part 3 — the Longhouse's provisions component restored at 30 ----
s2 = []
s2.append(('var MARUS_DEVOTION_CAP = 250;      // dev note 4 — directed, and the Marus is now the PRIMARY ceiling',
           block(final, '// v0.65 PART 3 / DEV NOTE 3 — the Longhouse\'s provisions component, restored at a base chosen by',
                 'var MARUS_DEVOTION_CAP = 250;      // dev note 4 — directed, and the Marus is now the PRIMARY ceiling', "s2a")))
s2.append((block(s0, '  { id: "longhouse", name: "Longhouse", group: "Village", tech: "carpentry",',
                 'NO food component', "s2b"),
           block(final, '  // ==========================================================================================\n  // v0.65 PART 3 / DEV NOTE 3 (Jerry):',
                 'the provisions component is RR-ORIGINAL', "s2c")))
steps.append(("s2", "Part 3 — the Longhouse's provisions component restored at 30, sized by the never-bind rule", s2))

# ---- s3: Part 4 — the fourth mana Discovery ----
s3 = []
s3.append((SUMPLINE, SUMPLINE + "\n" + MANA_BLOCK))
s3.append(('  { id: "trueIceCellars",      family: "mana",       amt: TRUE_ICE_MANA_BOOST, kind: "upgrade" },   // v0.59.1 note 6',
           block(final, '  { id: "trueIceCellars",      family: "mana",       amt: TRUE_ICE_MANA_BOOST, kind: "upgrade" },   // v0.59.1 note 6',
                 'amt: LEYLINE_LENSING_MANA, kind: "upgrade" },', "s3c")))
s3.append((block(s0, '  { id: "hexresonance", name: "Hexresonance"', 'effect: "All mana production +25%."},', "s3d"),
           block(final, '  { id: "hexresonance", name: "Hexresonance"',
                 'Math.round(LEYLINE_LENSING_MANA * 100) + "%."},', "s3e")))
s3.append(('  "greyScrubbers", "standardHour", "voidglassLenses", "voidwardStores"\n];',
           block(final, '  "greyScrubbers", "standardHour", "voidglassLenses", "voidwardStores",', '"leylineLensing"\n];', "s3f")))
# also deleted by s6 — written literally for the same reason as s1's entry above
s3.append(('  "huntersDraw", "latchAndLever", "arclightLance"\n];',
           '  "huntersDraw", "latchAndLever", "arclightLance",\n'
           '  // v0.65 PART 4 — the fourth mana Discovery. Also moot at Part 1.\n'
           '  "leylineLensing"\n];'))
# the Σ of record gains `mana: 1.00` and its key order is re-sorted to match boostSigmaLive()
s3.append(('var BOOST_SIGMA_OF_RECORD = { gold: 0.45, provisions: 0.10, mana: 0.75, crystals: 0.50,\n                              devotion: 0.25, knowledge: 0.10, ore: 0.05, vigor: 1.00 };',
           block(final, '// KEY ORDER MATTERS:', 'ore: 0.05, vigor: 1.00 };', "s3sigma")))
steps.append(("s3", "Part 4 — the fourth mana Discovery, on `hexcore`, discharging v0.64's one undischarged condition", s3))

# s4 and s5 change sim/ only. Recorded as slices because the ROUND has six of them and the
# manifest must not imply a file change that did not happen.
steps.append(("s4", "Part 5 — `firstPZChampion`, `sparksAfterPZ` and the [draw] labels. **`sim/` ONLY — index.html byte-identical to s3.** Its §32 neutrality proof is `tools/prove-s4-neutral.sh`, not a file diff", []))
steps.append(("s5", "Part 6 — the Rites condition restated as a y50-200 band. **`sim/` ONLY — index.html byte-identical to s3**", []))

# ---- s6: Part 1 — the discovery coverage. LAST, and alone. ----
# The named set at this point in the chain carries s1's and s3's additions, so the span to
# delete is read from the CHAIN's current state rather than from s0.
if os.environ.get("V65_WITH_S6"):
    s6 = []
    # the exemption prose + the EXEMPT list + the divisor line replace the old rule prose + divisor
    s6.append((block(s0, '// THE RULE FOR THE SET, and Jerry said MORE, NOT ALL, so there has to be one.',
                     'var DISCOVERY_KNOWLEDGE_DIVISOR = 1.25;   // v0.62 dev note 1: K/10 -> 0.8 x K', "s6a"),
               block(final, SEP + '\n// v0.65 PART 1 / DEV NOTE 2',
                     'var DISCOVERY_KNOWLEDGE_DIVISOR = 1.25;   // v0.62 dev note 1: K/10 -> 0.8 x K, and it does NOT move', "s6b")))
    # the named list is DELETED outright (it now lives, empty, as DISCOVERY_KNOWLEDGE_EXEMPT above)
    s6.append(("@@DELETE_KNOWLEDGE_SET@@", ''))
    # and the generator is inverted to walk UPGRADES
    s6.append((block(s0, '(function applyDiscoveryKnowledge() {', '})();', "s6e"),
               block(final, '// v0.65 PART 1 — INVERTED. The walk is over `UPGRADES`', '})();', "s6f")))
    steps.append(("s6", "Part 1 — `DISCOVERY_KNOWLEDGE_SET` deleted and INVERTED; coverage 32/78 -> 75/78", s6))

cur = s0
man = ["# v0.65 cumulative-prefix isolation slices — STANDING-RULINGS §9",
       "#",
       "# Built FORWARD from s0, one Part at a time, never by reverse-patching the finished file.",
       "# The proof is the last line: the final prefix is BYTE-IDENTICAL to the shipped index.html.",
       "#",
       "# §32: EVERY slice in this round is PRNG-NEUTRAL — no change alters how many Math.random()",
       "# calls a live path makes — so the whole chain is seed-for-seed comparable. s4 is the one",
       "# most likely to break that and it is proved separately by tools/prove-s4-neutral.sh.",
       "",
       "s0  v0.64 shipped file, UNCHANGED. The round's two new instruments (the knowledge-supply",
       "    block and knee._sources) live in sim/ only, so s0 is measurable with every readout",
       "    this round adds — which is what makes it a usable baseline."]
for name, desc, reps in steps:
    for old, new in reps:
        # The named knowledge set carries s1's and s3's additions by the time s6 deletes it, so
        # its span is resolved against the CHAIN's current state rather than against s0 or final.
        if old == "@@DELETE_KNOWLEDGE_SET@@":
            i = cur.index("var DISCOVERY_KNOWLEDGE_SET = [")
            j = cur.index("\n];", i) + len("\n];\n")
            cur = cur[:i] + cur[j:]
            continue
        if old not in cur:
            sys.exit("SLICE %s: pattern absent -> %r" % (name, old[:100]))
        cur = cur.replace(old, new, 1)
    open("snapshots/v65/%s.html" % name, "w").write(cur)
    man.append("%-3s %s" % (name, desc))

last = steps[-1][0]
ok = cur == final
man += ["", "%s == shipped index.html byte-for-byte: %s" % (last, ok),
        "   %-8s sha256 %s" % (last, hashlib.sha256(cur.encode()).hexdigest()),
        "   index    sha256 %s" % hashlib.sha256(final.encode()).hexdigest()]
open("snapshots/v65/README.md", "w").write("\n".join(man) + "\n")
print("\n".join(man))
if not ok:
    sys.exit("PREFIX CHAIN DOES NOT REACH THE SHIPPED FILE")
