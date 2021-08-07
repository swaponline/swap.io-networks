import {
  allNetworks,
  getNetworkPath,
  getNetworkLogoPath,
  getNetworkTokenInfoPath,
  getNetworkTokensPath,
  getNetworkTokenPath,
  getNetworkTokenLogoPath,
  tokenFolderAllowedFiles,
  getNetworkFolderFilesList,
  networkFolderAllowedFiles,
} from "../common/repo-structure"
import {
  readDirSync,
  isPathExistsSync
} from "../common/filesystem"
import { readJsonFile, formatJson } from "../common/json"
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
        const logoFullPath = getNetworkTokenLogoPath(network, tokenID)
        const logoExists = isPathExistsSync(logoFullPath)
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
  const tokens: {}[] = []

  const tokensPath = getNetworkTokensPath(network)
  console.log('tokensPath', tokensPath)
  if (isPathExistsSync(tokensPath)) {
    const tokenIDs = readDirSync(tokensPath)
    console.log('tokenIDs',tokenIDs)
    tokenIDs.forEach(tokenID => {
      const logoFullPath = getNetworkTokenLogoPath(network, tokenID)
      const logoExists = isPathExistsSync(logoFullPath)
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

  if (tokens.length) console.log('tokens number', tokens.length)
  if (warnings.length) console.log('warnings', warnings)
  if (errors.length) console.log('errors', errors)

  const externalTokensList = await getExternalTokensList('https://api.borgswap.exchange/tokens.json')

  console.log('externalTokensList number', externalTokensList.tokens.length)


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

syncTokensByNetwork('binance-smart-chain')