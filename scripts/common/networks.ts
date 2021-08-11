import {
  getNetworkPath,
  getNetworkInfoPath,
} from "../common/repo-structure"
import {
  isPathExistsSync
} from "../common/filesystem"
import { readJsonFile, formatJson } from "../common/json"

interface IGetFullNetworkInfoParams {
  network: string,
  extendedNetworkInfo?: { [name: string]: any } | null,
  cycleExtendDetector?: { [network: string]: boolean }
}

export const getFullNetworkInfo = (params: IGetFullNetworkInfoParams): any => {
  const {
    network,
    extendedNetworkInfo = null,
    cycleExtendDetector = {}
  } = params

  const networkInfo = extendedNetworkInfo || getNetworkInfo(network)

  if (networkInfo.parent) {
    if (cycleExtendDetector[networkInfo.parent]) {
      throw new Error(`Cycle extend config detected`)
    } else {
      const parentInfo = getNetworkInfo(networkInfo.parent)
      const extendedInfo = {
        ...parentInfo,
        ...networkInfo,
        parent: parentInfo.parent,
      }
      if (extendedInfo.parent) {
        cycleExtendDetector[networkInfo.parent] = true
        return getFullNetworkInfo({
          network: extendedInfo.slug,
          extendedNetworkInfo: extendedInfo,
          cycleExtendDetector
        })
      } else {
        return extendedInfo
      }
    }
  } else {
    return networkInfo
  }
}

export const getNetworkInfo = (network: string): any => {
  const networkPath = getNetworkPath(network)
  if (isPathExistsSync(networkPath)) {
    const networkInfoPath = getNetworkInfoPath(network)
    return readJsonFile(networkInfoPath)
  } else {
    throw new Error(`Can't find ${network} network`)
  }

}