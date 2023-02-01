import { useConnect as wagmiUseConnect } from 'wagmi';
import { useContext } from '../components/ConnectKit';

export function useConnect(options?: any) {
  const context = useContext();

  const { connect, connectAsync, ...etc } = wagmiUseConnect({
    onError(err) {
      if (err.message) {
        if (err.message !== 'User rejected request') {
          context.debug(err.message, err);
        }
      } else {
        context.debug(`Could not connect. See console for more details.`, err);
      }
    },
    ...options,
  });

  return {
    connect: ({ ...props }) => {
      return connect({ ...props, chainId: context.options?.initialChainId });
    },
    connectAsync: async ({ ...props }) => {
      return await connectAsync({
        ...props,
        chainId: context.options?.initialChainId,
      });
    },
    ...etc,
  };
}
