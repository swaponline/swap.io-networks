import {
  readFileSync,
  writeFileSync,
  createDirSync,
  isPathExistsSync,
  getFileSizeInKilobyte,
} from "../common/filesystem"
import { sortElements } from "./types"
import { diff } from "jsondiffpatch"

export function isValidJSON(path: string): boolean {
  try {
    const rawdata = readFileSync(path)
    JSON.parse(rawdata)
    return true
  } catch {
    return false
  }
}

export function formatJson(content: unknown): string {
  return JSON.stringify(content, null, 2)
}

export function formatSortJson(content: unknown[]): string {
  return JSON.stringify(sortElements(content), null, 2)
}

// Return if updated
export function formatJsonFile(filename: string): boolean {
  const origText: string = readFileSync(filename)
  const newText: string = formatJson(JSON.parse(origText))
  if (newText == origText) {
    return false
  }
  writeFileSync(filename, newText)
  console.log(`Formatted json file ${filename}`)
  return true
}

export function formatSortJsonFile(filename: string): void {
  writeFileSync(filename, formatSortJson(JSON.parse(readFileSync(filename))))
  console.log(`Formatted json file ${filename}`)
}

export function readJsonFile(path: string): any {
  return JSON.parse(readFileSync(path))
}

export const writeJsonFile = (path: string, data: any): void =>
  writeFileSync(path, JSON.stringify(data, null, 2))

export const writeToFileWithUpdate = (filePath: string, fileName: string, data: any): void => {
  const fullFilePath = `${filePath}/${fileName}`
  let oldData
  try {
    oldData = readJsonFile(fullFilePath)
  } catch (err) {
    oldData = undefined
  }
  if (oldData !== undefined) { // add logic for diffs
    const diffs = diffData(data, oldData)
    if (diffs) {
      const diffsPath = `${filePath}/diffs-(${new Date().toISOString()}).json`
      writeJsonFile(diffsPath, diffs)
    }
  }
  writeJsonFile(fullFilePath, data)
}

export const diffData = (Data1: any, Data2: any): any => {
  // deep copy, to avoid changes
  const data1 = JSON.parse(JSON.stringify(Data1))
  const data2 = JSON.parse(JSON.stringify(Data2))
  // compare
  const diffs = diff(data1, data2)
  return diffs
}

export const checkFile = (fileDir: string, fileName: string, initialData: any): void => {
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