import {
  getAbsolutePath,
  allNetworks,
  getNetworkPath,
  getNetworkLogoPaths,
  getNetworkTokenInfoPath,
  getNetworkTokensPath,
  getNetworkTokenPath,
  getNetworkTokenLogoPaths,
  tokenFolderAllowedFiles,
  getNetworkFolderFilesList,
  networkFolderAllowedFiles,
  getNetworkInfoPath,
  getLogoExtensioFromUrl,
} from "../common/repo-structure"
import {
  readDirSync,
  isPathExistsSync,
  createDirSync,
  saveLogo
} from "../common/filesystem"
import { readJsonFile, writeJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"
import { getFullNetworkInfo } from "../common/networks"
import { sanitizeSymbol, sanitizeAddress } from "../common/token-lists"

type UniqToken = {
  names: string[],
  address: string,
  symbol: string,
  decimals: number,
  chainIds: number[],
  logoURIs: string[],
  tags: string[]
}

type tokenInfo = {
  name: string,
  address: string,
  symbol: string,
  decimals: number,
  chainId: number,
  "logo": string,
  "tags": string[]
}

type UniqTokensListObj = {[tokenID: string]: UniqToken}
type NetworkTokensListObj = {[tokensID: string]: tokenInfo}

const syncUniqTokensWithNetworks = async () => {
  const networksWithTokensIDs: {[network: string]: string[]} = {}
  const networksIndexesBySlug: {[network: string]: number} = {}

  const evmNetworksFullInfo = allNetworks
    .map(network => getFullNetworkInfo({ network }))
    .filter(network => network.type === 'evm')
    .map((network, index) => {
      networksWithTokensIDs[network.slug] = []
      networksIndexesBySlug[network.slug] = index
      return network
    })

  const uniqExternalTokens = readJsonFile(getAbsolutePath(`/cache/uniqExternalTokens.json`)) as UniqTokensListObj
  const uniqExternalTokensIDs = Object.keys(uniqExternalTokens)

  if (!uniqExternalTokensIDs.length)
    throw new Error('Firstly, you need run "npm run syncExternalTokens" script in terminal for fetching uniqExternalTokens')

  uniqExternalTokensIDs.forEach(tokenID => {
    const { chainIds } = uniqExternalTokens[tokenID]
    chainIds.forEach(chainId => {
      const networkIndex = evmNetworksFullInfo.findIndex(network => +network.chainId === chainId)
      const tokenNetwork = networkIndex !== -1 && evmNetworksFullInfo[networkIndex]
      if (tokenNetwork) networksWithTokensIDs[tokenNetwork.slug].push(tokenID)
    })
  })

  for (const network of Object.keys(networksWithTokensIDs)) {
    if (!networksWithTokensIDs[network].length) continue
    try {
      await updateTokensByNetwork(evmNetworksFullInfo[networksIndexesBySlug[network]], networksWithTokensIDs[network], uniqExternalTokens)
    } catch (error) {
      console.error(error)
    }
  }

}

const updateTokensByNetwork = async (networkInfo: any, networkUniqExternalTokensIDs: string[], uniqExternalTokens: UniqTokensListObj) => {
  const network = networkInfo.slug
  console.log(`${networkInfo.name} have:`)
  console.log(`   ${networkUniqExternalTokensIDs.length} external tokens`)

  const tokensIDs: string[] = []
  const tokens: NetworkTokensListObj = {} // need for update tokens

  // Check exsists tokens
  const tokensPath = getNetworkTokensPath(network)
  if (isPathExistsSync(tokensPath)) {
    tokensIDs.push(...readDirSync(tokensPath))
    tokensIDs.forEach(tokenID => {
      const logoPaths = getNetworkTokenLogoPaths(network, tokenID)
      const logoExists = !!logoPaths.filter(logoPath => isPathExistsSync(logoPath)).length
      const infoFullPath = getNetworkTokenInfoPath(network, tokenID)
      const infoExists = isPathExistsSync(infoFullPath)
      if (infoExists) {
        const tokenInfo = readJsonFile(infoFullPath) as tokenInfo
        if (!logoExists) tokenInfo.logo = ''
        tokens[tokenID] = tokenInfo
      }
    })
  } else{
    console.log(`${network} have not tokens folder. Script creates it...`)
    createDirSync(tokensPath)
  }

  const exsistsTokensIDs: string[] = []
  const exsistsTokensAddresses: string[] = []

  Object.keys(tokens).forEach(tokensID => {
    const [symbol, address] = tokensID.split("--")
    exsistsTokensAddresses.push(sanitizeAddress(address))
    exsistsTokensIDs.push(tokensID)
  })

  console.log(`   ${exsistsTokensIDs.length} tokens in self folder`)

  // Add new tokens
  const addedTokens: string[] = []
  const alreadyExistsTokens: string[] = []

  for (const tokenID of networkUniqExternalTokensIDs) {
    const { names, address, symbol, decimals, chainIds, logoURIs } = uniqExternalTokens[tokenID]

    if ((!names || !names.length) || !symbol || !address || (!decimals && decimals !== 0) || (!chainIds || !chainIds.length)) {
      console.error(`Token haven't some prop for add to network tokens list: ${tokenID}`)
      continue
    }

    if (!chainIds.includes(+networkInfo.chainId)) {
      console.error(`Token ${tokenID} from different network`)
      continue
    }

    const tokenAddress = sanitizeAddress(address)

    if (exsistsTokensAddresses.includes(tokenAddress)) {
      alreadyExistsTokens.push(tokenID)
      continue // need add logic for exists tokens
    } else {
      const tokenPath = `/networks/${networkInfo.slug}/tokens/${tokenID}`
      createDirSync(getAbsolutePath(tokenPath))

      let logoPath = ''
      if (logoURIs.length) {
        for (const logoURI of logoURIs) {
          const logoExtension = getLogoExtensioFromUrl(logoURI)
          logoPath = `${tokenPath}/logo.${logoExtension}`
          try {
            await saveLogo(logoURI, getAbsolutePath(logoPath))
            break
          } catch (error) {
            logoPath = ''
          }
        }
      }

      const tokenInfo: tokenInfo = {
        name: names[0],
        address: tokenAddress,
        symbol,
        decimals,
        chainId: +networkInfo.chainId,
        "logo": logoPath,
        "tags": [networkInfo.tokensType.toLowerCase()]
      }

      writeJsonFile(getAbsolutePath(`${tokenPath}/info.json`), tokenInfo)

      addedTokens.push(tokenID)
    }
  }

  console.log(`   ${addedTokens.length} added tokens`)
  console.log(`   ${alreadyExistsTokens.length} already exists tokens`)

  // Update allowed tokens list
  const allowedTokens = [...exsistsTokensIDs, ...addedTokens]

  const networkPath = getNetworkPath(network)
  const allowlistName = 'allowlist.json'

  checkFile(networkPath, allowlistName, [])
  writeToFileWithUpdate(networkPath, allowlistName, allowedTokens)

}

syncUniqTokensWithNetworks()