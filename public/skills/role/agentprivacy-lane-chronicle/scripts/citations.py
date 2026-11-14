"""SPDX-License-Identifier: Apache-2.0 (agentprivacy-skills scripts)

Snapshot how the field cites a solver: every PR whose description names them, classified by lever.

    python citations.py --repo OWNER/REPO --login SOLVER --levers levers.json --out citations.json [--limit 300]

levers.json maps a lever name to a case-insensitive regex over the PR description, e.g.
    {"E8": "root.?children|PR ?#?212\\b", "credit filter": "credit filter|#608\\b"}
The solver's own PRs are excluded (author taken from the "@login" in the title on Yukon-style boards, else the PR
author). Writes the snapshot (one row per PR: number, state, author, coauthor flag, levers, merged time) and prints a
per-lever summary. The counts are counts of naming, not proof that a PR carries the lever: say so in the note.
Needs the GitHub CLI (gh) authenticated.
"""
import argparse, collections, datetime, json, re, subprocess


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--login", required=True)
    ap.add_argument("--levers", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--limit", type=int, default=300)
    a = ap.parse_args()
    levers = json.load(open(a.levers, encoding="utf-8"))
    raw = subprocess.run(["gh", "pr", "list", "-R", a.repo, "--state", "all", "--search", f"{a.login} in:body,title",
                          "--limit", str(a.limit), "--json", "number,state,title,body,author,mergedAt"],
                         check=True, capture_output=True, text=True, encoding="utf-8").stdout
    rows = []
    for p in json.loads(raw):
        m = re.search(r"@([\w-]+)", p["title"] or "")
        who = m.group(1) if m else p["author"]["login"]
        if who.lower() == a.login.lower():
            continue
        body = p["body"] or ""
        hits = sorted(k for k, rx in levers.items() if re.search(rx, body, re.I))
        co = bool(re.search(rf"[Cc]o-?authors?[^\n]{{0,400}}{re.escape(a.login)}", body)
                  or re.search(rf"Co-authored-by:[^\n]*{re.escape(a.login)}", body))
        rows.append({"n": p["number"], "s": p["state"], "who": who, "co": co, "hits": hits,
                     "at": (p["mergedAt"] or "")[:16]})
    snap = {"repo": a.repo, "login": a.login, "taken": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
            "method": "keyword match over PR descriptions naming the login", "rows": rows}
    json.dump(snap, open(a.out, "w", encoding="utf-8", newline="\n"), indent=1)
    print(f"{len(rows)} PRs by {len({r['who'] for r in rows})} solvers name {a.login}; "
          f"{sum(r['s'] == 'MERGED' for r in rows)} merged; coauthor in {sum(r['co'] for r in rows)}")
    for k in levers:
        m = [r for r in rows if k in r["hits"]]
        print(f"  {k}: {len(m)} PRs, {sum(r['s'] == 'MERGED' for r in m)} merged, solvers: "
              f"{', '.join(sorted({r['who'] for r in m}))}")
    print(f"  no lever keyword: {sum(not r['hits'] for r in rows)}")


if __name__ == "__main__":
    main()
