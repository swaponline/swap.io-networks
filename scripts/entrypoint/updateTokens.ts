import {
  getAbsolutePath,
  allNetworks,
  getNetworkPath,
  getNetworkTokenInfoPath,
  getNetworkTokensPath,
  getNetworkTokenLogoPaths,
  getLogoExtensioFromUrl,
} from "../common/repo-structure"
import {
  readDirSync,
  isPathExistsSync,
  createDirSync,
  saveLogo
} from "../common/filesystem"
import { readJsonFile, writeJsonFile, checkFile, writeToFileWithUpdate } from "../common/json"
import { getFullNetworkInfo } from "../common/networks"
import { sanitizeAddress } from "../common/token-lists"


const syncUniqTokensWithNetworks = async () => {
  const networksWithTokensAddresses: {[network: string]: string[]} = {}
  const networksIndexesBySlug: {[network: string]: number} = {}

  const evmAndAbNetworksFullInfo = allNetworks
    .map(network => getFullNetworkInfo({ network }))
    .filter(network => ['evm', 'ab'].includes(network.type))
    .map((network, index) => {
      networksWithTokensAddresses[network.slug] = []
      networksIndexesBySlug[network.slug] = index
      return network
    })

  const uniqExternalTokens = readJsonFile(getAbsolutePath(`/cache/uniqExternalTokens.json`)) as UniqTokenList
  const uniqExternalTokensAddresses = Object.keys(uniqExternalTokens)

  if (!uniqExternalTokensAddresses.length)
    throw new Error('Firstly, you need run "npm run syncExternalTokens" script in terminal for fetching uniqExternalTokens')

    uniqExternalTokensAddresses.forEach(tokenAddress => {
    const { chainIds } = uniqExternalTokens[tokenAddress]
    chainIds.forEach(chainId => {
      const networkIndex = evmAndAbNetworksFullInfo.findIndex(network => network?.chainId && +network.chainId === chainId)
      const tokenNetwork = networkIndex !== -1 && evmAndAbNetworksFullInfo[networkIndex]
      if (tokenNetwork) networksWithTokensAddresses[tokenNetwork.slug].push(tokenAddress)
    })
  })

  for (const network of Object.keys(networksWithTokensAddresses)) {
    if (!networksWithTokensAddresses[network].length) continue
    try {
      await updateTokensByNetwork(
        evmAndAbNetworksFullInfo[networksIndexesBySlug[network]],
        networksWithTokensAddresses[network],
        uniqExternalTokens
      )
    } catch (error) {
      console.error(error)
    }
  }

}

const updateTokensByNetwork = async (
  networkInfo: NetworkFullInfo,
  networkUniqExternalTokensAddresses: string[],
  uniqExternalTokens: UniqTokenList
) => {

  if (!networkInfo?.chainId || !networkInfo?.tokensType) throw new Error("this isn't evm network")

  const network = networkInfo.slug
  console.log(`${networkInfo.name} have:`)
  console.log(`  ${networkUniqExternalTokensAddresses.length} external tokens`)

  const networkPath = getNetworkPath(network)
  const allowlistName = 'allowlist.json'
  const denylistName = 'denylist.json'

  checkFile(networkPath, allowlistName, [])
  checkFile(networkPath, denylistName, [])

  const denylist = readJsonFile(`${networkPath}/${denylistName}`)

  const tokensIDs: string[] = []
  const tokens: NetworkTokensListObj = {} // need for update tokens

  // Check exsists tokens
  const tokensPath = getNetworkTokensPath(network)
  if (isPathExistsSync(tokensPath)) {
    tokensIDs.push(...readDirSync(tokensPath))
    tokensIDs.forEach(tokenID => {
      const logoPaths = getNetworkTokenLogoPaths(network, tokenID)
      const logoExists = !!logoPaths.filter(logoPath => isPathExistsSync(logoPath)).length
      const infoFullPath = getNetworkTokenInfoPath(network, tokenID)
      const infoExists = isPathExistsSync(infoFullPath)
      if (infoExists) {
        const tokenInfo = readJsonFile(infoFullPath) as TokenInfo
        const haveLogoFromInfo = !!tokenInfo.logo && isPathExistsSync(getAbsolutePath(tokenInfo.logo))

        if (!logoExists && !haveLogoFromInfo) tokenInfo.logo = ''
        if (logoExists && !haveLogoFromInfo) console.log(tokenID) // add script which adding exists logo to token info

        // uncommenting to check and rewrite correct tokenID in logo RelativePath
        //
        // if (tokenInfo.logo) {
        //   const splitedLogoPath = tokenInfo.logo.split('/')
        //   const tokenIDFromLogo = splitedLogoPath[4]

        //   if (tokenIDFromLogo !== tokenID) {

        //     splitedLogoPath[4] = tokenID
        //     tokenInfo.logo = splitedLogoPath.join('/')

        //     writeJsonFile(infoFullPath, tokenInfo)
        //   }
        // }

        tokens[tokenID] = tokenInfo
      }
    })
  } else{
    console.log(`${network} have not tokens folder. Script creates it...`)
    createDirSync(tokensPath)
  }

  const exsistsTokensIDs: string[] = []
  const exsistsTokensAddresses: string[] = []

  Object.keys(tokens).forEach(tokensID => {
    const [symbol, address] = tokensID.split("--")
    exsistsTokensAddresses.push(sanitizeAddress(address))
    exsistsTokensIDs.push(tokensID)
  })

  console.log(`  ${exsistsTokensIDs.length} tokens in self folder`)

  // Add new tokens
  const addedTokens: string[] = []
  const alreadyExistsTokens: string[] = []

  for (const tokenAddress of networkUniqExternalTokensAddresses) {
    const { names, address, symbols, decimals, chainIds, logoURIs } = uniqExternalTokens[tokenAddress]

    if (
      !address ||
      (!names || !names.length) ||
      (!symbols || !symbols.length) ||
      (!decimals || !decimals.length) ||
      (!chainIds || !chainIds.length)
    ) {
      console.error(`Token haven't some prop for add to network tokens list: ${tokenAddress}`)
      continue
    }

    if (denylist.includes(address)) {
      console.error(`Token with ${tokenAddress} address includes in denylist`)
      continue
    }

    if (!chainIds.includes(+networkInfo.chainId)) {
      console.error(`Token with ${tokenAddress} address from different network`)
      continue
    }

    const tokenID = `${symbols[0]}--${address}`

    if (exsistsTokensAddresses.includes(tokenAddress)) {
      alreadyExistsTokens.push(tokenID)
      continue // need add logic for exists tokens
    } else {
      const tokenPath = `/networks/${networkInfo.slug}/tokens/${tokenID}`
      createDirSync(getAbsolutePath(tokenPath))

      let logoPath = ''
      if (logoURIs.length) {
        for (const logoURI of logoURIs) {
          try {
            const logoExtension = getLogoExtensioFromUrl(logoURI)
            logoPath = `${tokenPath}/logo.${logoExtension}`
            await saveLogo(logoURI, getAbsolutePath(logoPath))
            break
          } catch (error) {
            logoPath = ''
          }
        }
      }

      const tokenInfo: TokenInfo = {
        name: names[0],
        address: tokenAddress,
        symbol: symbols[0],
        decimals: decimals[0],
        chainId: +networkInfo.chainId,
        logo: logoPath,
        tags: [networkInfo.tokensType.toLowerCase()]
      }

      writeJsonFile(getAbsolutePath(`${tokenPath}/info.json`), tokenInfo)

      addedTokens.push(tokenID)
    }
  }

  console.log(`  ${addedTokens.length} added tokens`)
  console.log(`  ${alreadyExistsTokens.length} already exists tokens`)

  // Update allowed tokens list
  const allowedTokens = [...exsistsTokensIDs, ...addedTokens]

  writeToFileWithUpdate(networkPath, allowlistName, allowedTokens)

}

syncUniqTokensWithNetworks()