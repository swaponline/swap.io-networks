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
} from "../common/repo-structure"
import {
  readDirSync,
  isPathExistsSync,
  createDirSync,
  saveLogo
} from "../common/filesystem"
import { readJsonFile, writeJsonFile } from "../common/json"
import { getFullNetworkInfo } from "../common/networks"
import { getExternalTokensList } from "../common/token-lists"

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

type tokenInfo = {
  name: string,
  address: string,
  symbol: string,
  decimals: number,
  chainId: number,
  "logo": string,
  "tags": string[]
}

const syncUniqTokensWithNetworks = async () => {
  const evmNetworksFullInfo = allNetworks
    .map(network => getFullNetworkInfo({ network }))
    .filter(network => network.type === 'evm')

  const uniqExternalTokens = readJsonFile(getAbsolutePath(`/dist/tokens/uniqExternalTokens.json`)) as UniqTokensList
  const uniqExternalTokensIDs = Object.keys(uniqExternalTokens)
  const networksWithTokensIDs: {[network: string]: string[]} = {}

  evmNetworksFullInfo.forEach(networkInfo => {
    networksWithTokensIDs[networkInfo.slug] = []
  })

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

  Object.keys(networksWithTokensIDs).forEach(network => console.log(`${network} have ${networksWithTokensIDs[network].length} tokens`))

}


const syncTokensByNetwork = async (network: string) => {
  const errors: string[] = []
  const warnings: string[] = []

  const tokensIDs: string[] = []
  const tokens: {}[] = []

  const networkInfo = getFullNetworkInfo({ network })

  console.log('networkInfo', networkInfo)

  const tokensPath = getNetworkTokensPath(network)
  if (isPathExistsSync(tokensPath)) {
    tokensIDs.push(...readDirSync(tokensPath))
    tokensIDs.forEach(tokenID => {
      const logoPaths = getNetworkTokenLogoPaths(network, tokenID)
      const logoExists = !!logoPaths.filter(logoPath => isPathExistsSync(logoPath)).length
      const infoFullPath = getNetworkTokenInfoPath(network, tokenID)
      const infoExists = isPathExistsSync(infoFullPath)
      if (infoExists) {
        const tokenInfo: any = readJsonFile(infoFullPath)
        tokens.push(tokenInfo)
      }
    })
  } else{
    warnings.push(`${network} have not any assets`)
  }

  const externalTokensList = await getExternalTokensList('https://api.borgswap.exchange/tokens.json')

  // console.log('externalTokensList number', externalTokensList.tokens.length)

  const externalTokensIDs: string[] = []
  const externalFilteredTokens: { [name: string]: any } = {}

  await Promise.all(externalTokensList.tokens.map(async (token: any) => {
    const { name, address, symbol, decimals, chainId, logoURI } = token

    if (!name || !symbol || !address || !decimals || !chainId) {
      return errors.push(`Token haven't some prop for add to tokens list: ${token}`)
    }

    if (chainId !== +networkInfo.chainId) return

    const tokenID = `${symbol}--${address}`

    if (tokensIDs.includes(tokenID)) return

    const tokenPath = `/networks/${networkInfo.slug}/tokens/${tokenID}`
    createDirSync(getAbsolutePath(tokenPath))

    let logoPath = ''
    if (logoURI) {
      const splitedLogoString = logoURI.split('.')
      const logoExtension = splitedLogoString[splitedLogoString.length - 1]
      logoPath = `${tokenPath}/logo.${logoExtension}`
      await saveLogo(logoURI, getAbsolutePath(logoPath))
    }

    const tokenInfo: tokenInfo = {
      name,
      address,
      symbol,
      decimals,
      chainId,
      "logo": logoPath,
      "tags": [networkInfo.tokensType.toLowerCase()]
    }

    externalTokensIDs.push(tokenID)
    externalFilteredTokens[tokenID] = tokenInfo

    writeJsonFile(getAbsolutePath(`${tokenPath}/info.json`), tokenInfo)
  }))

  console.log('externalFilteredTokens', externalFilteredTokens)

  if (tokensIDs.length) console.log('tokensIDs number', tokensIDs.length)
  if (tokens.length) console.log('tokens number', tokens.length)
  if (externalTokensIDs.length) console.log('externalTokensIDs', externalTokensIDs)
  if (warnings.length) console.log('warnings', warnings)
  if (errors.length) console.log('errors', errors)
}

// syncTokensByNetwork('binance-smart-chain')
syncUniqTokensWithNetworks()