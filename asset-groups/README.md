```
{
  'symbol': 'BTC',
  'name': 'Bitcoin',
  'logo': '/networks/bitcoin/coins/BTC/logo.svg',
  'asset-list': [
    '/networks/bitcoin/coins/BTC/info.json',
    '/networks/avalanche-c/tokens/WBTC--0x408d4cd0adb7cebd1f1a1c33a0ba2098e1295bab/info.json',
     ...
  ]
}
```

`symbol`, `name`, `logo` - main information

Full information - first element of `asset-list` array

Priority - in order in list (also have network priority, first - ethereum, second - bsc etc.)