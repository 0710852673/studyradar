<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Optional activity metrics use device-local per-account affirmative consent and existing nullable activity columns with coarse labels only; security audit logging stays separate to protect core authentication.
- Pending signup consent uses versioned, short-lived session storage; legacy silently recorded consent must never authorize a new consent write.
