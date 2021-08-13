
import { getAbsolutePath } from "../common/repo-structure"
import { getExternalTokensList } from "../common/token-lists"
import { writeToFileWithUpdate } from "../common/json"
import { externalTokensListsLinks } from "../constants/externalTokensListsLinks"

type UniqToken = {
  name: string,
  address: string,
  symbol: string,
  decimals: number,
  chainId: number,
  logoURIs: string[],
  tags: string[]
}

type UniqTokensList = {[tokenID: string]: UniqToken}


const syncUniqExternalTokensLists = async () => {

  const uniqExternalTokens: UniqTokensList = {}
  const externalTokensLists: {[tokensList: string]: any} = {}

  await Promise.all(Object.keys(externalTokensListsLinks).map(async listName => {
    try {
      const externalTokensList = await getExternalTokensList(externalTokensListsLinks[listName])
      externalTokensLists[externalTokensList.name] = externalTokensList.tokens
    } catch (error) {
      console.error(error)
    }
  }))

  Object.keys(externalTokensLists).forEach(listName => {
    console.log('tokensList: ', listName, externalTokensLists[listName].length)
    externalTokensLists[listName].forEach((token: any) => {
      const { name, address, symbol, decimals, chainId, logoURI } = token

      if (!name || !symbol || !address || (!decimals && decimals !== 0) || !chainId || !logoURI) {
        return console.error(`Token haven't some prop for add to tokens list: ${JSON.stringify(token, null, 2)}`)
      }

      const tokenID = `${symbol}--${address.toLowerCase()}`

      if (uniqExternalTokens[tokenID]) {
        uniqExternalTokens[tokenID].logoURIs.push(logoURI)
        uniqExternalTokens[tokenID].tags.push(listName.toLowerCase())
      } else {
        uniqExternalTokens[tokenID] = {
          name,
          address,
          symbol,
          decimals,
          chainId,
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