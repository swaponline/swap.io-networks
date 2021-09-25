import {
  getAbsolutePath,
  customAssetGroups,
  getAssetGroupInfoPath,
} from "../common/repo-structure"
import {
  isPathExistsSync
} from "../common/filesystem"
import { readJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"

type UniversalObj = {
  [key: string]: any
}

enum AssetTypes {
  "coin",
  "token"
}

type AssetInfo = {
  name: string
  symbol: string
  logo: string
  type: AssetTypes

  // "coin" type
  slug?: string
  name_plural?: string
  denominator?: number

  // "token" type
  address?: string
  decimals?: number
  chainId?: number
  tags?: string[]
}

type AssetNetworkInfo = {
  name: string
  slug: string
  logo: string
}

type AssetGroup = {
  symbol: string,
  name: string,
  logo: string,
  priority: number,
  networks: {
    network: AssetNetworkInfo
    assets: AssetInfo[]
  }[]
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

type NetworkTokensListObj = {[tokensID: string]: tokenInfo}


const generateAssetGroups = () => {
  const distPath = getAbsolutePath('/dist')
  const mainnetPath = `${distPath}/mainnet`
  const testnetPath = `${distPath}/testnet`
  const networksInfoFileName = 'networksInfo.json'
  const assetGroupsFileName = 'assets-groups.json'

  const mainnetNetworksInfoList = readJsonFile(`${mainnetPath}/${networksInfoFileName}`) as UniversalObj[]
  const testnetNetworksInfoList = readJsonFile(`${testnetPath}/${networksInfoFileName}`) as UniversalObj[]

  const mainnetNetworkInfoBySlug: UniversalObj = {}

  mainnetNetworksInfoList.forEach(networkInfo => {
    mainnetNetworkInfoBySlug[networkInfo.slug] = networkInfo
  })

  // console.log('mainnetNetworksInfoList', mainnetNetworksInfoList)
  // console.log('testnetNetworksInfoList', testnetNetworksInfoList)
  const customAssetGroupsInfo: UniversalObj[] = customAssetGroups.map(assetGroup => {
    const assetGroupInfoPath = getAssetGroupInfoPath(assetGroup)

    if (isPathExistsSync(assetGroupInfoPath))
      return readJsonFile(assetGroupInfoPath)
  })

  const mainnetAssetGroups: AssetGroup[] = []
  const testnetAssetGroups: AssetGroup[] = []

  customAssetGroupsInfo.forEach(assetGroup => {
    console.log('assetGroup', assetGroup)
    const mainAssetRelativePath = assetGroup["asset-list"][0]
    const mainAssetNetworkSlug = getNetworkSlugByAssetRelativePath(mainAssetRelativePath)
    console.log('mainAssetNetworkSlug', mainAssetNetworkSlug)
  })

  // checkFile(mainnetPath, assetGroupsFileName, [])
  // writeToFileWithUpdate(mainnetPath, assetGroupsFileName, mainnetAssetGroups)


  // checkFile(testnetPath, assetGroupsFileName, [])
  // writeToFileWithUpdate(testnetPath, assetGroupsFileName, testnetAssetGroups)
}

const getNetworkSlugByAssetRelativePath = (relativePath: string): string => relativePath.split('/')[2]

const getAssetNetworkInfo = (networkInfo: any, assetInfo: any) => ({
  name: networkInfo.name,
  slug: networkInfo.slug,
  logo: assetInfo.logo
})

generateAssetGroups()