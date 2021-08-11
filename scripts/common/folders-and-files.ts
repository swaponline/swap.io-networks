import {
  readDirSync,
  isPathExistsSync
} from "../common/filesystem"
import { CheckStepInterface, ActionInterface } from "../common/interface"
import {
  allNetworks,
  getNetworkLogoPaths,
  getNetworkTokenInfoPath,
  getNetworkTokensPath,
  getNetworkTokenPath,
  getNetworkTokenLogoPaths,
  tokenFolderAllowedFiles,
  getNetworkFolderFilesList,
  networkFolderAllowedFiles,
} from "../common/repo-structure"
import { isLowerCase } from "../common/types"
import { readJsonFile } from "../common/json"

const PromiseEach = async function(arr, cb) { // take an array and a callback
  for(const item of arr) await cb(item)
}

export class FoldersFiles implements ActionInterface {
  getName(): string { return "Folders and Files" }

  getSanityChecks(): CheckStepInterface[] {
    return [
      {
        getName: () => { return "Network folders are lowercase, contain only predefined list of files"},
        check: async () => {
          const errors: string[] = []
          allNetworks.forEach(network => {
            if (!isLowerCase(network)) {
              errors.push(`Network folder must be in lowercase "${network}"`)
            }
            getNetworkFolderFilesList(network).forEach(file => {
              if (!(networkFolderAllowedFiles.indexOf(file) >= 0)) {
                errors.push(`File '${file}' not allowed in network folder: ${network}`)
              }
            })
          })
          return [errors, []]
        }
      },
      {
        getName: () => { return "Network folders have logo"},
        check: async () => {
          const errors: string[] = []
          await PromiseEach(allNetworks, async (network) => {
            const networkLogoPaths = getNetworkLogoPaths(network)
            const logoExists = !!networkLogoPaths.filter(networkLogoPath => isPathExistsSync(networkLogoPath)).length
            if (!logoExists) {
              errors.push(`File missing at paths: "${networkLogoPaths.join(", ")}"`)
            }
          })
          return [errors, []]
        }
      },
      {
        getName: () => { return "Token folders contain logo and info"},
        check: async () => {
          const errors: string[] = []
          const warnings: string[] = []
          allNetworks.forEach(network => {
            const tokensPath = getNetworkTokensPath(network)
            if (isPathExistsSync(tokensPath)) {
              readDirSync(tokensPath).forEach(address => {
                const logoFullPaths = getNetworkTokenLogoPaths(network, address)
                const logoExists = !!logoFullPaths.filter(logoFullPath => isPathExistsSync(logoFullPath)).length
                const infoFullPath = getNetworkTokenInfoPath(network, address)
                const infoExists = isPathExistsSync(infoFullPath)
                // Tokens should have a logo and an info file.  Exceptions:
                // - status=spam tokens may have no logo
                // - on some networks some valid tokens have no info (should be fixed)
                if (!infoExists || !logoExists) {
                  if (!infoExists && logoExists) {
                    const msg = `Missing info file for token '${network}/${address}' -- ${infoFullPath}`
                    // enforce that info must be present (with some exceptions)
                    if (network === 'terra') {
                      //console.log(msg)
                      warnings.push(msg)
                    } else {
                      console.log(msg)
                      errors.push(msg)
                    }
                  }
                  if (!logoExists && infoExists) {
                    const info: unknown = readJsonFile(infoFullPath)
                    if (!info['status'] || info['status'] !== 'spam') {
                      const msg = `Missing logo file for non-spam token '${network}/${address}' -- ${logoFullPaths.join(", ")}`
                      console.log(msg)
                      errors.push(msg)
                    }
                  }
                }
              })
            }
          })
          return [errors, warnings]
        }
      },
      {
        getName: () => { return "Token folders contain info.json"},
        check: async () => {
          const warnings: string[] = []
          allNetworks.forEach(network => {
            const tokensPath = getNetworkTokensPath(network)
            if (isPathExistsSync(tokensPath)) {
              readDirSync(tokensPath).forEach(address => {
                const infoFullPath = getNetworkTokenInfoPath(network, address)
                if (!isPathExistsSync(infoFullPath)) {
                  warnings.push(`Missing info file for token '${network}/${address}' -- ${infoFullPath}`)
                }
              })
            }
          })
          return [[], warnings]
        }
      },
      {
        getName: () => { return "Token folders contain only predefined set of files"},
        check: async () => {
          const errors: string[] = []
          allNetworks.forEach(network => {
            const tokensPath = getNetworkTokensPath(network)
            if (isPathExistsSync(tokensPath)) {
              readDirSync(tokensPath).forEach(address => {
                const tokenFiles = getNetworkTokenPath(network, address)
                readDirSync(tokenFiles).forEach(tokenFolderFile => {
                  if (!(tokenFolderAllowedFiles.indexOf(tokenFolderFile) >= 0)) {
                    errors.push(`File '${tokenFolderFile}' not allowed at this path: ${tokensPath}`)
                  }
                })
              })
            }
          })
          return [errors, []]
        }
      },
    ]
  }
}