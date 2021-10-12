# swap.io-networks

![networks32](https://user-images.githubusercontent.com/22708849/129374679-39debe8e-ff75-46d7-a651-bd831b5646bb.png)

The repo contains the network definitions and metadata for the supported networks and their assets.

Here is the outline of the structure of the repo:

![image](https://user-images.githubusercontent.com/22708849/134170629-0f2d19f7-b732-4732-b4d4-3467f7c25a8e.png)

## Explore

You will soon be able to explore the repository with a web app:

<https://networks.swap.io>

## Docs

### The `network` info parameters

Name | Type | Default  | Description |
------ | ------ | ------ | ------ |
`type` | string | - | Type of the blockchain. (e.g. "utxo" for Bitcoin or "evm" for Binance Smart Chain ) |
`slug` | string | - | The slug that uniquely identifies the network in the networks folder. (e.g. "binance-smart-chain")|
`name` | string | - | The name of the network. (e.g. "Binance Smart Chain") |
`priority` | number | -1 | The order or priority the network should be chosen in in cases when a coin is available on separate networks. May also be used to order the network in search suggestions, and non-alphabetically sorted lists. |
`isTestnet` | boolen | false | Flag indicating that this is a testnet network. |
`coins` | Array | null | The array of coin/token info relative paths. Commonly, it have 1 item that mean of main coin of network, but sometimes it can have more than 1 item, e.g. VeChain have 2 coins, because of first is main coin and second is token that used for gas/transaction fees. |
`explorers` | Array | null | Array of network explorers. |
`parent` | string | - | The `slug` of parent blockchain. Need for get full info about network. (e.g. "ethereum" for Binance Smart Chain, because we can use similar data ("evm" type of blockchain, bip44 prefixes etc.) from Ethereum in Binance Smart Chain) |
`rpc` | Array | null | ... |
`bip44` | Object | null | ... |
`chainId` | string | - | The integer ID of the "evm" type of blockchain as a hexadecimal string. |
`tokensType` | string | - | The tokens type string of the "evm" type of blockchain. (e.g. "erc20" for Ethereum or "bep20" for Binance Smart Chain) |
`network` | Object | null | ... |
`prefix` | Object | null | ... |
`fee_max` | number | -1 | ... |
`fee_min` | number | -1 | ... |
`dust_amount` | number | -1 | ... |

### The `coin` info parameters

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`symbol` | string | - | The symbol of the coin. Usually a 3-letter capital string (e.g. `"ETH"`)
`slug` | string | - | The slug that uniquely identifies the coin.
`name` | string | -|  The name of the coin in english.
`name_plural` | string | - | The plural english name of the coin.
`denominator` | float | 1e-18 | Currency denominator.
`type` | string | "coin" | Type of asset.
`logo` | string | - | The string of the logo relative path.

```text
#TODO: describe all the token and asset group meta key and value below.
```
