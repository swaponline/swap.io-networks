import BigNumber from "bignumber.js"

export const toSatoshis = (value: string, decimals: number): string => {
  return new BigNumber(value).multipliedBy(new BigNumber(10).exponentiatedBy(decimals)).toFixed()
}

export const fromSatoshis = (value: string, decimals: number): string => {
  return new BigNumber(value).dividedBy(new BigNumber(10).exponentiatedBy(decimals)).toFixed()
}

export const toWei = toSatoshis
export const fromWei = fromSatoshis