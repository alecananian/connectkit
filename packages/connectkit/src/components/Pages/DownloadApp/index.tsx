import React, { useState } from 'react';
import { useContext } from '../../ConnectKit';
import supportedConnectors from '../../../constants/supportedConnectors';

import {
  PageContent,
  ModalBody,
  ModalContent,
} from '../../Common/Modal/styles';
import { OrDivider } from '../../Common/Modal';

import CustomQRCode from '../../Common/CustomQRCode';
import Button from '../../Common/Button';

import { ExternalLinkIcon } from '../../../assets/icons';
import useLocales from '../../../hooks/useLocales';
import useWallet from '../../../hooks/useWallet';

const DownloadApp: React.FC<{
  connectorId: string;
}> = ({ connectorId }) => {
  const { wallet } = useWallet(connectorId);

  const locales = useLocales({
    CONNECTORNAME: wallet?.name,
  });

  if (!wallet) return <>Connector not found</>;

  const ios = wallet?.downloadUrls?.ios;
  const android = wallet?.downloadUrls?.android;
  const downloadUri = wallet?.downloadUrls?.download;
  const bodycopy =
    ios && android
      ? locales.downloadAppScreen_iosAndroid
      : ios
      ? locales.downloadAppScreen_ios
      : locales.downloadAppScreen_android;

  return (
    <PageContent>
      <ModalContent style={{ paddingBottom: 4, gap: 14 }}>
        {downloadUri && <CustomQRCode value={downloadUri} />}
        {!downloadUri && <>No download link available</>}
        <ModalBody
          style={{ fontSize: 15, lineHeight: '20px', padding: '0 12px' }}
        >
          {bodycopy}
        </ModalBody>
        {wallet?.id === 'walletConnect' && <OrDivider />}
      </ModalContent>

      {wallet?.id === 'walletConnect' && ( // Open the default connector modal
        <Button icon={<ExternalLinkIcon />}>Open Default Modal</Button>
      )}
    </PageContent>
  );
};

export default DownloadApp;
