import {
  getAbsolutePath,
  allNetworks,
} from "../common/repo-structure"
import { getFullNetworkInfo } from "../common/networks"
import { readJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"


const updateNetworks = () => {
  const distPath = getAbsolutePath('/dist')
  const mainnetPath = `${distPath}/mainnet`
  const testnetPath = `${distPath}/testnet`
  const networksFileName = 'networks.json'
  const networksInfoFileName = 'networksInfo.json'

  const mainnetNetworks: string[] = []
  const mainnetNetworksInfo: NetworkFullInfo[]= []
  const testnetNetworks: string[] = []
  const testnetNetworksInfo: NetworkFullInfo[]= []

  checkFile(distPath, networksFileName, [])
  writeToFileWithUpdate(distPath, networksFileName, allNetworks)

  const networksList = readJsonFile(`${distPath}/${networksFileName}`) as string[]

  checkFile(distPath, networksInfoFileName, [])

  const networksFullInfo = networksList
    .map(network => {
      const networkFullInfo = getFullNetworkInfo({ network })
      if (networkFullInfo.isTestnet) {
        testnetNetworks.push(network)
        testnetNetworksInfo.push(networkFullInfo)
      } else {
        mainnetNetworks.push(network)
        mainnetNetworksInfo.push(networkFullInfo)
      }

      return networkFullInfo
    })

  writeToFileWithUpdate(distPath, networksInfoFileName, networksFullInfo)

  checkFile(mainnetPath, networksFileName, [])
  writeToFileWithUpdate(mainnetPath, networksFileName, mainnetNetworks)

  checkFile(mainnetPath, networksInfoFileName, [])
  writeToFileWithUpdate(mainnetPath, networksInfoFileName, mainnetNetworksInfo)

  checkFile(testnetPath, networksFileName, [])
  writeToFileWithUpdate(testnetPath, networksFileName, testnetNetworks)

  checkFile(testnetPath, networksInfoFileName, [])
  writeToFileWithUpdate(testnetPath, networksInfoFileName, testnetNetworksInfo)
}

updateNetworks()