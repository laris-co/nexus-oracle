#!/usr/bin/env bash
# fb-read — Extract text from public Facebook posts
# Usage: fb-read <facebook-post-url>
# Part of Nexus Oracle toolkit

set -euo pipefail

URL="${1:?Usage: fb-read <facebook-post-url>}"

# URL-encode the FB post URL
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$URL', safe=''))")

# Fetch via embed plugin (public, no token needed)
EMBED_URL="https://www.facebook.com/plugins/post.php?href=${ENCODED}&show_text=true&width=500"

curl -sL "$EMBED_URL" | python3 -c "
import sys, html, re

content = sys.stdin.read()

# Extract userContent div
match = re.search(r'userContent.*?>(.*?)</div>', content, re.DOTALL)
if not match:
    print('ERROR: Could not extract post content. Post may not be public.')
    sys.exit(1)

text = match.group(1)

# Strip HTML tags, decode entities
text = re.sub(r'<[^>]+>', '\n', text)
text = html.unescape(text)
text = re.sub(r'\n{3,}', '\n\n', text).strip()

# Extract hashtags
hashtags = re.findall(r'#\w+', text)

print(text)
if hashtags:
    print()
    print('---')
    print('Tags:', ' '.join(hashtags))
"
