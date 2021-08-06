import * as path from "path"
import {
  isPathExistsSync,
  readDirSync
} from "./filesystem"

export const logoName = `logo`
export const infoName = `info`
export const logoExtension = "svg"
export const jsonExtension = "json"
export const logoFullName = `${logoName}.${logoExtension}`
export const infoFullName = `${infoName}.${jsonExtension}`
const tokenList = `tokenlist.${jsonExtension}`

export const tokenFolderAllowedFiles = [logoFullName, infoFullName]
export const networkFolderAllowedFiles = [
  "tokens",
  tokenList,
  logoFullName,
  infoFullName
]

export const networksPath: string = path.join(process.cwd(), '/networks')
export const getNetworkPath = (network: string): string => `${networksPath}/${network}`
export const allNetworks = readDirSync(networksPath)
export const getNetworkInfoPath = (network: string): string => `${getNetworkPath(network)}`
export const getNetworkLogoPath = (network: string): string => `${getNetworkInfoPath(network)}/${logoFullName}`
export const getNetworkCoinInfoPath = (network: string): string => `${getNetworkInfoPath(network)}/${infoFullName}`
export const getNetworkTokensPath = (network: string): string => `${getNetworkPath(network)}/tokens`
export const getNetworkTokenPath = (network: string, token: string): string => `${getNetworkTokensPath(network)}/${token}`
export const getNetworkTokenLogoPath = (network: string, token: string): string => `${getNetworkTokenPath(network, token)}/${logoFullName}`
export const getNetworkTokenInfoPath = (network: string, token: string): string => `${getNetworkTokenPath(network, token)}/${infoFullName}`
export const getNetworkTokenlistPath = (network: string): string => `${getNetworkPath(network)}/${tokenList}`

export const isNetworkTokenInfoExistSync = (network: string, address: string): boolean => isPathExistsSync(getNetworkTokenInfoPath(network, address))

export const getNetworkFolderFilesList = (network: string): string[] => readDirSync(getNetworkPath(network))
export const getNetworkTokensList = (network: string): string[] => readDirSync(getNetworkTokensPath(network))
export const getNetworkTokenFilesList = (network: string, address: string): string[] => readDirSync(getNetworkTokenPath(network, address))