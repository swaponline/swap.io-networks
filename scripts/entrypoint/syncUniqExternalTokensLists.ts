
import { getAbsolutePath } from "../common/repo-structure"
import { sanitizeSymbol, sanitizeAddress, getExternalTokensList } from "../common/token-lists"
import { writeToFileWithUpdate } from "../common/json"
import { externalTokensListsLinks } from "../constants/externalTokensListsLinks"

type UniqToken = {
  names: string[],
  address: string,
  symbols: string[],
  decimals: number[],
  chainIds: number[],
  logoURIs: string[],
  tags: string[]
}

type UniqTokensList = {[tokenID: string]: UniqToken}


export const syncUniqExternalTokens = async () => {

  const uniqExternalTokens: UniqTokensList = {}
  const externalTokensLists: {[tokensList: string]: any} = {}

  for (const listName of Object.keys(externalTokensListsLinks)) {
    try {
      const externalTokensList = await getExternalTokensList(externalTokensListsLinks[listName])
      externalTokensLists[listName] = externalTokensList.tokens
    } catch (error) {
      console.error(error)
    }
  }

  Object.keys(externalTokensLists).forEach(listName => {
    console.log('tokensList: ', listName, externalTokensLists[listName].length)
    externalTokensLists[listName].forEach((token: any) => {
      const { name, address, symbol, decimals, chainId, logoURI } = token

      if (!name || !symbol || !address || (!decimals && decimals !== 0) || !chainId || !logoURI) {
        return console.error(`Token haven't some prop for add to tokens list: ${JSON.stringify(token, null, 2)}`)
      }

      const tokenAddress = sanitizeAddress(address)
      const tokenSymbol = sanitizeSymbol(symbol)

      if (uniqExternalTokens[tokenAddress]) {
        !uniqExternalTokens[tokenAddress].names.includes(name) && uniqExternalTokens[tokenAddress].names.push(name)
        !uniqExternalTokens[tokenAddress].chainIds.includes(chainId) && uniqExternalTokens[tokenAddress].chainIds.push(chainId)
        !uniqExternalTokens[tokenAddress].symbols.includes(tokenSymbol) && uniqExternalTokens[tokenAddress].symbols.push(tokenSymbol)
        !uniqExternalTokens[tokenAddress].decimals.includes(decimals) && uniqExternalTokens[tokenAddress].decimals.push(decimals)
        uniqExternalTokens[tokenAddress].logoURIs.push(logoURI)
        uniqExternalTokens[tokenAddress].tags.push(listName.toLowerCase())
      } else {
        uniqExternalTokens[tokenAddress] = {
          names: [name],
          address: tokenAddress,
          symbols: [tokenSymbol],
          decimals: [decimals],
          chainIds: [chainId],
          "logoURIs": [logoURI],
          "tags": [listName.toLowerCase()]
        }
      }
    })
  })

  console.log('uniqExternalTokens length', Object.keys(uniqExternalTokens).length)

  writeToFileWithUpdate(getAbsolutePath(`/cache`), 'uniqExternalTokens.json', uniqExternalTokens)
}

syncUniqExternalTokens()