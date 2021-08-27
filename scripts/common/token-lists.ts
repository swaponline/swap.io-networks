// Handling of tokenlist.json files, tokens and trading pairs.

import { writeJsonFile } from "../common/json"
import axios from "axios"
import {
  getNetworkTokenLogoPaths,
  getNetworkTokenlistPath,
} from "../common/repo-structure"
import { isPathExistsSync } from "../common/filesystem"

class Version {
  major: number
  minor: number
  patch: number

  constructor(major: number, minor: number, patch: number) {
    this.major = major
    this.minor = minor
    this.patch = patch
  }
}

export class List {
  name: string
  logoURI: string
  timestamp: string
  tokens: TokenItem[]
  version: Version

  constructor(name: string, logoURI: string, timestamp: string, tokens: TokenItem[], version: Version) {
    this.name = name
    this.logoURI = logoURI
    this.timestamp = timestamp
    this.tokens = tokens
    this.version = version
  }
}

export class TokenItem {
  asset: string
  type: string
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string

  constructor(asset: string, type: string, address: string, name: string, symbol: string, decimals: number, logoURI: string) {
    this.asset = asset
    this.type = type
    this.address = address
    this.name = name
    this.symbol = symbol
    this.decimals = decimals
    this.logoURI = logoURI
  }
}


export function createTokensList(titleCoin: string, tokens: TokenItem[], time: string, versionMajor: number, versionMinor = 1, versionPatch = 0): List {
  if (!time) {
    time = (new Date()).toISOString()
  }
  const list = new List(
    `Trust Wallet: ${titleCoin}`,
    "https://avatars.githubusercontent.com/u/38111297",
    time,
    tokens,
    new Version(versionMajor, versionMinor, versionPatch)
  )
  return list
}

export function writeToFile(filename: string, list: List): void {
  writeJsonFile(filename, list)
  console.log(`Tokenlist: list with ${list.tokens.length} tokens written to ${filename}.`)
}

async function addTokenIfNeeded(token: TokenItem, list: List): Promise<void> {
  if (list.tokens.map(t => t.address.toLowerCase()).includes(token.address.toLowerCase())) {
    return
  }
  token = await updateTokenInfo(token)
  list.tokens.push(token)
}

// Update/fix token info, with properties retrieved from TW API
async function updateTokenInfo(token: TokenItem): Promise<TokenItem> {
  return token
}

function checkTokenExists(id: string, networkName: string, ): boolean {
  const logoPaths = getNetworkTokenLogoPaths(networkName, id)
  const logoExists = !!logoPaths.filter(logoPath => isPathExistsSync(logoPath)).length
  // add check info.json
  if (logoExists) {
    //console.log("logo file missing", logoPath)
    return false
  }
  return true
}


function clearUnimportantFields(list: List) {
  list.timestamp = ""
  list.version = new Version(0, 0, 0)
}

export const sanitizeSymbol = (symbol: string): string => {
  return symbol.replace(/[\[\]\/\\|,.+=:;*?«<>]/g, '').trim()
}

export const sanitizeAddress = (address: string): string => {
  return address.toLowerCase().trim()
}

export const getExternalTokensList = (url: string) =>
  axios.get(url)
    .then(response => response.data)
    .catch(err => {
      throw new Error(`Can't fetch ${url}, error with message: ${err.message}`)
    })