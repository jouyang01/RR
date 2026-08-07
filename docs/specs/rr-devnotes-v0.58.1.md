# DEV NOTES — off-cycle build v0.58.1

**Issued by Jerry. No analyzer spec.** Written verbatim and numbered before any implementation,
per `OFF-CYCLE-PROTOCOL.md` §2. This file is the off-cycle equivalent of `current-build-spec.md`
and is consumed the same way: **moved** to `docs/specs/rr-devnotes-v0.58.1.md` when the round
ships.

**Standing instructions attached to these notes, recorded here because they govern the round:**

- Tag **`v0.58.1`**, not `v0.59` — integers are reserved for analyzer-spec rounds.
- Verification cadence is `BUILDER_PROTOCOL.md`: a cheap single-seed check per note, the full
  multi-seed suite **once**, at the end. **The final multi-seed run is not optional.**
- These notes **supersede prior gameplay notes and any spec item that conflicts with them**.
  They **do not reopen anything in `STANDING-RULINGS.md`** — if a note appears to require that,
  **stop and flag it to Jerry** rather than deciding.
- `current-build-spec.md` at the repo root is a **consumed duplicate** of
  `docs/specs/rr-analyzer-v058-spec.md` — **delete it, do not implement it.**
- Fix `docs/analyzer-status.md`'s cycle table to match reality as part of this round.

---

## The notes, verbatim

1. Festival should not give culture as a reward and should last for one full game year (400 days). It should give some amount of gold. You should not be able to layer festivals (you can only start a new festival when the previous one is over). It should also cost Vigor. IT should have a larger culture cost and be a repetitive culture sink.
   1. Because it has a 400 day cooldown, it can give a decent amount of gold and can be a helpful way for players to get a boost of gold early.
   2. It should give you a flat 20% morale bonus, it should not make it so every comfort is counted as fully stocked.

2. Warehouses should not store hextech crystals, revert this change that I made.

3. Noxus' Chronicle on failing the trade seems incorrect "standing approves anyway" - does standing still exist for trades?

4. +Caravan should be a button that is grayed and highlighted accordingly.

5. Caravan tooltip should not show what the 5/10/15 rewards are. 5/10/15 rewards should only appear when the material/craft is already unlocked.

6. "Revelation of the aspects" should not give all options at once - it should unlock as you accumulate worship.
   1. Devotion cost for the revelations should be higher. It should force players to build more religion buildings to unlock the benefits of these revelations.

7. Drake hunt should be more expensive from a Vigor, Steel ,and Provision. IT should have a 15 minute cooldown
   1. It should also reward gold as befitting at 15 minute cooldown.

8. Baron hunt should be more expensive from a Vigor, Steel perspective. It should have a 20 minute cooldown
   1. It should give gold as befitting a 20 minute cooldown

9. Blue Sentinel and Red Brambleback should give more gold befitting a 10 minute cooldown.

10. Wanderers should have a +5/+20/+all and -5/-20/-all button for job allocation.

11. The amount of exp it takes wanderers to go from Master -> Grandmaster should double
   1. The amount of exp it takes from grandmaster -> challenger should also double.

12. Wild Hunts with no cooldown should have a +5/+20/+all  buttons for bulk hunting.

13. Marus Omegnum should only be unlocked after reaching 1500 worship.

14. Trading should have the same x/y/all as crafting in order to do bulk trades.

15. Culture max cap multipliers: Kittens ×1.05 vs. RR ×6.19 — RR's fixed-multiplier ceiling is roughly 6x larger. This needs to be fixed and have parity.

16. Faith/Devotion max cap multipliers: Kittens ×1.5 (and scoped to one building's slice only) vs. RR ×9.98 (applied to the whole cap) — RR's is roughly 6-7x larger in magnitude, and broader in scope (nothing in Kittens ever multiplies the entire Faith cap the way Solari Altar and Scholarship both do to Devotion). This needs to be fixed and have parity.

17. The transmute button should update the mana -> timber values based on craft effectiveness as well.

18. Ascending Targon's peak should consume all devotion including decimal points.

19. Jarvan leader bonus is not helpful. Wanderers arriving speed is a nonfactor. Let's switch his passive to "wanderers earn more experience" and make his leader bonus increase village production.

20. Swain leader bonus is abusable. By reducing discovery/knowledge costs, you can toggle it on and off. Let's change it but keep it knowledge focused.

21. Caitlyn's leader bonus is too similar to Twitch. Change Caitlyn's leader bonus to "every trade gives 5 renown"

22. Twitch leader bonus should increase the cargo slots chance to land by 15%/10%/5% for the 5/10/15 caravans.

23. Zilean's leader bonus should accumulate a "time warp" up to 5 minutes which would be similar to "Tempus Fugit" in Kittens (speed up by 50%). This should show up below the roster in the Champions tab.

24. Shaco's leader bonus should be changed to 20% chance to not cost Vigor.

25. Heimerdinger's leader bonus should be that crafts consume 15% less material.

26. Champions exp should be labeled (XP)

27. Bard's passive bonus should be 10%.

28. Dragon soul should only be obtained after you obtain every type of elemental dragon, not just 4. It should increase all production by 15%.

29. Infernal dragon should not increase all production, change it to affect all converters (forge, refinery, etc.) production by 5% per kill approaching 50%.

30. Training ground should not increase renown cap.

31. Let's increase how much renown each champion takes to make it a little harder to get champions at the start.
   1. Hall of Heroes gives flat Max Renown and % max renown. Let's just change it to flat max renown.
   2. Ensure that the player can still build enough renown cap to unlock all champions eventually.
   3. Renown passive gain should be very slow.

32. Jack in the Box should have diminishing morale returns once it reaches 5 or more and should have a asymptode to prevent it from raising morale out of control

33. Tomes should take some Culture to craft, morellonomicons should take knowledge to craft.

34. Trading with Piltover should result in more mana.

35. Scouting Party should take 1750 Vigor and not have this cost be reduced by anything.

36. Rift Scuttler event should scale with amount of max knowledge and Vigor so it is still meaningful to grab.

37. Change the animation banner of Mount Targon a little bit. The moon should be off to the side and be a crescent moon.

38. When there is a festival happening. The settlement animation banner should have period fireworks in the background.

39. Celestial Observatory should cost Steel instead of Ore.

40. Add in a random event: Aurelion Sol's star shard drops near your settlement. Gives knowledge and ore. Celestial observatories increase the chance of this event happening.

41. Trade to Freljord change: instead of have the timber load arriving as food. Just have provisions be an added bonus to the trade during deepwinter.

42. Jack in the box chronicle grammar issue: "Laughter echoes from the boxes at night. Some mana have gone missing. (−920)" Should be "Some mana has gone missing"

43. Trade text in chronicle should be Yellow.

44. Harbor should also cost steel.

45. Poppy leader bonus description does not need to say what it doesn't touch, only what it does.

46. Celestial Observatory initial scaffold cost is too high - let's have the first one cost 35 scaffolds.

47. The policies should have higher culture costs, the beginning ones can be the same price but the ones towards the end should scale and force the player to build culture cap buildings.

48. Hexdraulics should unlock a building similar to the Kitten's "Factory." It should be a building that doesn't do anything to start, but unlocks discoveries that upgrade the building.
   1. It should use hextech crystals as a fuel source.
   2. It should have 3 discoveries: A) Reduces the amount of hextech crystals consumed to power. B) Slowly prints parchment (.005 produces parchment/second) C) Automatically crafts some materials once per year (beams, slabs, gears, iron plating)
