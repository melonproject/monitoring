import BigNumber from 'bignumber.js';

export const formatBigNumber = (n: number | string, decimals?: number | string, digits?: number) => {
  const bn = new BigNumber(n);
  const dec = decimals || 18;
  const dig = digits || 6;
  return bn.div(new BigNumber(10).pow(new BigNumber(dec))).toFixed(dig);
};
