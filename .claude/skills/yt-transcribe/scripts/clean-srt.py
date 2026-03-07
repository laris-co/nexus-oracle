#!/usr/bin/env python3
"""Clean SRT subtitle file to plain text.

Removes timestamps, sequence numbers, and HTML tags. Deduplicates consecutive
lines that appear due to the auto-caption sliding window effect.

Usage:
    clean-srt.py [path-to-srt]

If no path given, finds the most recently modified .srt file in /tmp/.
"""
import os
import re
import sys
import glob


def find_srt():
    """Find the most recently modified SRT file in /tmp/."""
    if len(sys.argv) > 1:
        return sys.argv[1]
    files = glob.glob("/tmp/yt-*.srt")
    if not files:
        print("ERROR: No SRT file found in /tmp/. Did the download succeed?", file=sys.stderr)
        sys.exit(1)
    return max(files, key=os.path.getmtime)


def clean_srt(path):
    """Parse SRT file and return clean deduplicated text."""
    with open(path) as f:
        srt = f.read()

    lines = []
    for line in srt.split("\n"):
        line = line.strip()
        if not line:
            continue
        # Skip sequence numbers (bare integers)
        if re.match(r"^\d+$", line):
            continue
        # Skip timestamp lines (00:00:00,000 --> 00:00:03,000)
        if re.match(r"^\d{2}:\d{2}:\d{2}", line):
            continue
        # Strip HTML-style tags that YouTube sometimes includes
        line = re.sub(r"<[^>]+>", "", line)
        if line:
            lines.append(line)

    # Deduplicate consecutive identical lines (auto-caption overlap)
    clean = []
    for line in lines:
        if not clean or line != clean[-1]:
            clean.append(line)

    return "\n".join(clean)


if __name__ == "__main__":
    path = find_srt()
    print(clean_srt(path))
