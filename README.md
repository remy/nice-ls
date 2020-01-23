# nice ls

Makes `ls` look nice, importantly (and ideally), without changing the `ls` command.

Firstly install using `npm install --global nice-ls`, then to enable, pipe the result of `ls -l` through `nice-ls`, or add an alias:

```bash
function ls() {
  command ls -l "$@" | nice-ls
}
```

## Features

- Icons for known file and folder types
- Recently modified shown as brighter timestamps
- Readable file sizes by default
- Colour coded read/write/execute flags
- User permission are brighter than group and other
- Folder block size ignored
- Blocks hidden (never sure what they mean!)

## Screenshot

![](https://cloudup.com/cCOEpIYrakT+)

## Prerequisites

- [nerd fonts](https://nerdfonts.com/) - this is used for the icons
- iTerm: Prefs -> Profiles -> Text -> Non-ASCII Font (select nerdfont)
