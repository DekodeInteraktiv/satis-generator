## 0.3.1
- Disable spinner. It hides password input when you require it on ssh key.

## 0.3.0
- Updated dependencies
- Add more error handling.

## 0.2.0
- Added confirm changes prompt.
- List uncommited files in working tree check.
- Update unreleased title in changelog to version number.

### Breaking changes
- Default branch config was changed from `master` to `main`.

## 0.1.6
- Don't check working tree when looking for changed packages
- Register plugins in changed script.

## 0.1.5
- Let plugins set changed status.

## 0.1.4
- Use exit code 0 when there is no packages to publish.
- Use annotated tags and use `--follow-tags` on push.
- Fetch tags before zipping.

## 0.1.3
- Init debug functions

## 0.1.2
- Push tags
- Added loader when pushing tags and commit.
- Added success message.

## 0.1.1
- Use exit code 0 when no files is zipped.
- Added `--dry-run` option to publish command.
