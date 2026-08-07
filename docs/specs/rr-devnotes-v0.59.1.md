# DEV NOTES — v0.59.1 (off-cycle round, issued by Jerry)

Written verbatim, numbered, before anything was implemented, per `OFF-CYCLE-PROTOCOL.md` §2.
A screenshot of Kittens Game's Jobs panel accompanied note 2 and is described below the notes.

---

1. The mana discovery should affect all mana production, not just arcanists.

2. The new buttons on the wanderer page are terrible - it creates a lot of vertical scrolling
   that we want to avoid. Model it after this screenshot from kittens. Essentially there is a
   mouseover on the + and - buttons that states +5/+25/+all.

3. Get rid of Kindling Theory Research. Put the unlock condition of the Discovery Banked Coals
   into The Sump Ecology Research

4. When Sump Ecology is researched, it unlocks the Sump Crawl Wilds hunt which can reward
   coalgas and shimmer.
   1. This is not shown in the materials section.
   2. Let's switch the costs of Sump Ecology and The Chemtech Whisper so that the
      storage/production of these comes before the Wild Hunts.
   3. The SUmp Crawl should go after the Baron Nashor hunt in the UI because it is unlocked
      after.

5. When doing a bulk Hunt, the chronicle log should show the total yield, not an entry for each
   hunt.

6. True Ice Cellars should not affect anything provisions related. Make it a mana production
   enhancing discovery.

7. Hextech Manufactory should cost more crystals and the discoveries related to it should be
   more expensive. it should force the player to build more hextech refineries and allocate
   tinkerers.
   1. This will be a primary hextech crystal sink and should burn crystals accordingly.
   2. Automated Workshop discvoery should work just like the Kitten's Workshop Automation
      upgrade.

8. Masquerade should unlock Harvest Rites discovery, songcraft should not

---

## The screenshot supplied with note 2

Kittens Game's **Jobs** panel. Each job is one row: a wide name-and-count button
(`Woodcutter (42)`, `Farmer (2)`, `Scholar (13)`, `Hunter (16)`, `Miner (49)`, `Priest (4)`,
`Geologist (17)`, `Engineer (6)`), then exactly **two** small controls, `[+]` and `[−]`.

Hovering `[+]` opens a **vertical flyout beneath that one button** listing `[+5]`, `[+25]`,
`[+all]`, with a small `plus` label at its head. The flyout is an overlay — it does not push
the rows below it down, which is the whole point: **eight jobs cost eight rows, not eight rows
plus eight chip-rows.**

`Free kittens: 0 / 149` sits above the list; a single `Clear` button sits below it.
