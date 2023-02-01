import { Connector } from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';

import { useConnect } from './useConnect';

export function useDefaultCoinbaseWallet() {
  const { connectAsync, connectors } = useConnect();
  return {
    openDefaultCoinbaseWallet: async () => {
      const c: Connector<any, any> | undefined = connectors.find(
        (c) => c.id === 'coinbaseWallet'
      );
      if (c) {
        const connector = new CoinbaseWalletConnector({
          chains: c.chains,
          options: { ...c.options, headlessMode: false },
        });

        try {
          await connectAsync({ connector: connector });
        } catch (err) {
          console.log('CoinbaseWallet', err);
        }
      } else {
        console.log('No CoinbaseWallet connector available');
      }
    },
  };
}
