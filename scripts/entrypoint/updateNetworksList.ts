import {
  getAbsolutePath,
  allNetworks,
} from "../common/repo-structure"
import {
  readDirSync,
  createDirSync,
  isPathExistsSync,
  getFileSizeInKilobyte,
} from "../common/filesystem"
import { readJsonFile, writeJsonFile, writeToFileWithUpdate } from "../common/json"

const updateNetworksList = () => {

  const distPath = getAbsolutePath('/dist')
  const isDistPathExists = isPathExistsSync(distPath)

  if (!isDistPathExists) {
    createDirSync(distPath)
  }

  const networksListFileName = 'networksList.json'
  const networksListPath = `${distPath}/${networksListFileName}`

  const isNetworkListFileExists = isPathExistsSync(networksListPath)
  if (!isNetworkListFileExists) {
    writeJsonFile(networksListPath, [])
  }

  const networksListFileSize = getFileSizeInKilobyte(networksListPath)
  if (networksListFileSize === 0) {
    writeToFileWithUpdate(distPath, networksListFileName, [])
  }

  writeToFileWithUpdate(distPath, networksListFileName, allNetworks)
}

updateNetworksList()