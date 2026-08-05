# Builder Verification Protocol (standing rule — read every session)

When implementing a multi-part BUILD SPEC, use a two-tier verification approach
instead of running the full simulation suite after every part:

1. **Per-part check (cheap):** after each spec part, run a fast, single-seed,
   short-length simulation pass — enough to catch gross regressions (crashes,
   wildly wrong numbers) with immediate attribution to the part that caused them.
   Do not run the full multi-seed, full-length pacing simulation at this stage.

2. **Final check (full rigor, once):** only after ALL parts in the spec are
   implemented, run the complete multi-seed, full-length simulation suite —
   this is the actual gate for calling the spec done, and should match whatever
   rigor the analyzer's BUILD SPEC verification KPIs require.

Never run the full multi-seed suite after each individual part — that's the
old, slow pattern and wastes hours of wall-clock time without adding rigor
that the final check doesn't already provide.

When waiting on a long-running background simulation (anything that won't
finish inside a single 10-minute tool call), poll efficiently: launch seeds
as concurrent background jobs rather than sequential ones, and don't loop
`sleep`+check more than necessary — check once, and if still running, let it
keep running in the background rather than blocking on repeated long sleeps.
