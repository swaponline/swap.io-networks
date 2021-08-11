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
  writeFileSync,
  isPathExistsSync,
  saveLogo
} from "../common/filesystem"
import { readJsonFile } from "../common/json"
import { getFullNetworkInfo } from "../common/networks"
import axios from "axios"


const main = async () => {
  const errors: string[] = []
  const warnings: string[] = []
  console.log('im here')
  allNetworks.forEach(network => {
    const tokensPath = getNetworkTokensPath(network)
    console.log('tokensPath', tokensPath)
    if (isPathExistsSync(tokensPath)) {
      readDirSync(tokensPath).forEach(tokenID => {
        const logoPaths = getNetworkTokenLogoPaths(network, tokenID)
        const logoExists = !!logoPaths.filter(logoPath => isPathExistsSync(logoPath)).length
        const infoFullPath = getNetworkTokenInfoPath(network, tokenID)
        const infoExists = isPathExistsSync(infoFullPath)
        // Tokens should have a logo and an info file.  Exceptions:
        // - status=spam tokens may have no logo
        // - on some networks some valid tokens have no info (should be fixed)
        console.log('network and token', network, tokenID)
        console.log('logoExists', logoExists)
        console.log('infoExists', infoExists)
        const tokenInfo: any = readJsonFile(infoFullPath)
        console.log('tokenInfo', tokenInfo)
      })
    }
  })
  console.log('errors, warnings', errors, warnings)
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

  externalTokensList.tokens.forEach(async (token: any) => {
    const { name, address, symbol, decimals, chainId, logoURI } = token

    if (!name || !symbol || !address || !decimals || !chainId) {
      return errors.push(`Token haven't some prop for add to tokens list: ${token}`)
    }

    if (chainId !== +networkInfo.chainId) return

    const tokenID = `${symbol}--${address}`

    if (tokensIDs.includes(tokenID)) return

    const tokenPath = `/networks/${networkInfo.slug}/tokens/${tokenID}`

    let logoPath = ''
    if (logoURI) {
      const splitedLogoString = logoURI.split('.')
      const logoExtension = splitedLogoString[splitedLogoString.length - 1]
      logoPath = `${tokenPath}/logo.${logoExtension}`
      await saveLogo(logoURI, getAbsolutePath(logoPath))
    }

    const tokenInfo = {
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

    writeFileSync(getAbsolutePath(`${tokenPath}/info.json`), tokenInfo)
  })

  console.log('externalFilteredTokens', externalFilteredTokens)

  // if (tokensIDs.length) console.log('tokensIDs number', tokensIDs.length)
  // if (tokens.length) console.log('tokens number', tokens.length)
  // if (externalTokensIDs.length) console.log('externalTokensIDs', externalTokensIDs)
  // if (warnings.length) console.log('warnings', warnings)
  // if (errors.length) console.log('errors', errors)

  const tokenInfo = {
    "name": "Tether USD",
    "address": "0x55d398326f99059ff775485246999027b3197955",
    "symbol": "USDT",
    "decimals": 18,
    "chainId": 56,
    "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
    "tags": ["bep20"]
  }


}

const getExternalTokensList = async (url: string) => {
  try {
    const response = await axios.get(url)
    return response.data
  } catch (error) {
    throw new Error(error)
  }
}

// main()

syncTokensByNetwork('binance-smart-chain-testnet')