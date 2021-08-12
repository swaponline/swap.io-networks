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
import { externalTokensLists } from "../constants/externalTokensLists"
import { diff } from "jsondiffpatch"
import axios from "axios"

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

    writeJsonFile(getAbsolutePath(`${tokenPath}/info.json`), tokenInfo)
  }))

  console.log('externalFilteredTokens', externalFilteredTokens)

  if (tokensIDs.length) console.log('tokensIDs number', tokensIDs.length)
  if (tokens.length) console.log('tokens number', tokens.length)
  if (externalTokensIDs.length) console.log('externalTokensIDs', externalTokensIDs)
  if (warnings.length) console.log('warnings', warnings)
  if (errors.length) console.log('errors', errors)
}

const getExternalTokensList = (url: string) =>
  axios.get(url)
    .then(response => response.data)
    .catch(err => {
      throw new Error(`Can't fetch ${url}, error with message: ${err.message}`)
    })


const prepareUniqExternalTokensObject = async (externalTokensListsLinks: {[listName: string]: string}) => {

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

  writeToFileWithUpdate(getAbsolutePath(`/dist/tokens/uniqExternalTokens.json`), uniqExternalTokens)
}

const writeToFileWithUpdate = (filename: string, list: UniqTokensList): void => {
  let listOld
  try {
      listOld = readJsonFile(filename) as UniqTokensList
  } catch (err) {
      listOld = undefined
  }
  if (listOld !== undefined) { // add logic for diffs tokens
    const diffs = diffTokenlist(list, listOld)
    console.log('diffs', diffs)
  }
  writeJsonFile(filename, list)
}

const diffTokenlist = (listOrig1: UniqTokensList, listOrig2: UniqTokensList): unknown => {
  // deep copy, to avoid changes
  const list1 = JSON.parse(JSON.stringify(listOrig1))
  const list2 = JSON.parse(JSON.stringify(listOrig2))
  // compare
  const diffs = diff(list1, list2)
  return diffs
}

prepareUniqExternalTokensObject(externalTokensLists)

// syncTokensByNetwork('binance-smart-chain')