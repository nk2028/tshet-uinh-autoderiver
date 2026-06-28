# 切韻音系推導器

切韻音系推導器是一個線上語言學工具，可生成切韻音系的語音擬測，以及由此衍生的歷史音系和現代方言音系。

本工具是 nk2028 組織計算語言學項目群的一部分，致力於推動漢語歷史音韻學研究。

## 在線試用

工具的網頁版本位於 <https://nk2028.shn.hk/tshet-uinh-deriver/>。

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
