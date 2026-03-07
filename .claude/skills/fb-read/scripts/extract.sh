#!/usr/bin/env bash
# Extract text from public Facebook posts via the embed plugin endpoint.
# Usage: extract.sh <facebook-post-url>
#
# How it works: Facebook's embed plugin renders public posts as HTML without
# requiring authentication. We fetch that HTML and extract the text from the
# userContent div, stripping tags and decoding HTML entities.
set -euo pipefail

URL="${1:?Usage: extract.sh <facebook-post-url>}"

# URL-encode safely via Python to avoid shell injection
ENCODED=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$URL")
EMBED_URL="https://www.facebook.com/plugins/post.php?href=${ENCODED}&show_text=true&width=500"

curl -sL "$EMBED_URL" | python3 -c "
import sys, html, re

content = sys.stdin.read()
if not content:
    print('ERROR: Empty response from Facebook. Check your network connection.')
    sys.exit(1)

match = re.search(r'userContent.*?>(.*?)</div>', content, re.DOTALL)
if not match:
    print('ERROR: Could not extract post content. The post may not be public, or Facebook changed their embed markup.')
    sys.exit(1)

text = match.group(1)
text = re.sub(r'<[^>]+>', '\n', text)
text = html.unescape(text)
text = re.sub(r'\n{3,}', '\n\n', text).strip()

hashtags = re.findall(r'#\w+', text)

print(text)
if hashtags:
    print()
    print('---')
    print('Tags:', ' '.join(hashtags))
"
