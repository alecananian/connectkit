import React, { useState, useEffect } from 'react';
import { routes, useContext } from '../ConnectKit';

import { useConnect } from '../../hooks/useConnect';
import useWallet from '../../hooks/useWallet';
import { useDefaultWalletConnect } from '../../hooks/useDefaultWalletConnect';

import {
  PageContent,
  ModalContent,
  ModalHeading,
} from '../Common/Modal/styles';
import { OrDivider } from '../Common/Modal';

import CustomQRCode from '../Common/CustomQRCode';
import Button from '../Common/Button';
import Alert from '../Common/Alert';
import ScanIconWithLogos from '../../assets/ScanIconWithLogos';
import { ExternalLinkIcon } from '../../assets/icons';
import CopyToClipboard from '../Common/CopyToClipboard';
import useLocales from '../../hooks/useLocales';
import { Connector } from 'wagmi';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

const ConnectWithQRCode: React.FC<{
  connectorId: string;
  switchConnectMethod: (id?: string) => void;
}> = ({ connectorId }) => {
  const context = useContext();

  const { openDefaultWalletConnect } = useDefaultWalletConnect();
  const { wallet, state, connect, connectAsync } = useWallet(connectorId);

  const [connectorUri, setConnectorUri] = useState<string | undefined>(
    undefined
  );

  const locales = useLocales({
    CONNECTORNAME: wallet?.name,
  });

  const startConnect = async () => {
    const { connector } = wallet.createConnector();
    console.log(connector);

    switch (wallet?.id) {
      case 'coinbaseWallet':
        connector.on('message', async ({ type }: any) => {
          const p = await connector.getProvider();
          setConnectorUri(p.qrUrl);
        });
        try {
          await connectAsync({ connector });
        } catch (err) {
          context.debug(
            <>
              This dApp is most likely missing the{' '}
              <code>headlessMode: true</code> flag in the custom{' '}
              <code>CoinbaseWalletConnector</code> options. See{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://connect.family.co/v0/docs/cbwHeadlessMode"
              >
                documentation
              </a>{' '}
              for more details.
            </>,
            err
          );
        }
        break;
      case 'walletConnect':
        if (connector.options?.version === '1') {
          // WalletConnect v1
          connector.on('message', async () => {
            const p = await connector.getProvider();
            setConnectorUri(p.connector.uri);

            // User rejected, regenerate QR code
            p.connector.on('disconnect', () => {
              //TODO: Refresh QR Code
              startConnect();
            });
          });
          try {
            await connectAsync({ connector });
          } catch (err) {
            context.debug(
              <>WalletConnect cannot connect. See console for more details.</>,
              err
            );
          }
        } else {
          // WalletConnect v2

          const c: Connector = new WalletConnectConnector({
            ...connector,
          });
          console.log(c);
          c.on('connect', () => {
            console.log(`Connected to ${c.name}`);
          });
          c.on('message', async ({ type, data }) => {
            console.log(`Message from ${c.name}:`, type, data);
            if (type === 'display_uri') {
              setConnectorUri(data as string);
            }
          });
          c.on('disconnect', () => {
            console.log(`Disconnected from ${c.name}`);
          });

          console.log('Connecting...');
          const connected = await connectAsync({ connector: c });
          console.log('Connected', connected);
          /*
          try {
            console.log(connect({ connector }));
          } catch (err) {
            context.debug(<>Unknown error</>, err);
          }
          */
        }
        break;
    }
  };

  // State for UI response to default wallet connect
  const [defaultModalOpen, setDefaultModalOpen] = useState(false);
  const openDefaultConnect = async () => {
    if (wallet?.id !== 'walletConnect') return;
    setDefaultModalOpen(true);
    await openDefaultWalletConnect();
    setDefaultModalOpen(false);
  };

  useEffect(() => {
    if (!connectorUri) startConnect();
  }, []);

  if (!wallet) return <>Connector not found</>;
  const hasApps = wallet?.downloadUrls?.ios || wallet?.downloadUrls?.android;

  if (!wallet?.scannable)
    return (
      <PageContent>
        <ModalHeading>Invalid State</ModalHeading>
        <ModalContent>
          <Alert>{wallet?.name} does not have it's own QR Code to scan.</Alert>
        </ModalContent>
      </PageContent>
    );

  return (
    <PageContent>
      <ModalContent style={{ paddingBottom: 8, gap: 14 }}>
        {state}
        <CustomQRCode
          value={connectorUri}
          image={wallet?.logos.qrCode}
          imageBackground={wallet?.logoBackground}
          tooltipMessage={
            wallet?.id === 'walletConnect' ? (
              <>
                <ScanIconWithLogos />
                <span>{locales.scanScreen_tooltip_walletConnect}</span>
              </>
            ) : (
              <>
                <ScanIconWithLogos logo={wallet?.logos.connectorButton} />
                <span>{locales.scanScreen_tooltip_default}</span>
              </>
            )
          }
        />
        {wallet?.id === 'walletConnect' ? (
          <OrDivider />
        ) : (
          hasApps && <OrDivider>{locales.dontHaveTheApp}</OrDivider>
        )}
      </ModalContent>

      {wallet?.id === 'walletConnect' && ( // for walletConnect
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
          }}
        >
          {context.options?.walletConnectCTA !== 'modal' && (
            <CopyToClipboard variant="button" string={connectorUri}>
              {context.options?.walletConnectCTA === 'link'
                ? locales.copyToClipboard
                : locales.copyCode}
            </CopyToClipboard>
          )}
          {context.options?.walletConnectCTA !== 'link' && (
            <Button
              icon={<ExternalLinkIcon />}
              onClick={openDefaultConnect}
              waiting={defaultModalOpen}
            >
              {context.options?.walletConnectCTA === 'modal'
                ? locales.useWalletConnectModal
                : locales.useModal}
            </Button>
          )}
        </div>
      )}

      {hasApps && (
        <>
          <Button
            onClick={() => {
              context.setRoute(routes.DOWNLOAD);
            }}
            download
          >
            {locales.getWalletName}
          </Button>
        </>
      )}
    </PageContent>
  );
};

export default ConnectWithQRCode;
