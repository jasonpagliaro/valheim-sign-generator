# Vanilla sign compatibility

Checked **2026-10-12 (America/Denver)** against the installed Windows Steam release **Valheim 1.0.17, build 25730771**, plus official Unity documentation. Iron Gate's [1.0.17 announcement](https://www.valheimgame.com/news/patch-1-0-17/) is dated October 6, 2026. The installed `Version` initializer independently identifies version 1.0.17.

This is read-only inspection of the shipped assemblies and ordinary sign prefab, not an in-game visual acceptance test. No game files, settings, characters, or worlds were changed. Console, controller keyboards, mods, and later releases may behave differently.

## Length: 50 UTF-16 code units

**High confidence for ordinary Windows keyboard/paste input.** The ordinary `Assets/GameElements/Pieces/sign.prefab` stores `m_characterLimit = 50`. `Sign.Interact` passes that limit to `TextInput.RequestText`; `TextInput.Show` assigns the input field's `characterLimit`. `GuiInputField` inherits `TMPro.TMP_InputField`; its `Insert(Char)` rejects a new character when the existing raw `text.Length` reaches the limit.

The count includes markup, spaces, and every UTF-16 code unit in the copied string. It is neither a UTF-8 byte count nor a count of displayed symbols. .NET's [String.Length documentation](https://learn.microsoft.com/en-us/dotnet/api/system.string.length) explicitly distinguishes `Char` count from Unicode character count. JavaScript string `.length` uses the same UTF-16 units and is therefore appropriate **after generating the exact clipboard payload**.

| Input fragment | Units |
| --- | ---: |
| `A` | 1 |
| `⛏` | 1 |
| `⛏️` (with variation selector) | 2 |
| `🪵` | 2 |
| `e` followed by a combining acute accent | 2 |
| `<#E8A575>` | 9 |
| `<b>` | 3 |
| Literal backslash followed by `n` (`\n`) | 2 |
| `<#E8A575><b>⛏ COPPER` | 20 |

Count before any in-game escape replacement. Never truncate automatically: truncation can split a tag or surrogate pair. Report over-limit output and preserve the user's text. This is an input limit, not proof that the game's underlying stored string cannot hold more text through other paths.

## Formatting and defaults

The sign's `m_textWidget` is `TextMeshProUGUI`. Its serialized settings enable rich text, allow color-tag overrides, and enable escaped control-character parsing. The shipped `TMP_Text.ValidateHtmlTag` implements the tags below. Unity's [rich-text reference](https://docs.unity.cn/Packages/com.unity.textmeshpro%404.0/manual/RichText.html) documents their scope; it is supporting syntax documentation, not a claim that Valheim ships that exact package version.

| Capability | Generator policy | Evidence and limitation |
| --- | --- | --- |
| Color | Use `<#RRGGBB>` | The six-digit shorthand is accepted; `<color=#RRGGBB>` also works. The [Unity color reference](https://docs.unity.cn/Packages/com.unity.textmeshpro%404.0/manual/RichTextColor.html) documents both forms. Six-digit values preserve supplied colors without approximation. |
| Bold and italic | Emit `<b>` and `<i>` when selected | Both exist in the shipped parser. The ordinary sign already has the Bold font-style flag, so adding or omitting `<b>` need not produce the same contrast as a browser's font-weight toggle. |
| Size | Use a numeric `<size=8>`-style value | Supported by the shipped parser and [Unity size documentation](https://docs.unity.cn/Packages/com.unity.textmeshpro%404.0/manual/RichTextSize.html). Values are TMP font sizes, not website CSS pixels. |
| Closing tags | Omit unnecessary trailing closers in compact mode | An opening style applies to following text until changed or closed. Single-style labels do not need trailing `</color>`, `</b>`, or `</size>`. |
| Alignment | Offer left/center/right as advanced layout | `<align=left>`, `<align=center>`, and `<align=right>` exist in the shipped parser; [Unity's alignment reference](https://github.com/Unity-Technologies/uGUI/blob/main/com.unity.ugui/Documentation~/TextMeshPro/RichTextAlignment.md) explains paragraph scope. Center is the sign's native horizontal alignment. |
| Multiple lines | Convert editor newlines to literal `\n` in copied output | `TextInput.OnEnter` explicitly replaces literal `\n` with LF before passing text to the sign. Each copied escape costs two units. `<br>` also exists in TMP but costs four units. Avoid relying on pasted raw line breaks in the single sign-entry field. |
| Tabs | Do not offer by default | `TextInput.OnEnter` also turns literal `\t` into a tab. Its layout is difficult to approximate and consumes scarce input space. |
| Font changes | Do not promise arbitrary font selection | `<font=...>` resolves game font assets, not browser/system font names or URLs. Unity requires a loadable [font asset](https://github.com/Unity-Technologies/uGUI/blob/main/com.unity.ugui/Documentation~/TextMeshPro/RichTextFont.md). The installed game contains named Valheim fonts, but arbitrary tag-based switching was not tested in-game. |
| Other TMP tags | Exclude or clearly mark experimental | Parser presence alone is insufficient for asset-dependent sprites, gradients, materials, or reliable physical sign layout. |

The ordinary sign **auto-sizes from 1 to 8** (`m_enableAutoSizing = 1`, minimum 1, maximum 8). Its serialized current size is 7.75, base size 1, wrapping enabled, horizontal center, vertical middle. Therefore there is no fixed native baseline of 4 or 6. A Large Text preset of 8 is a sensible explicit setting, but a web preview must remain an approximation: changing text, lines, font metrics, or available width affects fit.

## Symbols and emoji

The sign uses the dynamic **Valheim-Norse** font. Its fallback chain includes `Fallback-NotoSansThin`, several Noto language fonts, and `NotoEmoji-Light SDF`. Character-map inspection of the bundled source fonts found **46 of the supplied catalog's 53 distinct symbols** in this chain. Examples present include `⛏`, `⚒`, `🪵`, `🫐`, `🥩`, `🌱`, `◆`, and `◈`. The emoji font is an outline font; colorful browser emoji are not an accurate preview of its appearance.

These seven catalog symbols were **not found in the inspected sign font chain**:

`♛` `♜` `⚿` `✦` `✧` `➤` `⬡`

The serialized TMP global fallback-font and emoji-fallback lists were empty. Its default `EmojiOne` sprite asset contains faces and does not supply these seven symbols. This is strong evidence to flag them as uncertain and suggest a fallback, but it is not a claim of visual testing on every platform or of all possible runtime font changes.

Preserve every supplied symbol in catalog data. Offer a deliberate ASCII symbol or no-symbol alternative; do not silently replace originals. Arbitrary custom emoji, joined emoji sequences, variation selectors, and symbols outside the audited set remain experimental. Even a character present in a font map is not a guarantee of exact shaping, positioning, or legibility. Unity's [fallback-font documentation](https://docs.unity.cn/Packages/com.unity.textmeshpro%404.0/manual/FontAssetsFallback.html) explains why the font chain matters.

## Safe text and preview

Generate tags from typed controls and render preview content as React text nodes with modeled styles. Never evaluate user text as HTML or use `dangerouslySetInnerHTML`.

Treat label text as literal content. Do not assume HTML entities such as `&lt;` are a general TMP escape mechanism. The shipped parser supports [the `<noparse>` scope](https://docs.unity.cn/Packages/com.unity.textmeshpro%404.0/manual/RichTextNoParse.html), but its own closing delimiter and extra length make unrestricted wrapping unsuitable as a general escaping shortcut. Visible validation for reserved angle brackets and unsupported controls is a simple, predictable policy: retain the editable input, explain the conflict, and disable incompatible formatted-copy actions. Do not silently rewrite or truncate the text.

Plain-text copy must remain distinct from generated rich text. Preview wood color, shadows, borders, icons, and CSS never enter clipboard markup. User-facing compatibility language should say that format syntax and input counting were inspected, while actual in-game font rendering can differ.

## Reproducibility

The observations above came from the installed `valheim_Data` files. Assembly method bodies were inspected through .NET metadata without calling game methods. Prefab/font properties were read with UnityPy and a generated type tree for Unity **6000.0.75f1**; source-font character maps were inspected with fontTools. Readers were installed only into a temporary research directory, not added to the web application's dependencies. No game binaries, fonts, textures, or extracted assets are distributed with this project.

| File | SHA-256 |
| --- | --- |
| `Managed/assembly_valheim.dll` | `25A0A107DCE4D834C44C2B72D0EAFD5CB7793933BDA81816ACCFA1EA9543DACE` |
| `Managed/Unity.TextMeshPro.dll` | `719A2E22767F1A9C7B92F47AEA2F58550FAE2E76189F99181757B04A3595E181` |
| `Managed/gui_framework.dll` | `90A93978C19E73F4E4A388B2BD73AFA3173160820C8767AD8FA7F89250E27866` |
| `StreamingAssets/SoftRef/Bundles/c4210710` (sign prefab) | `D3C9F4418EC1D841DE51082B4505D5F49DE11B2E0346D071C88F399427A0EC3B` |
| `StreamingAssets/SoftRef/Bundles/8d5dbad8` (fonts) | `3FB7C4A542308DD17C3E0729D0DDF37C49E1D7C635A9C60FD61861E69FC1CA0B` |

Useful inspection anchors: sign component path ID `3085058583524661730`, its text widget `-2352350397787809310`, and font asset `116976979980592072` (`Valheim-Norse`). Recheck these assumptions after a game update; object IDs and asset-bundle names may change.
