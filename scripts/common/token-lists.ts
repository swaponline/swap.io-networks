// Handling of tokenlist.json files, tokens and trading pairs.

import { readJsonFile, writeJsonFile } from "../common/json";
import { diff } from "jsondiffpatch";
// import { tokenInfoFromTwApi, TokenTwInfo } from "../common/token";
import {
    getNetworkTokenLogoPath,
    getNetworkTokenlistPath,
} from "../common/repo-structure";
import { isPathExistsSync } from "../common/filesystem";

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
    pairs: Pair[]
    version: Version

    constructor(name: string, logoURI: string, timestamp: string, tokens: TokenItem[], version: Version) {
        this.name = name
        this.logoURI = logoURI
        this.timestamp = timestamp;
        this.tokens = tokens
        this.version = version
    }
}

export class TokenItem {
    asset: string;
    type: string;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI: string;
    pairs: Pair[];

    constructor(asset: string, type: string, address: string, name: string, symbol: string, decimals: number, logoURI: string, pairs: Pair[]) {
        this.asset = asset
        this.type = type
        this.address = address
        this.name = name;
        this.symbol = symbol
        this.decimals = decimals
        this.logoURI = logoURI
        this.pairs = pairs
    }
}

export class Pair {
    base: string;
    lotSize?: string;
    tickSize?: string;

    constructor(base: string, lotSize?: string, tickSize?: string) {
        this.base = base
        this.lotSize = lotSize
        this.tickSize = tickSize
    }
}

///// Exclude/Include list token/pair matching

// A token or pair in the force exclude/include list
export class ForceListPair {
    token1: string;
    // second is optional, if empty --> token only, if set --> pair
    token2: string;
}

export function createTokensList(titleCoin: string, tokens: TokenItem[], time: string, versionMajor: number, versionMinor = 1, versionPatch = 0): List {
    if (!time) {
        time = (new Date()).toISOString();
    }
    const list = new List(
        `Trust Wallet: ${titleCoin}`,
        "https://avatars.githubusercontent.com/u/38111297",
        time,
        tokens,
        new Version(versionMajor, versionMinor, versionPatch)
    );
    sort(list);
    return list;
}

export function writeToFile(filename: string, list: List): void {
    writeJsonFile(filename, list);
    console.log(`Tokenlist: list with ${list.tokens.length} tokens written to ${filename}.`);
}

// Write out to file, updating version+timestamp if there was change
export function writeToFileWithUpdate(filename: string, list: List): void {
    let listOld: List = undefined;
    try {
        listOld = readJsonFile(filename) as List;
    } catch (err) {
        listOld = undefined;
    }
    if (listOld !== undefined) {
        list.version = listOld.version; // take over
        list.timestamp = listOld.timestamp; // take over
        const diffs = diffTokenlist(list, listOld);
        if (diffs != undefined) {
            //console.log("List has Changed", JSON.stringify(diffs));
            list.version = new Version(list.version.major + 1, 0, 0);
            list.timestamp = (new Date()).toISOString();
            console.log(`Version and timestamp updated, ${list.version.major}.${list.version.minor}.${list.version.patch} timestamp ${list.timestamp}`);
        }
    }
    writeToFile(filename, list);
}

async function addTokenIfNeeded(token: TokenItem, list: List): Promise<void> {
    if (list.tokens.map(t => t.address.toLowerCase()).includes(token.address.toLowerCase())) {
        return;
    }
    token = await updateTokenInfo(token);
    list.tokens.push(token);
}

// Update/fix token info, with properties retrieved from TW API
async function updateTokenInfo(token: TokenItem): Promise<TokenItem> {
    return token;
}

function checkTokenExists(id: string, networkName: string, ): boolean {
    const logoPath = getNetworkTokenLogoPath(networkName, id);
    // add check info.json
    if (!isPathExistsSync(logoPath)) {
        //console.log("logo file missing", logoPath);
        return false;
    }
    return true;
}

function sort(list: List) {
    list.tokens.forEach(t => {
        t.pairs.sort((p1, p2) => p1.base.localeCompare(p2.base));
    });
}


function clearUnimportantFields(list: List) {
    list.timestamp = "";
    list.version = new Version(0, 0, 0);
}

export function diffTokenlist(listOrig1: List, listOrig2: List): unknown {
    // deep copy, to avoid changes
    const list1 = JSON.parse(JSON.stringify(listOrig1));
    const list2 = JSON.parse(JSON.stringify(listOrig2));
    clearUnimportantFields(list1);
    clearUnimportantFields(list2);
    sort(list1);
    sort(list2);
    // compare
    const diffs = diff(list1, list2);
    return diffs;
}