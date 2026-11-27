# Pip & Paw · A Spots companion

**1.0.0-rc.12**

**[Open the app](https://bibobrain.github.io/spots-table-companion/)** · **[Download the offline ZIP](https://github.com/bibobrain/spots-table-companion/releases/download/v1.0.0-rc.12/PipAndPaw_1.0.0-rc12.zip)**

A free, unofficial tabletop companion for CMYK’s **Spots**. Build your dog cards, compare the next roll, and keep a record of the game you are playing. English section names, bilingual Action names, Chinese explanations, and original Dalmatian illustrations. No account or installation.

## At the table

1. **Build your dogs.** Open **添加狗牌** for a compact palette that unfolds to the left of the button when space permits. Choose 1–4 die faces, then confirm to create a dog. Repeated faces are separate spaces: choosing 4 twice creates two 4-point spaces. Closing the palette keeps your selection for the next opening, and the table stays in place. Keep up to six dog cards in the game, including scored cards.
2. **Match the table.** Tap a space on a dog to mark it filled or empty. This corrects the displayed board without recording a roll. Set **Yard** to the total buried points, and set **Dice** and **Bones**. The small status beside the Yard heading follows the total. Across 0–7, the Dalmatian naps, explores, sniffs, digs, discovers a bone, and plays. Seven points remains a valid total.
3. **Choose a plan.** **Roll** calculates an ordinary roll. In **Action**, choose **Fixed / Adjust / Filter / Chain / Bones**, then a card. Adjust its sliders or segmented choices beside the short calculation note. Both panels use your board; changing an Action setting leaves the ordinary Roll plan unchanged.
4. **Record the result.** After rolling at the table, click the observed outcome in Roll or Action before changing the displayed board: 0, 1–4, or 5+ safe fills, or **BUST**. The app freezes that plan and its outcome probability. Confirm the actual spaces filled, the resulting Yard total, and any bones spent. Some Actions instead record a bone change or a point where a new dog card is needed.
5. **Settle a bust.** Click **BUST**, then confirm. The result is recorded and the Yard and unscored dogs' placed dice are cleared. Your dog templates and scored cards remain ready for the next play.
6. **Correct a mistake.** Use **Undo** to reverse the latest change or settlement.
7. **Finish the game.** **本局** opens the current records. **结束本局** opens the game report, with totals and one idiom-style title based on the rarest eligible recorded result. You can continue the same game or start a new one.

## 中文使用说明

点「添加狗牌」，在向左展开的小组件里选 1–4 颗骰面，再确认生成狗牌；窄屏会贴着按钮调整位置。关掉后，已选骰面会留到下次打开，牌桌保持原位。同一点数可以重复选择，每一颗都对应一个独立空位，一局最多保留六张狗牌。十二种斑点狗姿态各有名字：后院巡逻队长、饼干失踪嫌疑狗、骰响也不醒……后院随 0–7 点展示打盹、巡游、闻土、刨坑、发现骨头和玩耍，7 点仍未爆掉。

直接点狗身上的空位用于校正实体桌面。实际掷完后，先点 Roll 或 Action 中对应的结果，再确认填入的位置、后院总点数和消耗的骨头。确认 BUST 会记录本次结果，并清空后院与未计分狗牌上的骰子，保留狗牌和已计分的狗。误操作可撤销。点「结束本局」查看整局战绩与一个称号；称号取自本局有有效正概率的结算中最少见的一次。浏览器只保存当前这一局，开始新局会替换它。

## Screenshots

[Backyard and dog cards](assets/preview-desktop.jpg) · [Mobile layout](assets/mobile.jpg) · [Game report, rc.10](assets/game-report.jpg)

## Probability scope

Each percentage describes an outcome under the board, Action parameters, placement choices, and reroll policy shown before settlement. The ordinary policy rerolls a batch after failing to safely fill a space; Track permits selected dice to be rerolled. The **5+** probability covers the whole category, even when you confirm a particular number of filled spaces.

The game title uses the **smallest positive probability among eligible recorded outcomes**, including busts. That percentage belongs to the selected event. Event probabilities are not multiplied into a whole-game probability or a winning percentage. Records without an applicable probability remain in the report and do not determine the title; a game with no eligible result has no rarity title.

An unknown next dog card needs its actual spaces. Dig, Dogpile, and other conditional Actions need information from the physical dice. Dice calculations assume enough dice in the shared supply. Yard artwork represents the entered total; confirm the actual buried dice when an Action requires them.

## Online and offline

Open the live page, or unzip a release and open `index.html` in a browser. Keep the accompanying `assets` directory beside it. The offline runtime uses:

- `index.html`
- `assets/game-model.js`
- `assets/settlement-model.js`
- `assets/dalmatian-poses.webp`
- `assets/puppy-actions.webp`

The browser saves **one current game** locally with `localStorage`, including its board and records. It can restore that game when local storage is available. Starting a new game replaces the saved game; there is no saved archive of previous games or account sync.

The app runs without remote scripts or tracking. Rule links open external sites. Original illustration PNGs remain in the source repository and are excluded from the offline ZIP.

## Development

Run the package and syntax checks with:

```sh
python3 tests/test_release.py
```

`node tests/test_game_model.cjs` checks the current-game model; `node tests/test_settlement_model.cjs` checks settlement feasibility against the page's probability code. The browser scripts `tests/test_two_modules.py` and `tests/test_browser_probability.py` require Chrome and Python `websockets`. See [QA_REPORT.md](QA_REPORT.md) for the checks run for this release.

## Feedback

For a bug report, include the Action name, dog faces and filled spaces, Yard total, dice, bones, parameters, and the outcome you tried to record.

## License and attribution

Original code and custom artwork are MIT-licensed. The game title, trademarks, original rules, and official artwork remain with their owners. See [LICENSE](LICENSE) and [NOTICE](NOTICE.md).

[CMYK Spots](https://www.cmyk.games/products/spots) · [Rules](https://www.rulespal.com/spots/rulebook)

