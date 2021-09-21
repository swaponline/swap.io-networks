![networks32](https://user-images.githubusercontent.com/22708849/129374679-39debe8e-ff75-46d7-a651-bd831b5646bb.png)


# swap.io-networks

The repo contains the network definitions and metadata for the supported networks and their assets.

Here is the outline of the structure of the repo:

![image](https://user-images.githubusercontent.com/22708849/134170629-0f2d19f7-b732-4732-b4d4-3467f7c25a8e.png)


# explore

You will soon be able to explore the repository on a web app:

https://networks.swap.io

### The network parameters

> This is only a template...

```
#TODO: describe all the network, coin, token and asset group meta key and value below.
```

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

