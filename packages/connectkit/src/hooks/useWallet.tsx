import { useState } from 'react';
import { isMobile } from '../utils';
import useDefaultWallets from '../wallets/useDefaultWallets';
import { WalletProps } from '../wallets/wallet';
import { useConnect } from './useConnect';

export const states = {
  READY: 'READY',
  CONNECTED: 'CONNECTED',
  CONNECTING: 'CONNECTING',
  EXPIRING: 'EXPIRING',
  FAILED: 'FAILED',
  REJECTED: 'REJECTED',
  NOTCONNECTED: 'NOTCONNECTED',
  UNAVAILABLE: 'UNAVAILABLE',
};

function useWallet(id: string) {
  const wallets = useDefaultWallets();
  const wallet = wallets.find((wallet: WalletProps) => wallet.id === id);

  const [state, setState] = useState(
    isMobile()
      ? states.READY
      : !wallet?.installed
      ? states.UNAVAILABLE
      : states.READY
  );

  const { connect, connectAsync } = useConnect({
    onSuccess: () => {
      setState(states.CONNECTED);
    },
    onError: (err: any) => {
      setState(states.FAILED);
    },
    onMutate: (connector?: any) => {
      if (connector.connector) {
        setState(states.CONNECTING);
      } else {
        setState(states.UNAVAILABLE);
      }
    },
    onSettled(data?: any, error?: any) {
      if (error) {
        if (error.code) {
          // https://github.com/MetaMask/eth-rpc-errors/blob/main/src/error-constants.ts
          switch (error.code) {
            case -32002:
              setState(states.NOTCONNECTED);
              break;
            case 4001:
              setState(states.REJECTED);
              break;
            default:
              setState(states.FAILED);
              break;
          }
        } else if (error.message) {
          switch (error.message) {
            case 'User rejected request':
              setState(states.REJECTED);
              break;
            default:
              setState(states.FAILED);
              break;
          }
        } else {
          setState(states.FAILED);
        }
      } else if (data) {
      }
    },
  });

  const onConnect = async ({ async = false, ...options }) => {
    const { connector, mobile } = wallet.createConnector();

    if (!connector) setState(states.UNAVAILABLE);
    setState(states.CONNECTING);

    if (isMobile() && !wallet.installed) {
      connector.on('message', async ({ type }: any) => {
        if (type === 'connecting') {
          const uri = await mobile.getUri();
          window.location.href = uri;
        }
      });

      try {
        connectAsync({ connector });
      } catch (err) {
        console.log('Async connect error. See console for more details.', err);
      }
    } else if (wallet.installed) {
      if (async) {
        try {
          connectAsync({ connector, ...options });
        } catch (err) {
          alert('Async connect error.');
        }
      } else {
        connect({ connector, ...options });
      }
    } else {
      if (async) {
        try {
          connectAsync({ connector, ...options });
        } catch (err) {
          alert('Async connect error.');
        }
      } else {
        setState(states.UNAVAILABLE);
      }
    }
  };

  if (!wallet) {
    return {
      wallet: null,
      state: states.NOTCONNECTED,
      onConnect: () => {},
      connect: () => {},
      connectAsync: async () => {},
    };
  }
  return { wallet, state, onConnect, connect, connectAsync };
}

export default useWallet;
