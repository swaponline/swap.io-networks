import * as path from "path"
import {
  isPathExistsSync,
  readDirSync,
  readOnlyDirSync,
} from "./filesystem"

export const logoName = `logo`
export const infoName = `info`
export const logoExtensions = ["svg", "png", "jpg", "jpeg", "SVG", "PNG", "JPG", "JPEG"]
export const jsonExtension = "json"
export const logoFullNames = logoExtensions.map(logoExtension => `${logoName}.${logoExtension}`)
export const infoFullName = `${infoName}.${jsonExtension}`
const tokenList = `tokenlist.${jsonExtension}`

export const tokenFolderAllowedFiles = [...logoFullNames, infoFullName]
export const networkFolderAllowedFiles = [
  "tokens",
  tokenList,
  ...logoFullNames,
  infoFullName
]

export const getAbsolutePath = (relativePath: string): string => path.join(process.cwd(), relativePath)

export const customAssetGroupsPath = getAbsolutePath('/asset-groups')
export const customAssetGroups = readOnlyDirSync(customAssetGroupsPath)

export const getAssetGroupPath = (assetGroup: string): string => `${customAssetGroupsPath}/${assetGroup}`
export const getAssetGroupInfoPath = (assetGroup: string): string => `${getAssetGroupPath(assetGroup)}/${infoFullName}`

export const networksPath = getAbsolutePath('/networks')
export const allNetworks = readDirSync(networksPath)

export const getNetworkPath = (network: string): string => `${networksPath}/${network}`
export const getNetworkInfoPath = (network: string): string => `${getNetworkPath(network)}/${infoFullName}`
export const getNetworkLogoPaths = (network: string): string[] => logoFullNames.map(logoFullName => `${getNetworkInfoPath(network)}/${logoFullName}`)
export const getNetworkCoinInfoPath = (network: string): string => `${getNetworkInfoPath(network)}/${infoFullName}`
export const getNetworkTokensPath = (network: string): string => `${getNetworkPath(network)}/tokens`
export const getNetworkTokenPath = (network: string, tokenID: string): string => `${getNetworkTokensPath(network)}/${tokenID}`
export const getNetworkTokenLogoPaths = (network: string, tokenID: string): string[] => logoFullNames.map(logoFullName => `${getNetworkTokenPath(network, tokenID)}/${logoFullName}`)
export const getNetworkTokenInfoPath = (network: string, tokenID: string): string => `${getNetworkTokenPath(network, tokenID)}/${infoFullName}`
export const getNetworkTokenlistPath = (network: string): string => `${getNetworkPath(network)}/${tokenList}`

export const isNetworkTokenLogoExistSync = (network: string, tokenID: string): boolean => !!getNetworkTokenLogoPaths(network, tokenID).filter(logoPath => isPathExistsSync(logoPath)).length
export const isNetworkTokenInfoExistSync = (network: string, tokenID: string): boolean => isPathExistsSync(getNetworkTokenInfoPath(network, tokenID))

export const getNetworkFolderFilesList = (network: string): string[] => readDirSync(getNetworkPath(network))
export const getNetworkTokensList = (network: string): string[] => readDirSync(getNetworkTokensPath(network))
export const getNetworkTokenFilesList = (network: string, tokenID: string): string[] => readDirSync(getNetworkTokenPath(network, tokenID))

export const getLogoExtensioFromUrl = (url: string) => {
  const firstSplitString = url.split('.')
  const firstSplit = firstSplitString[firstSplitString.length - 1]

  const secondSplitString = firstSplit.split('?')
  const secondSplit = secondSplitString[0]

  return secondSplit
}