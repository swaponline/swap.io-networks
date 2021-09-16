import {
  getAbsolutePath,
} from "../common/repo-structure"
import {
  readDirSync,
  createDirSync,
  isPathExistsSync,
  getFileSizeInKilobyte,
} from "../common/filesystem"
import { getFullNetworkInfo } from "../common/networks"
import { readJsonFile, writeJsonFile, writeToFileWithUpdate } from "../common/json"

const updateTokensLists = () => {

  const networksListPath = getAbsolutePath('/dist/networksInfo.json')
  const isNetworkListFileExists = isPathExistsSync(networksListPath)

  if (!isNetworkListFileExists) {
    throw new Error('Firstly, you need add networks, then run "npm run updateNetworksList" script in terminal for create networksList')
  }

  const networksList = readJsonFile(networksListPath) as string[]
  console.log('networksList', networksList)
  const networksFullInfo = networksList
    .map(network => getFullNetworkInfo({ network }))

  console.log('networksFullInfo', networksFullInfo)

}

updateTokensLists()