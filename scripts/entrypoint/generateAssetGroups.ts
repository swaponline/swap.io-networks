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

type CustomAssetGroup = {
  symbol: string
  name: string
  logo: string
  "asset-list": string[]
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


const generateAssetGroups = (dataType = "mainnet") => {
  const distPath = getAbsolutePath('/dist')
  const dataPath = `${distPath}/${dataType}`
  const networksInfoFileName = 'networksInfo.json'
  const assetGroupsFileName = 'assets-groups.json'

  const assetGroups: AssetGroup[] = []

  // Preparing networks info for fast access to it
  const networksInfoList = readJsonFile(`${dataPath}/${networksInfoFileName}`) as UniversalObj[]

  const networkPriorityBySlug: {[network: string]: number} = {}
  const networkInfoBySlug: UniversalObj = {}

  networksInfoList
    .sort((a,b) => a.priority - b.priority)
    .forEach((networkInfo, index) => {
      networkPriorityBySlug[networkInfo.slug] = index
      networkInfoBySlug[networkInfo.slug] = networkInfo
    })

  // Generating custom asset-groups
  const generatedCustomAssetGroups: AssetGroup[] = []

  const customAssetGroupsInfo: CustomAssetGroup[] = customAssetGroups.map(assetGroup => {
    const assetGroupInfoPath = getAssetGroupInfoPath(assetGroup)

    if (isPathExistsSync(assetGroupInfoPath))
      return readJsonFile(assetGroupInfoPath)
  })

  customAssetGroupsInfo.forEach(customAssetGroup => {
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

      const assetInfo = getAssetInfo(assetRelativePath)

      if (isAlreadyHaveNetwork) {
        return networksWithAssets[networkWithAssetsIndex].assets.push(assetInfo)
      }

      const assetNetworkInfo = getAssetNetworkInfoBySlug(assetNetworkSlug)

      networksWithAssets.push({
        network: assetNetworkInfo,
        assets: [assetInfo]
      })
    })

    const assetGroup: AssetGroup = {
      symbol,
      name,
      logo,
      priority: networkPriorityBySlug[mainAssetNetworkSlug],
      networks: networksWithAssets
    }

    generatedCustomAssetGroups.push(assetGroup)
  })

  assetGroups.push(...generatedCustomAssetGroups.sort((a,b) => a.priority - b.priority))

  checkFile(dataPath, assetGroupsFileName, [])
  writeToFileWithUpdate(dataPath, assetGroupsFileName, assetGroups)
}

const getNetworkSlugByAssetRelativePath = (relativePath: string): string => relativePath.split('/')[2]

const getAssetNetworkInfoBySlug = (network: string): AssetNetworkInfo => {
  const networkInfo = getFullNetworkInfo({ network })
  const mainNetworkCoinPath = getAbsolutePath(networkInfo.coins[0])
  const mainNetworkCoinInfo = readJsonFile(mainNetworkCoinPath) as AssetInfo

  return {
    name: networkInfo.name,
    slug: networkInfo.slug,
    logo: mainNetworkCoinInfo.logo
  }
}

const getAssetInfo = (assetRelativePath: string) => {
  const assetAbsolutePath = getAbsolutePath(assetRelativePath)

  const assetInfo = readJsonFile(assetAbsolutePath) as AssetInfo

  if (!assetInfo.type) assetInfo.type = "token"

  return assetInfo
}

generateAssetGroups()