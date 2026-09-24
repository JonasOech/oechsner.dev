# Marketing plan — "This LLM has a Context window of 1"

_Status: draft · Owner: Jonas · Last updated: 2026-09-24_
_Post: `src/posts/2026-09-13-this-llm-has-a-context-of-1.svx` → `https://oechsner.dev/blog/this-llm-has-a-context-of-1`_

## 0. TL;DR

The post has a strong, shareable core: **a five-line pigeonhole proof that greedy decoding
must loop**, attached to a funny title and a model trained on your own lecture notes. That's
exactly the kind of thing Hacker News, r/learnmachinelearning and ML Twitter/Bluesky share.

It is **not ready to be promoted yet**, and promoting it early would hurt more than it
helps. Technical audiences read the maths closely, and right now a few errors in it would
be the top comment. So the plan runs in three phases:

1. **Ship-ready (week 0–1).** Finish the empty sections, fix the maths, generate the
   `cover.png`, put the code on GitHub.
2. **Launch (one day, a Tuesday).** Stagger HN → Reddit → social → LinkedIn over about
   36 hours, with a draft ready for each channel (§5).
3. **Long tail (weeks 2–8).** Cross-post with a canonical link, send it to newsletters,
   use the Uni Bamberg network, and link it to the fine-tuning follow-up so it becomes
   part 1 of a series.

Realistic goal: **1–3k readers in launch week, 10+ new feed subscribers, a lasting search
listing for "why greedy decoding repeats".** If HN picks it up, it could be 10× that. The
plan doesn't depend on that happening.

---

## 1. What we're selling

### 1.1 The hook, ranked by shareability

| # | Hook | Why it travels |
|---|------|----------------|
| 1 | *Greedy decoding provably ends in a loop, and it's just pigeonhole.* | A surprising claim, a short proof, and it explains something everyone has seen: LLMs repeating themselves. |
| 2 | *I trained a language model on four years of my lecture notes.* | Personal, concrete, easy to picture. Everyone wants to see the outputs. |
| 3 | *A bigram model is just a Markov chain.* | A good "aha" moment for students. Shows up well as a diagram. |
| 4 | *"This LLM has a context window of 1."* | Works as a joke in a title or thumbnail. It isn't enough on its own. |

**Lead with #1 on technical channels and #2 on social and LinkedIn.** The title (#4) stays
because it's good, but every submission title should say what the reader gets.

### 1.2 Audiences

| Segment | Where they are | What they want from the post |
|---|---|---|
| CS/ML students | r/learnmachinelearning, r/compsci, r/Studium, uni Discords, LinkedIn | An intuition for n-grams before transformers, a readable proof |
| Working engineers who use LLMs | Hacker News, Lobsters, Bluesky/Mastodon | Why repetition and temperature matter, explained from first principles |
| NLP people | r/LanguageTechnology, Bluesky NLP community | A clean small experiment; they'll check the citations to Jurafsky & Martin |
| Obsidian users | r/ObsidianMD, Obsidian forum/Discord | "I turned my vault into a language model." Connects to the Obsidian post |
| Recruiters / future employers | LinkedIn | Evidence you can do maths, code and write |

The Obsidian segment is underrated. The dataset *is* an Obsidian vault, you already have
a published Obsidian post, and that community loves "I did X with my vault" posts.

---

## 2. Phase 1 — Ship-ready (blocking)

Nothing in §3–§4 starts until every box here is ticked.

### 2.1 Finish the post

- [ ] **Dataset preparation.** It currently stops at an empty code block. Add: vault size
      (files, tokens, vocabulary size `V`), what was filtered, and how you tokenised.
- [ ] **Model training & evaluation.** *This is the section people will share.* Include:
  - [ ] 3–5 **real generated samples** from greedy, sampled and Laplace decoding side by
        side. Show the greedy loop happening, so the theorem is visible in the output.
  - [ ] Perplexity on a held-out set of notes, bigram vs. trigram vs. Laplace.
  - [ ] One figure: a small part of the bigram Markov chain (the cover already hints at
        this) or a plot of how quickly greedy runs reach a cycle, against `V`.
- [ ] **Improvement opportunities.** Currently an empty heading. Three bullets are enough
      (backoff/Kneser-Ney, subword tokens, then "this is where transformers come in").
      Link forward to the fine-tuning post.
- [ ] Add a short **TL;DR box** at the top that states the result. Skimmers from HN
      decide in 10 seconds.

### 2.2 Fix the maths before anyone else points it out

Technical readers will check this section line by line. These are the problems I found:

| Where | Problem | Fix |
|---|---|---|
| Mathematical Basics | `P(s)=∏_{w∈s} P(w)` ignores the conditioning you just introduced | `P(s)=∏_k P(w_k \mid w_{k-1})` |
| Mathematical Basics | "And $s_{w_n}$" is an unfinished sentence; `S_N` is defined and never used | Finish or delete both |
| Mathematical Basics | `P(w_n\|C)=T(w_n\|w_{n-1})/T(w_n)`: the denominator should count the **context**, not the predicted token | `/T(w_{n-1})` (this is also what your Laplace formula later assumes) |
| Theorem | `i,j ∈ ℝ` | `i,j ∈ ℕ` |
| Theorem | "repeats with an arbitrary period p: `f^{p+1}(w_i)=w_j`" | The period isn't arbitrary: `p = j − i`, and `w_{t+p} = w_t` for all `t ≥ i` (the proof already says this) |
| Lessons, point 2 | "at most \|V\| distinct texts" | Say what you mean: greedy output depends only on the seed, so there are at most \|V\| distinct outputs, one per seed |
| Markov section | "number of nodes increases … with `V^N`" | An N-gram chain has `V^{N-1}` states (the context is N−1 tokens) |
| Laplace (unigram) | `\frac{ T(w_{i} + 1}{ T(w_{n})}` has an unbalanced parenthesis and the wrong denominator | `\frac{T(w_i)+1}{M+V}` with `M` = total tokens |
| Dataset prep | `r"*/.claude/*"` is labelled a regex but is a glob. As a regex it doesn't compile (leading `*`) | Call them globs and use `fnmatch`, or write real regexes |
| Prose | "preceeding", "In this Post", "Information" | "preceding", "In this post", "information" |

It's cheap to fix these and costly if you don't: the first comment sets the tone for the
whole thread.

### 2.3 Technical launch hygiene

- [ ] **Run `npm run og` and commit `static/img/markov/cover.png`.** Right now it doesn't
      exist, so every shared link (LinkedIn, X, Bluesky, Slack, Discord) shows up with **no
      preview image**. `Seo.svelte` already swaps `.svg` → `.png`, so only the file is
      missing. (The same applies to `hangman/` and `obsidian/`, which are live now.)
- [ ] Check the preview with LinkedIn Post Inspector and the opengraph.xyz preview after
      deploying.
- [ ] Rewrite the `summary` in the frontmatter. It's the link preview text on every
      platform. Current: *"Exploring the basics of LLMs by training a N-Gram model on my
      lecture notes"*. Suggested: *"I trained an n-gram model on four years of lecture
      notes, and proved with the pigeonhole principle why greedy decoding always ends in
      a loop."*
- [ ] Set `draft: false`. `hero: true` is already set, so it replaces Hangman as the lead
      post on the home page.
- [ ] Choose a descriptive tag. `project report` is the only one. Add `llm` and
      `machine learning` so it shows up next to the related posts in the tag filter.
- [ ] **Publish the code** as a public GitHub repo (`ngram-lecture-notes` or similar)
      with a README linking to the post. GitHub is a discovery channel, and HN and Reddit
      readers trust posts with code more.
- [ ] Try the page on a phone: KaTeX display blocks are the part most likely to overflow.
- [ ] Publish **2–3 days before** the launch day, so the page is indexed, cached and
      checked, and so the RSS subscribers you already have see it first.

---

## 3. Phase 2 — Launch day

**Suggested date: Tuesday 2026-10-06**, or the first Tuesday after winter-semester
lectures start in Bamberg if that's later (check the date), so students are around.
Tuesday–Thursday gets the most traffic on HN and Reddit. Times are in CEST.

| Time (CEST) | Channel | Action |
|---|---|---|
| 15:00 | **Hacker News** | Submit (US East Coast morning). Title in §5.1. Don't use "Show HN": that's for things people can try, not articles. Stay around for 3 hours and answer every comment. |
| 15:30 | **Lobsters** (if you have an invite) | Tags `ai`, `math`. The audience is small but careful and often feeds HN. |
| 17:00 | **Bluesky + Mastodon + X** | Thread in §5.3. The proof as images, link in the last post. |
| next day 09:00 | **LinkedIn** | Post in §5.4. European morning, and your network is German. |
| next day 16:00 | **r/learnmachinelearning** | Text post, draft in §5.2. |
| +2 days | **r/LanguageTechnology** | Same content, adjusted for NLP people: lead with perplexity and smoothing. |
| +3 days | **r/ObsidianMD** | The "my vault became a language model" angle. Link the Obsidian post too. |
| +4 days | **r/compsci** | Proof angle only. Their rules are strict: check that the post is allowed. |

**Don't:** post to more than one subreddit on the same day (it looks like spam and the
filter will remove it), ask friends to upvote (HN and Reddit both detect vote rings and
penalise them), or resubmit to HN within a few days. If it doesn't catch on, email
`hn@ycombinator.com` about the second-chance pool. It's a real thing and it works for good
posts that fell through.

**r/MachineLearning:** skip it. `[P]` posts there need to be research-level and this
would likely be removed. The communities above fit better.

---

## 4. Phase 3 — Long tail (weeks 2–8)

### 4.1 Search

The playful title contains none of the words people search for. Keep it, but make sure the
page ranks for:

- *why does greedy decoding repeat*
- *n-gram language model from scratch python*
- *bigram model markov chain*
- *laplace smoothing bigram example*

How: include these phrases naturally in the TL;DR, in the H2s (for example, "Greedy
decoding always ends in a loop" is already good) and in the summary. Submit the sitemap
(`/sitemap.xml` exists) to Google Search Console and Bing Webmaster Tools if you haven't.

### 4.2 Cross-posting (with canonical link)

- **dev.to** and **Hashnode**: repost the full text with `canonical_url` set to
  oechsner.dev so search engines credit the original. Two to three weeks after launch.
- **Medium**: optional. Use "Import a story", which sets the canonical link automatically.

### 4.3 Newsletters and curators

Send a short personal email (3 sentences plus the link) to:

- **PyCoder's Weekly** and **Python Weekly**, if the published code is Python
- **TLDR AI** (they take submissions)
- **Hacker Newsletter**, which picks from HN, so it only matters if the HN post did well

### 4.4 University network

This is your warmest audience and the one most likely to share it in person:

- Send it to the **lecturer whose notes are in the dataset**. They may share it with the
  course, and it's a good relationship to have. Ask before naming them in the post.
- **Fachschaft** / student Discord or WhatsApp groups for Applied CS in Bamberg.
- Anyone teaching NLP at Bamberg: it's a ready-made example for "why do we smooth".
- A German-language summary post on LinkedIn a week later (§5.4, shortened), since most
  of your network reads German.

### 4.5 Make it a series

The follow-up is already drafted: *"Finetuning a model on four years of lecture notes"*
uses the same dataset. Present the two as **part 1 (n-grams) and part 2 (a transformer)**:

- End this post with "Next: what happens when the context is 2,048 instead of 1", plus a
  line asking readers to subscribe to the feed.
- When part 2 comes out, every channel above gets a second visit with a reason to link
  back to part 1.

(Also rename `2026-09-10-finetuning-on-lecture-notes copy.svx`: the space and "copy" end
up in the slug.)

---

## 5. Ready-to-edit drafts

### 5.1 Hacker News title

HN removes clickbait and editorialised titles, so use the post's own title or a plain
description. Options (≤ 80 characters):

1. `This LLM has a context window of 1` (the real title; it's safest to use it as is)
2. `Greedy decoding always ends in a loop – a pigeonhole proof` (only if you change the
   post's H1 to match)

Leave a first comment right away: two sentences about what you built, what the dataset
is, and one open question (e.g. "I'm curious whether the loop-length distribution tells
you anything about the vault").

### 5.2 Reddit (r/learnmachinelearning)

> **Title:** I trained a bigram model on 4 years of my lecture notes and proved why greedy
> decoding always loops
>
> I'm a CS student and wanted to understand LLMs from the bottom up, so I built the
> simplest possible one: an n-gram model trained on my Obsidian vault of lecture notes.
>
> The part I found most interesting: if you always pick the most likely next word,
> the output *must* eventually repeat. With a finite vocabulary it's just the pigeonhole
> principle. Sampling turns it into a Markov chain and fixes that. Laplace smoothing fixes
> the next problem.
>
> Write-up with the proof, samples and perplexity numbers: <link>
> Code: <github link>
>
> Happy to hear what I got wrong. The next part fine-tunes a transformer on the same data.

(Read each subreddit's self-promotion rules first. Answer comments in the thread instead
of only linking to the post.)

### 5.3 Bluesky / Mastodon / X thread

1. My LLM has a context window of 1. I trained a bigram model on four years of lecture
   notes, and it taught me why real LLMs repeat themselves. 🧵
2. Greedy decoding = always take the most likely next word. That makes generation a
   function f: V → V, applied again and again.
3. [image: the theorem block] A finite vocabulary means that among the first |V|+1 words,
   two must be the same (pigeonhole). Since f is a function, the rest repeats forever.
4. [image: sample output where you can see the loop]
5. The fix: sample instead of taking the max. Now the model is a Markov chain.
   [image: cover / chain diagram]
6. Full write-up with smoothing, perplexity and code: <link>

Use screenshots of the rendered KaTeX blocks. They look good and nobody clicks links to
see formulas.

### 5.4 LinkedIn

> My language model has a context window of 1 word.
>
> To understand how LLMs work from the ground up, I built the simplest one there is: a
> bigram model, trained on four years of my own lecture notes.
>
> Three things I learned:
> → Always picking the most likely word *provably* ends in a loop (pigeonhole principle)
> → Adding randomness turns the model into a Markov chain
> → A finite dataset leaves out most of the language unless you smooth
>
> Write-up with proof and code: <link>
>
> #MachineLearning #NLP #ComputerScience #UniBamberg

LinkedIn ranks posts with outside links lower. A common workaround is to put the link in
the first comment, but that also costs clicks. Test both on the two posts.

---

## 6. Measurement

| Metric | Source | Launch-week target |
|---|---|---|
| Unique visitors to the post | Cloudflare Web Analytics | 1,000–3,000 |
| Referrers (which channel worked) | Cloudflare Web Analytics → Referrers | Record one line per channel in §7 |
| Feed subscribe presses | Analytics Engine `feed` index (`src/lib/track.ts`), `surface = post-footer` | 10+ |
| GitHub repo stars | GitHub | 20+ |
| HN points / Reddit upvotes | Platform | Front page / 100+ |
| Search impressions for §4.1 queries | Search Console | Non-zero by week 4 |

Take a baseline on the day before launch (normal daily visitors and feed presses) so
the launch numbers mean something. After two weeks, write down what worked in §7. The
next post's plan starts there.

---

## 7. Retrospective (fill in after launch)

| Channel | Date | Result | Notes |
|---|---|---|---|
| Hacker News | | | |
| Lobsters | | | |
| Bluesky / Mastodon / X | | | |
| LinkedIn | | | |
| r/learnmachinelearning | | | |
| r/LanguageTechnology | | | |
| r/ObsidianMD | | | |
| Newsletters | | | |
| Uni network | | | |
