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
import { getFullNetworkInfo } from "../common/networks"
import { readJsonFile, writeJsonFile, writeToFileWithUpdate } from "../common/json"


const checkFile = (fileDir: string, fileName: string, initialData: any): void => {
  const isFileDirExists = isPathExistsSync(fileDir)

  if (!isFileDirExists) {
    createDirSync(fileDir)
  }

  const filePath = `${fileDir}/${fileName}`
  const isFileExists = isPathExistsSync(filePath)

  if (!isFileExists) {
    writeJsonFile(filePath, initialData)
  }

  if (getFileSizeInKilobyte(filePath) === 0) {
    writeToFileWithUpdate(fileDir, fileName, initialData)
  }
}

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