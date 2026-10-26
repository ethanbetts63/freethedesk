# Writing the openers

You are filling in the `opener` field of entries in
`C:\Users\ethan\coding\freethedesk\outreach\data\podcasts.jsonl`, one line of
JSON per podcast. Only the entries you were given, by `email`. Leave every other
line exactly as it is: other agents share this file.

The opener is the second paragraph of pitch A, straight after "Hi {first name},"
and before "I'm Ethan. I run freethedesk in Perth". It is one sentence, two at
most, about this show, written from `latest_episode_title` and
`latest_episode_description`. The reader is the host.

## The rules

- **True.** Nobody has listened to the episode, so never say or imply that
  anyone has. No "I listened", "great episode", "loved the bit where". Write
  about what the episode is about, which the description tells you: "Came
  across your episode on pricing jobs as a sole trader" or "Saw you've just
  had a conveyancer on to talk through off-the-plan contracts".
- **One thing.** Pick one specific detail from the title or description. You
  are not summarising the episode.
- **Casual and short.** Plain words, no exclamation marks, no flattery. It
  should read like a person who skimmed the show notes before writing, because
  that is what happened.
- **Blank is a fine answer.** If the description gives you nothing specific and
  honest to say, leave `opener` as `""`. The template drops the paragraph and
  the email still reads well. A vague opener is worse than none.
- Do not write the episode title verbatim. Say what it covers.
- Do not touch `subject`: there is none. Subjects belong to the templates.

## Examples

Description: "This week Mick and Dave talk through quoting: how to price a
job so you don't lose money on materials, and when to walk away."
Opener: `Came across your episode on quoting and when to walk away from a job.`

Description: "Episode 59: Love is Dead at Mayday Hills: a Beechworth collab"
Opener: `Saw your Beechworth episode on the Mayday Hills collab.`

Description: "In this episode we cover everything you need to know!"
Opener: `` (blank: there is nothing specific to point at)

## How to work

Edit the file one entry at a time, by hand, keeping each line valid JSON. Set
`PYTHONIOENCODING=utf-8` before reading the file with Python on Windows; titles
carry non-ASCII characters. When you have finished your list, stop. Do not run
`upload_prospects`; the person coordinating does that once every batch is in.
