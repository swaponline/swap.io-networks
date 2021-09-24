import {
  getAbsolutePath,
  customAssetGroups,
  getAssetGroupInfoPath,
} from "../common/repo-structure"
import {
  isPathExistsSync
} from "../common/filesystem"
import { readJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"


const generateAssetGroups = () => {
  const distPath = getAbsolutePath('/dist')
  const mainnetPath = `${distPath}/mainnet`
  const testnetPath = `${distPath}/testnet`
  const networksInfoFileName = 'networksInfo.json'
  const assetGroupsFileName = 'assets-groups.json'

  const mainnetNetworksInfoList = readJsonFile(`${mainnetPath}/${networksInfoFileName}`) as string[]
  const testnetNetworksInfoList = readJsonFile(`${testnetPath}/${networksInfoFileName}`) as string[]

  // console.log('mainnetNetworksInfoList', mainnetNetworksInfoList)
  // console.log('testnetNetworksInfoList', testnetNetworksInfoList)
  const customAssetGroupsInfo = customAssetGroups.map(assetGroup => {
    const assetGroupInfoPath = getAssetGroupInfoPath(assetGroup)

    if (isPathExistsSync(assetGroupInfoPath))
      return readJsonFile(assetGroupInfoPath)
  })

  console.log('customAssetGroupsInfo', customAssetGroupsInfo)

  const mainnetAssetGroups: string[] = []
  const testnetAssetGroups: string[] = []

  checkFile(mainnetPath, assetGroupsFileName, [])
  writeToFileWithUpdate(mainnetPath, assetGroupsFileName, mainnetAssetGroups)


  checkFile(testnetPath, assetGroupsFileName, [])
  writeToFileWithUpdate(testnetPath, assetGroupsFileName, testnetAssetGroups)
}

generateAssetGroups()