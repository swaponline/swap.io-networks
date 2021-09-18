import {
  getAbsolutePath,
  allNetworks,
} from "../common/repo-structure"
import { getFullNetworkInfo } from "../common/networks"
import { readJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"


const updateNetworks = () => {
  const distPath = getAbsolutePath('/dist')
  const networksFileName = 'networks.json'
  const networksInfoFileName = 'networksInfo.json'

  checkFile(distPath, networksFileName, [])

  writeToFileWithUpdate(distPath, networksFileName, allNetworks)

  const networksList = readJsonFile(`${distPath}/${networksFileName}`) as string[]

  checkFile(distPath, networksInfoFileName, [])

  const networksFullInfo = networksList
    .map(network => getFullNetworkInfo({ network }))

  writeToFileWithUpdate(distPath, networksInfoFileName, networksFullInfo)
}

updateNetworks()