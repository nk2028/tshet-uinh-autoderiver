# Tshet-uinh Autoderiver

Tshet-uinh Autoderiver is an online linguistic tool for generating phonological reconstructions of the Qieyun system, as well as extrapolated historical and modern phonological systems derived from it.

This tool is part of the nk2028 organisation’s suite of computational linguistics projects, which aim to advance research in historical Chinese phonology and beyond.

## Try It Online

The tool is available as a web-based interface at <https://nk2028.shn.hk/tshet-uinh-autoderiver/>.

## nk2028 Libraries Used

- [tshet-uinh-js](https://github.com/nk2028/tshet-uinh-js): The core library, providing phonological position data and query interfaces for the Qieyun system.
- [tshet-uinh-examples](https://github.com/nk2028/tshet-uinh-examples): A repository of example derivation scripts covering a wide range of historical and modern phonological systems, for direct use or reference.
- [tshet-uinh-deriver-tools](https://github.com/nk2028/tshet-uinh-deriver-tools): A tooling library that encapsulates the runtime logic of derivation schemes and handles option configuration and parameter management.
- [tshet-uinh-text-label](https://github.com/nk2028/tshet-uinh-text-label): A repository of preset annotated texts that users can load with one click to quickly preview derivation output.
- [yitizi](https://github.com/nk2028/yitizi): A variant character database used to map variant forms in input text to their canonical equivalents, ensuring correct phonological lookups.

## Features

1. Supports derivation scripts for a wide range of historical and modern phonological systems, as well as user-defined custom scripts
1. English and Chinese UI
1. Preset texts that can be loaded with one click to conveniently preview derivation output
1. Side-by-side comparison of multiple derivation schemes per phonological position
1. Variant character normalisation in input text
1. Manual selection of readings for polyphonic characters based on their definitions
1. (Planned) Automatic prediction of the most likely reading for polyphonic characters

---

# 切韻音系自動推導器

切韻音系自動推導器是一個線上語言學工具，可生成切韻音系的語音擬測，以及由此衍生的歷史音系和現代方言音系。

本工具是 nk2028 組織計算語言學項目群的一部分，致力於推動漢語歷史音韻學研究。

## 在線試用

工具的網頁版本位於 <https://nk2028.shn.hk/tshet-uinh-autoderiver/>。

## 使用的 nk2028 庫

- [tshet-uinh-js](https://github.com/nk2028/tshet-uinh-js)：核心庫，提供切韻音系的音韻地位數據及查詢接口。
- [tshet-uinh-examples](https://github.com/nk2028/tshet-uinh-examples)：示例推導方案倉庫，收錄了各類歷史音系和現代方言的推導腳本，供用戶直接使用或參考。
- [tshet-uinh-deriver-tools](https://github.com/nk2028/tshet-uinh-deriver-tools)：推導工具庫，封裝了推導方案的運行邏輯，支持選項配置與方案參數管理。
- [tshet-uinh-text-label](https://github.com/nk2028/tshet-uinh-text-label)：預設標注文本倉庫，提供供用戶一鍵加載的示例文本，用於展示推導結果標注。
- [yitizi](https://github.com/nk2028/yitizi)：異體字數據庫，用於在輸入文本時將異體字映射到對應的正字，確保能正確查找音韻條目。

## 功能

1. 支援各類歷史音系和現代方言的推導腳本，以及用戶的自定義腳本
1. 支援英文和中文 UI
1. 提供供用戶一鍵加載的示例文本，可以簡便地展示推導結果
1. 支援多個推導方案的逐音韻地位對比
1. 輸入文本的異體字轉換
1. 根據釋義手動選擇多音字
1. （待實現）預測多音字最可能的發音
