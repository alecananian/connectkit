import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Container,
  ConnectingContainer,
  ConnectingAnimation,
  RetryButton,
  RetryIconContainer,
  Content,
} from './styles';

import { useContext } from '../../ConnectKit';

import {
  PageContent,
  ModalBody,
  ModalH1,
  ModalContentContainer,
  ModalContent,
} from '../../Common/Modal/styles';
import { OrDivider } from '../../Common/Modal';
import Button from '../../Common/Button';
import Tooltip from '../../Common/Tooltip';
import Alert from '../../Common/Alert';

import CircleSpinner from './CircleSpinner';

import { RetryIconCircle, Scan } from '../../../assets/icons';
import BrowserIcon from '../../Common/BrowserIcon';
import { AlertIcon, TickIcon } from '../../../assets/icons';
import { detectBrowser } from '../../../utils';
import useLocales from '../../../hooks/useLocales';

import useWallet, { states } from '../../../hooks/useWallet';
import { useNetwork } from 'wagmi';

const contentVariants: Variants = {
  initial: {
    willChange: 'transform,opacity',
    position: 'relative',
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    position: 'relative',
    opacity: 1,
    scale: 1,
    transition: {
      ease: [0.16, 1, 0.3, 1],
      duration: 0.4,
      delay: 0.05,
      position: { delay: 0 },
    },
  },
  exit: {
    position: 'absolute',
    opacity: 0,
    scale: 0.95,
    transition: {
      ease: [0.16, 1, 0.3, 1],
      duration: 0.3,
    },
  },
};

const ConnectWithInjector: React.FC<{
  connectorId: string;
  switchConnectMethod: (id?: string) => void;
  forceState?: typeof states;
}> = ({ connectorId, switchConnectMethod, forceState }) => {
  const { chains } = useNetwork();
  const [showTryAgainTooltip, setShowTryAgainTooltip] = useState(false);

  const { wallet, onConnect, state } = useWallet(connectorId);

  const id = wallet?.id;

  const browser = detectBrowser();
  const extensionUrl = wallet?.downloadUrls
    ? wallet?.downloadUrls[browser]
    : undefined;

  const suggestedExtension = wallet?.downloadUrls
    ? {
        name: Object.keys(wallet?.downloadUrls)[0],
        label:
          Object.keys(wallet?.downloadUrls)[0].charAt(0).toUpperCase() +
          Object.keys(wallet?.downloadUrls)[0].slice(1), // Capitalise first letter, but this might be better suited as a lookup table
        url: wallet?.downloadUrls[Object.keys(wallet?.downloadUrls)[0]],
      }
    : undefined;

  const status = forceState ? forceState : state;

  const locales = useLocales({
    CONNECTORNAME: wallet?.name,
    CONNECTORSHORTNAME: wallet?.shortName ?? wallet?.name,
    SUGGESTEDEXTENSIONBROWSER: suggestedExtension?.label ?? 'your browser',
  });

  const runConnect = () => {
    if (!wallet?.installed) return;
    onConnect({ chainId: chains[0]?.id });
  };

  let connectTimeout: any;
  useEffect(() => {
    if (status === states.UNAVAILABLE) return;

    // UX: Give user time to see the UI before opening the extension
    connectTimeout = setTimeout(runConnect, 600);
    return () => {
      clearTimeout(connectTimeout);
    };
  }, []);

  useEffect(() => {
    if (state === states.REJECTED) {
      setShowTryAgainTooltip(true);
      setTimeout(() => setShowTryAgainTooltip(false), 3500);
    }
  }, [state]);

  if (!wallet) {
    return (
      <PageContent>
        <Container>
          <ModalContent>
            <Alert>
              No connectors match the given id of <code>{connectorId}</code>.
            </Alert>
          </ModalContent>
        </Container>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <Container>
        <ConnectingContainer>
          <ConnectingAnimation
            $shake={status === states.FAILED || status === states.REJECTED}
            $circle
          >
            <AnimatePresence>
              {(status === states.FAILED || status === states.REJECTED) && (
                <RetryButton
                  aria-label="Retry"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ duration: 0.1 }}
                  onClick={runConnect}
                >
                  <RetryIconContainer>
                    <Tooltip
                      open={
                        showTryAgainTooltip &&
                        (status === states.FAILED || status === states.REJECTED)
                      }
                      message={locales.tryAgainQuestion}
                      xOffset={-6}
                    >
                      <RetryIconCircle />
                    </Tooltip>
                  </RetryIconContainer>
                </RetryButton>
              )}
            </AnimatePresence>

            <CircleSpinner
              logo={
                status === states.UNAVAILABLE ? (
                  <div
                    style={{
                      transform: 'scale(1.14)',
                      position: 'relative',
                      width: '100%',
                    }}
                  >
                    {wallet?.logos.transparent ?? wallet?.logos.default}
                  </div>
                ) : (
                  <>{wallet?.logos.transparent ?? wallet?.logos.default}</>
                )
              }
              smallLogo={wallet?.id === 'injected'}
              connecting={
                status === states.CONNECTING || status === states.READY
              }
              unavailable={status === states.UNAVAILABLE}
              countdown={status === states.EXPIRING}
            />
          </ConnectingAnimation>
        </ConnectingContainer>
        <ModalContentContainer>
          <AnimatePresence initial={false}>
            {status === states.FAILED && (
              <Content
                key={states.FAILED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent>
                  <ModalH1 $error>
                    <AlertIcon />
                    {locales.injectionScreen_failed_h1}
                  </ModalH1>
                  <ModalBody>{locales.injectionScreen_failed_p}</ModalBody>
                </ModalContent>
                {/* Reason: Coinbase Wallet does not expose a QRURI when extension is installed */}
                {wallet?.scannable && wallet?.id !== 'coinbaseWallet' && (
                  <>
                    <OrDivider />
                    <Button
                      icon={<Scan />}
                      onClick={() => switchConnectMethod(id)}
                    >
                      {locales.scanTheQRCode}
                    </Button>
                  </>
                )}
              </Content>
            )}
            {status === states.REJECTED && (
              <Content
                key={states.REJECTED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent style={{ paddingBottom: 28 }}>
                  <ModalH1>{locales.injectionScreen_rejected_h1}</ModalH1>
                  <ModalBody>{locales.injectionScreen_rejected_p}</ModalBody>
                </ModalContent>

                {/* Reason: Coinbase Wallet does not expose a QRURI when extension is installed */}
                {wallet?.scannable && wallet?.id !== 'coinbaseWallet' && (
                  <>
                    <OrDivider />
                    <Button
                      icon={<Scan />}
                      onClick={() => switchConnectMethod(id)}
                    >
                      {locales.scanTheQRCode}
                    </Button>
                  </>
                )}
              </Content>
            )}
            {(status === states.CONNECTING ||
              status === states.READY ||
              status === states.EXPIRING) && (
              <Content
                key={states.CONNECTING}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent style={{ paddingBottom: 28 }}>
                  <ModalH1>
                    {wallet?.id === 'injected'
                      ? locales.injectionScreen_connecting_injected_h1
                      : locales.injectionScreen_connecting_h1}
                  </ModalH1>
                  <ModalBody>
                    {wallet?.id === 'injected'
                      ? locales.injectionScreen_connecting_injected_p
                      : locales.injectionScreen_connecting_p}
                  </ModalBody>
                </ModalContent>
              </Content>
            )}
            {status === states.CONNECTED && (
              <Content
                key={states.CONNECTED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent>
                  <ModalH1 $valid>
                    <TickIcon /> {locales.injectionScreen_connected_h1}
                  </ModalH1>
                  <ModalBody>{locales.injectionScreen_connected_p}</ModalBody>
                </ModalContent>
              </Content>
            )}
            {status === states.NOTCONNECTED && (
              <Content
                key={states.NOTCONNECTED}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                <ModalContent>
                  <ModalH1>{locales.injectionScreen_notconnected_h1}</ModalH1>
                  <ModalBody>
                    {locales.injectionScreen_notconnected_p}
                  </ModalBody>
                </ModalContent>
              </Content>
            )}
            {status === states.UNAVAILABLE && (
              <Content
                key={states.UNAVAILABLE}
                initial={'initial'}
                animate={'animate'}
                exit={'exit'}
                variants={contentVariants}
              >
                {!extensionUrl ? (
                  <>
                    <ModalContent style={{ paddingBottom: 12 }}>
                      <ModalH1>
                        {locales.injectionScreen_unavailable_h1}
                      </ModalH1>
                      <ModalBody>
                        {locales.injectionScreen_unavailable_p}
                      </ModalBody>
                    </ModalContent>

                    {!wallet?.installed && suggestedExtension && (
                      <Button
                        href={suggestedExtension?.url}
                        icon={
                          <BrowserIcon browser={suggestedExtension?.name} />
                        }
                      >
                        Install on {suggestedExtension?.label}
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <ModalContent style={{ paddingBottom: 18 }}>
                      <ModalH1>{locales.injectionScreen_install_h1}</ModalH1>
                      <ModalBody>{locales.injectionScreen_install_p}</ModalBody>
                    </ModalContent>
                    {!wallet?.installed && extensionUrl && (
                      <Button href={extensionUrl} icon={<BrowserIcon />}>
                        {locales.installTheExtension}
                      </Button>
                    )}
                  </>
                )}
              </Content>
            )}
          </AnimatePresence>
        </ModalContentContainer>
      </Container>
    </PageContent>
  );
};

export default ConnectWithInjector;
