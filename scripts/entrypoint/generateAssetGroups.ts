import {
  getAbsolutePath,
  customAssetGroups,
  getAssetGroupInfoPath,
} from "../common/repo-structure"
import {
  isPathExistsSync
} from "../common/filesystem"
import { readJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"
import { getFullNetworkInfo } from "../common/networks"

type UniversalObj = {
  [key: string]: any
}

type AssetInfo = {
  name: string
  symbol: string
  logo: string
  type?: "coin" | "token"

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

type NetworkWithAssets = {
  network: AssetNetworkInfo
  assets: AssetInfo[]
}

type AssetGroup = {
  symbol: string,
  name: string,
  logo: string,
  priority: number
  networks: NetworkWithAssets[]
}

type tokenInfo = {
  name: string
  address: string
  symbol: string,
  decimals: number
  chainId: number
  logo: string
  tags: string[]
}

type NetworkTokensListObj = {[tokensID: string]: tokenInfo}

type CustomAssetGroup = {
  symbol: string
  name: string
  logo: string
  "asset-list": string[]
}


const generateAssetGroups = () => {
  const distPath = getAbsolutePath('/dist')
  const mainnetPath = `${distPath}/mainnet`
  const testnetPath = `${distPath}/testnet`
  const networksInfoFileName = 'networksInfo.json'
  const assetGroupsFileName = 'assets-groups.json'

  const mainnetNetworksInfoList = readJsonFile(`${mainnetPath}/${networksInfoFileName}`) as UniversalObj[]
  const testnetNetworksInfoList = readJsonFile(`${testnetPath}/${networksInfoFileName}`) as UniversalObj[]

  const mainnetNetworkInfoBySlug: UniversalObj = {}
  const mainnetNetworkPriorityBySlug: {[network: string]: number} = {}

  mainnetNetworksInfoList
    .sort((a,b) => a.priority - b.priority)
    .forEach((networkInfo, index) => {
      mainnetNetworkPriorityBySlug[networkInfo.slug] = index
      mainnetNetworkInfoBySlug[networkInfo.slug] = networkInfo
    })

  // console.log('mainnetNetworksInfoList', mainnetNetworksInfoList)
  // console.log('testnetNetworksInfoList', testnetNetworksInfoList)
  const customAssetGroupsInfo: CustomAssetGroup[] = customAssetGroups.map(assetGroup => {
    console.log('customAssetGroups', customAssetGroups)
    const assetGroupInfoPath = getAssetGroupInfoPath(assetGroup)

    if (isPathExistsSync(assetGroupInfoPath))
      return readJsonFile(assetGroupInfoPath)
  })

  const mainnetCustomAssetGroups: AssetGroup[] = []
  const mainnetAssetGroups: AssetGroup[] = []
  const testnetAssetGroups: AssetGroup[] = []

  customAssetGroupsInfo.forEach(customAssetGroup => {
    // console.log('assetGroup', assetGroup)
    const {
      symbol,
      name,
      logo,
      "asset-list": assetList
    } = customAssetGroup

    const mainAssetRelativePath = assetList[0]
    const mainAssetNetworkSlug = getNetworkSlugByAssetRelativePath(mainAssetRelativePath)

    const networksWithAssets: NetworkWithAssets[] = []

    assetList.forEach(assetRelativePath => {
      const assetNetworkSlug = getNetworkSlugByAssetRelativePath(assetRelativePath)

      const networkWithAssetsIndex =
        networksWithAssets
          .findIndex(networkWithAssets => networkWithAssets.network.slug === assetNetworkSlug)

      const isAlreadyHaveNetwork = networkWithAssetsIndex !== -1

      const assetAbsolutePath = getAbsolutePath(assetRelativePath)
      const assetInfo = readJsonFile(assetAbsolutePath)

      if (!assetInfo.type) assetInfo.type = "token"

      const fullAssetInfo = assetInfo as AssetInfo

      if (isAlreadyHaveNetwork) {
        return networksWithAssets[networkWithAssetsIndex].assets.push(fullAssetInfo)
      }

      const assetNetworkInfo = getAssetNetworkInfoBySlug(assetNetworkSlug)

      networksWithAssets.push({
        network: assetNetworkInfo,
        assets: [fullAssetInfo]
      })
    })

    const assetGroup: AssetGroup = {
      symbol,
      name,
      logo,
      priority: mainnetNetworkPriorityBySlug[mainAssetNetworkSlug],
      networks: networksWithAssets
    }
    // console.log('mainAssetNetworkSlug', mainAssetNetworkSlug)

    mainnetCustomAssetGroups.push(assetGroup)
  })

  mainnetAssetGroups.push(...mainnetCustomAssetGroups.sort((a,b) => a.priority - b.priority))

  checkFile(mainnetPath, assetGroupsFileName, [])
  writeToFileWithUpdate(mainnetPath, assetGroupsFileName, mainnetAssetGroups)


  // checkFile(testnetPath, assetGroupsFileName, [])
  // writeToFileWithUpdate(testnetPath, assetGroupsFileName, testnetAssetGroups)
}

const getNetworkSlugByAssetRelativePath = (relativePath: string): string => relativePath.split('/')[2]

const getAssetNetworkInfoBySlug = (network: any): AssetNetworkInfo => {
  const networkInfo = getFullNetworkInfo({ network })
  const mainNetworkCoinPath = getAbsolutePath(networkInfo.coins[0])
  const mainNetworkCoinInfo = readJsonFile(mainNetworkCoinPath) as AssetInfo

  return {
    name: networkInfo.name,
    slug: networkInfo.slug,
    logo: mainNetworkCoinInfo.logo
  }
}

generateAssetGroups()