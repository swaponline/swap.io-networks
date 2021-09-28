import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"
import axios from "axios"

export const getFileName = (name: string): string => path.basename(name, path.extname(name))
export const getFileExt = (name: string): string => name.slice((Math.max(0, name.lastIndexOf(".")) || Infinity) + 1)

export const readFileSync = (path: string): string => fs.readFileSync(path, 'utf8')
export const writeFileSync = (path: string, data: any): void => fs.writeFileSync(path, data)
export const readDirSync = (path: string): string[] => fs.readdirSync(path)
export const readOnlyDirSync = (path: string): string[] =>
  fs.readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
export const isPathExistsSync = (path: string): boolean => fs.existsSync(path)
export const getFileSizeInKilobyte = (path: string): number => fs.statSync(path).size / 1000
export const createDirSync = (path: string): void | false => !isPathExistsSync(path) && fs.mkdirSync(path)

function execRename(command: string, cwd: string) {
  console.log(`Running command ${command}`)
  execSync(command, {encoding: "utf-8", cwd: cwd})
}

function gitMoveCommand(oldName: string, newName: string): string {
  return `git mv ${oldName} ${newName}-temp && git mv ${newName}-temp ${newName}`
}

export function gitMove(path: string, oldName: string, newName: string): void {
  console.log(`Renaming file or folder at path ${path}: ${oldName} => ${newName}`)
  execRename(gitMoveCommand(oldName, newName), path)
}

export function findFiles(base: string, ext: string, files: string[] = [], result: string[] = []): string[] {
  files = fs.readdirSync(base) || files
  result = result || result

  files.forEach(file => {
    const newbase = path.join(base, file)
    if (fs.statSync(newbase).isDirectory()) {
      result = findFiles(newbase, ext, fs.readdirSync(newbase), result)
    } else {
      if (file.substr(-1*(ext.length+1)) == '.' + ext) {
        result.push(newbase)
      }
    }
  })
  return result
}

export const saveLogo = (url: string, imagePath: string) =>
  axios({
    url,
    responseType: 'stream',
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(imagePath))
          .on('finish', () => resolve('finish'))
          .on('error', (e: any) => reject(e))
      }),
  )