import { ReactNode, useEffect, useState } from 'react';
import { Chain } from 'wagmi';
import { walletConnect } from './connectors/walletConnect';
import { metaMask } from './connectors/metaMask';
import { coinbaseWallet } from './connectors/coinbaseWallet';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useConnect } from '../hooks/useConnect';

export type WalletOptions = {
  chains: Chain[];
  appName?: string;
  shimDisconnect?: boolean;
};
export type WalletProps = {
  id: string;
  name: string;
  shortName?: string;
  logos: {
    default: ReactNode;
    transparent?: ReactNode;
    connectorButton?: ReactNode;
    qrCode?: ReactNode;
    appIcon?: ReactNode;
    mobile?: ReactNode;
  };
  logoBackground?: string;
  scannable?: boolean;
  installed?: boolean;
  downloadUrls?: { [key: string]: string };
  createConnector: () => any;
};

export const getDefaultConnectors = (chains: Chain[], appName: string) => {
  const connectors: any = [
    walletConnect({ chains }),
    metaMask({ chains }),
    coinbaseWallet({
      chains,
      appName,
    }),
    //injected({ chains }),
  ];

  return connectors.map((c: any) => {
    return { ...c.createConnector(), ...c };
  });
};

export const useDefaultWalletConnectConnector = () => {
  const { connectors } = useConnect();
  const c: any = connectors.find((c: any) => c.id === 'walletConnect');

  const [uri, setUri] = useState<string | undefined>(undefined);

  const connector = new WalletConnectConnector({ ...c });

  useEffect(() => {
    connector.on('message', (message: any) => {
      console.log('message', message);
      if (message.type === 'display_uri') setUri(message.data);
    });
  }, []);

  return { connector, uri };
};

export const getDefaultWalletConnectConnector = (chains: Chain[]) => {
  // TODO: walletConnect 2.0 requires projectId
  //const { connectors } = useConnect();
  //const connector = connectors.find((c: any) => c.id === 'walletConnect');
  const connector = new WalletConnectConnector({
    chains,
    options: {
      //...connector?.options,
      qrcode: false,
    },
  });
  return connector;
};

export const getProviderUri = async (connector: any) => {
  const provider: any = await connector.getProvider();
  return provider.connector.uri;
};
