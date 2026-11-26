# Pip & Paw · A Spots companion

**[Open the app](https://bibobrain.github.io/spots-table-companion/)** · **[Download offline ZIP](https://github.com/bibobrain/spots-table-companion/releases/download/v1.0.0-rc.6/PipAndPaw_1.0.0-rc6.zip)**

A free, unofficial tabletop probability helper for CMYK’s **Spots**. English controls, bilingual card names, and Chinese rule explanations. One HTML file; no account or installation.

## At the table

1. Set **Yard** to the sum of the dice buried in your yard. Tap a selected value again, or the reset button, for zero.
2. In **Dogs**, tap the numbers that are still empty on your physical dog cards. Repeated taps cycle through one, two, three, and zero missing spaces of that number.
3. Set **Dice** and **Bones**. **Roll** shows the chance of safely filling exactly 1–4 spaces, filling none, and busting. It starts with a short explanation until you enter dog spaces.
4. In **Action**, choose **Fixed / Adjust / Filter / Chain / Bones**. Every card in that group appears with a short effect description. Open a card for its full rule, relevant settings, and result. **Back** returns to the same group.

Changing an action leaves the ordinary Roll result unchanged. Both results use the same yard, dog spaces, dice, and bones. There is no randomly selected action on first load.

## 中文使用说明

先照着桌面设置 Yard、Dogs、Dice 和 Bones。狗身上的数字表示还缺的空位，同一个点数缺多处时连续点按。上方 Roll 始终计算普通投骰；下方 Action 先选类别，再看这一组全部卡片的简述，点具体卡片进入详情。卡名保留“嚎叫 Howl”这样的双语形式，规则与执行说明使用中文。

## Probability scope

The displayed probabilities describe the entered board and the stated dice-placement and reroll policy. They are not a whole-game winning percentage or a guarantee of optimal play. The ordinary policy rerolls a batch after failing to safely fill a space; Track permits selected dice to be rerolled.

An unknown next dog card needs its actual empty spaces. Dig, Dogpile, and some other actions require information from the physical dice. Dice-rolling calculations assume enough dice in the shared supply. Action-specific conditions appear beside their results.

## Online and offline

Open the live page, or unzip the download and open `index.html` in a browser. The app has no external script, tracking, account, or saved-state dependency. Rule links open external sites with their own policies.

## Development

The distributable app is `index.html`. Run the package and syntax checks with:

```sh
python3 tests/test_release.py
```

`tests/test_two_modules.py` covers the live interface and action states. `tests/test_browser_probability.py` compares selected results with independent probability references. Those scripts require Chrome and Python `websockets`; see [QA_REPORT.md](QA_REPORT.md) for the checks actually run for this version.

## Feedback

For a bug report, include the action name, yard total, missing dog spaces, dice, bones, action parameters, and the result you expected.

## License and attribution

Original code and custom SVG artwork are MIT-licensed. The game title, trademarks, original rules, and official artwork remain with their owners. See [LICENSE](LICENSE) and [NOTICE](NOTICE.md).

[CMYK Spots](https://www.cmyk.games/products/spots) · [Rules](https://www.rulespal.com/spots/rulebook)
