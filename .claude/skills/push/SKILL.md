---
name: push
description: "דחוף, push, deploy, תעלה, תדחוף — commit, push to GitHub, build, and deploy to Firebase"
user-invocable: true
allowed-tools: Bash, Read, Glob, Grep
---

# Push & Deploy Pipeline

Run the full commit → push → build → deploy pipeline for Orot.

## Steps

### 1. Check git status
```bash
git status
```
If there are no changes (working tree clean, nothing to commit), skip to step 4.

### 2. Stage and commit
- Run `git diff --stat` and `git status` to understand what changed.
- Stage relevant files with `git add <specific files>` (avoid staging `.env*`, `node_modules/`, or other sensitive files).
- Write a concise, descriptive commit message in English summarizing the changes.
- End the commit message with: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

### 3. Sync with remote
```bash
git pull origin main --rebase
```
If there are merge conflicts, STOP and ask the user for help.

### 4. Push to GitHub
```bash
git push origin main
```

### 5. Build
```bash
npm run build
```
If the build fails, STOP and report the error. Do NOT deploy a broken build.

### 6. Deploy to Firebase
```bash
firebase deploy
```
This deploys hosting, Firestore rules, Storage rules, and indexes to project `orotoo`.

### 7. Report
Summarize:
- Commit hash (from `git rev-parse --short HEAD`)
- Files changed
- Firebase Hosting URL: https://orotoo.web.app
- Status: success or failure with details
