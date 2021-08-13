
import { getAbsolutePath } from "../common/repo-structure"
import { getExternalTokensList } from "../common/token-lists"
import { writeToFileWithUpdate } from "../common/json"
import { externalTokensListsLinks } from "../constants/externalTokensListsLinks"

type UniqToken = {
  names: string[],
  address: string,
  symbol: string,
  decimals: number,
  chainIds: number[],
  logoURIs: string[],
  tags: string[]
}

type UniqTokensList = {[tokenID: string]: UniqToken}


export const syncUniqExternalTokensLists = async () => {

  const uniqExternalTokens: UniqTokensList = {}
  const externalTokensLists: {[tokensList: string]: any} = {}

  for (const listName of Object.keys(externalTokensListsLinks)) {
    try {
      const externalTokensList = await getExternalTokensList(externalTokensListsLinks[listName])
      externalTokensLists[externalTokensList.name] = externalTokensList.tokens
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

      const tokenID = `${symbol}--${address.toLowerCase()}`

      if (uniqExternalTokens[tokenID]) {
        !uniqExternalTokens[tokenID].names.includes(name) && uniqExternalTokens[tokenID].names.push(name)
        !uniqExternalTokens[tokenID].chainIds.includes(chainId) && uniqExternalTokens[tokenID].chainIds.push(chainId)
        uniqExternalTokens[tokenID].logoURIs.push(logoURI)
        uniqExternalTokens[tokenID].tags.push(listName.toLowerCase())
      } else {
        uniqExternalTokens[tokenID] = {
          names: [name],
          address: address.toLowerCase(),
          symbol,
          decimals,
          chainIds: [chainId],
          "logoURIs": [logoURI],
          "tags": [listName.toLowerCase()]
        }
      }
    })
  })

  console.log('uniqExternalTokens length', Object.keys(uniqExternalTokens).length)

  writeToFileWithUpdate(getAbsolutePath(`/dist/tokens`), 'uniqExternalTokens.json', uniqExternalTokens)
}


syncUniqExternalTokensLists()