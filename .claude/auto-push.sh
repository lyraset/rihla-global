#!/usr/bin/env bash
# Auto-commit and push to origin/main so Vercel redeploys on every change.
# Wired to the Stop hook in .claude/settings.json — runs after each turn.
# Always exits 0: a sync problem should never block the session.
set -uo pipefail

repo="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo" || exit 0

msg() { printf '{"systemMessage": "%s"}\n' "$1"; }

# Kill switch. While this file exists nothing is committed or pushed — for work
# you want to review locally before it reaches the live site.
# Re-enable with:  rm ".claude/no-autopush"
if [ -f "$repo/.claude/no-autopush" ]; then
  msg "auto-push PAUSED (.claude/no-autopush present) — nothing committed or pushed"
  exit 0
fi

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
if [ "$branch" != "main" ]; then
  exit 0
fi

dirty="$(git status --porcelain)"
ahead="$(git rev-list --count origin/main..HEAD 2>/dev/null || echo 0)"

# Nothing to commit and nothing unpushed.
if [ -z "$dirty" ] && [ "$ahead" = "0" ]; then
  exit 0
fi

if [ -n "$dirty" ]; then
  git add -A
  count="$(git diff --cached --name-only | wc -l | tr -d ' ')"
  names="$(git diff --cached --name-only | head -3 | tr '\n' ' ' | sed 's/ $//' | sed 's/ /, /g')"
  if [ "$count" -gt 3 ]; then
    subject="chore(auto): sync $names (+$((count - 3)) more)"
  else
    subject="chore(auto): sync $names"
  fi
  if ! git commit -q -m "$subject" -m "Automated commit from the Claude Code auto-push hook."; then
    msg "auto-push: commit failed, changes left staged"
    exit 0
  fi
fi

if git push -q origin main 2>/dev/null; then
  msg "auto-push: pushed to origin/main — Vercel redeploying"
  exit 0
fi

# Remote moved ahead; replay our commits on top and retry once.
if git pull --rebase -q origin main 2>/dev/null && git push -q origin main 2>/dev/null; then
  msg "auto-push: rebased on origin/main and pushed — Vercel redeploying"
  exit 0
fi

git rebase --abort 2>/dev/null
msg "auto-push: commit made locally but push FAILED — resolve manually with: git pull --rebase origin main && git push"
exit 0
