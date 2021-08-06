import {
  allNetworks,
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
import { readJsonFile } from "../common/json"

const main = async () => {
  const errors: string[] = []
  const warnings: string[] = []
  console.log('im here')
  allNetworks.forEach(network => {
    const tokensPath = getNetworkTokensPath(network)
    console.log('tokensPath', tokensPath)
    if (isPathExistsSync(tokensPath)) {
      readDirSync(tokensPath).forEach(symbolAndAddress => {
        const logoFullPath = getNetworkTokenLogoPath(network, symbolAndAddress)
        const logoExists = isPathExistsSync(logoFullPath)
        const infoFullPath = getNetworkTokenInfoPath(network, symbolAndAddress)
        const infoExists = isPathExistsSync(infoFullPath)
        // Tokens should have a logo and an info file.  Exceptions:
        // - status=spam tokens may have no logo
        // - on some networks some valid tokens have no info (should be fixed)
        console.log('network and token', network, symbolAndAddress)
        console.log('logoExists', logoExists)
        console.log('infoExists', infoExists)
        const info: unknown = readJsonFile(infoFullPath)
        console.log('info', info)
      })
    }
  })
  console.log('errors, warnings', errors, warnings)
}

main()