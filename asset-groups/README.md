# `asset-group` object description

```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "logo": "/networks/bitcoin/coins/BTC/logo.svg",
  "asset-list": [
    "/networks/bitcoin/coins/BTC/info.json",
    "/networks/ethereum/tokens/WBTC--0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/info.json",
    "/networks/ethereum/tokens/renBTC--0xeb4c2781e4eba804ce9a9803c67d0893436bb27d/info.json",
    "/networks/binance-smart-chain/tokens/BTCB--0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c/info.json",
    "/networks/polygon/tokens/WBTC--0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6/info.json",
    "/networks/avalanche-c/tokens/WBTC--0x408d4cd0adb7cebd1f1a1c33a0ba2098e1295bab/info.json"
  ]
}
```

`symbol`, `name`, `logo` - main information

Full information - first element of `asset-list` array

Priority - in order in list (also have network priority, first - ethereum, second - bsc etc.)
