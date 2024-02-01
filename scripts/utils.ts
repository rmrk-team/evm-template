import { network } from 'hardhat';

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isHardhatNetwork(): boolean {
  return ['hardhat', 'localhost'].includes(network.name);
}
