# Contributing to MindCare

## Branch Naming Convention

Format: type/short-description

Types: feat/ fix/ chore/ refactor/ docs/ test/

Examples:

  feat/video-call-screen
    fix/session-timeout-crash
      chore/update-deps

      ## AI Tool Branch Naming

      When an AI tool creates a branch, rename it before opening a PR:

        claude/kind-goldstine     ->  feat/what-it-does
          copilot/abc123            ->  fix/what-it-fixes
            antigravity/xyz           ->  feat/what-it-does

            Rename command:

              git branch -m old-name new-name
                git push origin :old-name new-name

                ## PR Rules

                One PR = one feature or fix. No bundling. Keep PRs under 400 lines changed. No merge conflicts before merging. CI must pass.

                ## Commit Format

                  type(scope): short description

                    feat(call): add video call screen
                      fix(auth): resolve session timeout crash
