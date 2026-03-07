---
name: fb-read
description: "Extract and analyze public Facebook posts from a URL. Use this skill whenever the user shares a facebook.com link, asks to read a Facebook post, wants to analyze social media content from FB, or mentions checking what someone posted on Facebook. Also triggers when a URL contains facebook.com/*/posts/."
argument-hint: "[facebook-post-url]"
---

# Facebook Post Reader

Extract text content from any public Facebook post. Works without API tokens by using Facebook's embed plugin endpoint — the same mechanism browsers use to render embedded posts.

## How to use

Run the extraction script with the Facebook URL:

```bash
bash ${CLAUDE_SKILL_DIR}/scripts/extract.sh "$ARGUMENTS"
```

The script outputs the post's text content, with hashtags listed separately at the bottom.

## After extraction

Once you have the text, provide the user with:

1. **The full post text** — display it clearly
2. **Key topics** — what is the post about?
3. **Hashtags** — if present, list them
4. **Brief analysis** — who posted it, what's the main message, any links mentioned

## When things go wrong

- **"Could not extract post content"** — the post is likely not public (privacy set to friends-only or similar). Let the user know and suggest they copy-paste the text instead.
- **Empty output** — Facebook may have changed their embed markup. The script looks for the `userContent` div; if FB renames this, the regex needs updating.
- **Truncated with "See more"** — very long posts may be cut off by the embed. Mention this to the user if the text seems incomplete.

## What this can and cannot do

This reads **text only** from **public posts**. It cannot access comments, reactions, share counts, images, or videos. It also cannot read posts from private profiles or closed groups.
