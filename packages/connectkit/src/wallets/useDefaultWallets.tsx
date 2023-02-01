import { getWallets } from './';
import { WalletProps } from './wallet';

import { useConnect } from 'wagmi';

function useDefaultWallets(): WalletProps[] | any {
  const { connectors } = useConnect();

  // TODO: Find a better way to get configuration chains
  const chains = connectors[0].chains;

  const defaultWallets: string[] = [
    'walletConnect',
    'injected',
    'metaMask',
    'coinbaseWallet',
    'rainbow',
    'argent',
    'trust',
    'ledger',
    'imToken',
    'brave',
    'steak',
    'unstoppable',
    //'slope', // Removed from defaults
    'onto',
    'gnosisSafe',
    'frontier',
    'zerion',
  ];

  const wallets = getWallets({ chains });
  return wallets.filter((wallet) => defaultWallets.includes(wallet.id));
}

export default useDefaultWallets;
