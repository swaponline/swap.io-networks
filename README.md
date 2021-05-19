# swap.io-networks

The repo contains the network definitions and
 metadata for the different cryptocurrencies, 
 tokens and their networks.

## networks.json

This file lists all the blockchain networks, with their key characteristics used to:

- derive keys
- format keys and addresses
- sign transactions and messages

Networks' testnets are treated as separate entities.

The networks are represented as json objects within one root
object with keys as unique slugs for each network (e.g. `bitcoin-testnet`) and values
as the network objects with the different net parameters.

Here is what a bitcoin key-value looks like:

```json

{

  "ethereum": {
    "name": "Ethereum network",
    "is_test_net": false,
    "is_ethereum": true,
    "priority": 2,
    "coin": {
      "symbol": "ETH",
      "cmc_id": 1027,
      "slug": "ether",
      "name": "ether",
      "name_plural": "ether",
      "denominator": 1e-18
    },
    "bip32": {
      "bip44": {
        "default": true,
        "purpose": "44'",
        "cointype": "60'"
      }
    },
    "prefixes": {
      "message": "\u0019Ethereum Signed Message:\n",
      "p2pkh": "00",
      "wif": "80"
    }
  },
}
```

### The network parameters

Name | Type | Default | Description | 
------ | ------ | ------ | ------ |
`name` | string | - | The name of the network. (e.g. `"Bitcoin Network"`) 
`is_testnet` | boolean | false | Flag indicating that this is a testnet network.  
`is_ethereum` | boolean | false | Flag indicating that this is an ethereum-like network. Ethereum networks have common address and private key formats in hex format. 
`priority` | integer | 99999 | The order or priority the network should be chosen in in cases when a coin is available on separate networks. May also be used to order the network in search suggestions, and non-alphabetically sorted lists.
`coin` | Object | null | This object describes the main cryptocurrency of the network.
`bip32` | Object | inherited from `bitcoin` | This object describes how sub keys and addresses must be derived. By default the object should inherit bitcoin settings.
`prefixes` | Object | injerited from `bitcoin` | This object lists different prefixes used to format keys and addresses of the network.
`keys_wif` | Array | inherited from `bitcoin` | This array lists objects with private and public wif key formatting parameters

#### `coin` Object

Name | Type | Default | Description | 
------ | ------ | ------ | ------ |
`symbol` | string | - | The symbol of the coin. Usually a 3-letter capital string (e.g. `"ETH"`) 
`slug` | string | null | The slug that uniquely identifies the coin in coins.js.
`name` | string | null|  Lower case name of the coin in english.
`name_plural` | string | null | Lower case plural enlish name of the coin.
`denominator` | float | 1e-18 | Currency denominator.

