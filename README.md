# nice ls

Makes `ls` look nice, importantly (and ideally), without changing the `ls` command.

Firstly install using `npm install --global nice-ls`, then to enable, pipe the result of `ls -l` through `nice-ls`, or add an alias:

```bash
function ls() {
  command ls -l "$@" | nice-ls
}
```

Example:

![](https://cldup.com/5MBOrCmKlP.png)

## Prerequisites

- [nerd fonts](https://nerdfonts.com/) - this is used for the icons
- iTerm: Prefs -> Profiles -> Text -> Non-ASCII Font (select nerdfont)
