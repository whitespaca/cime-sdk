import { checkVersion } from './utils/version';
checkVersion();

export { CimeClient } from './client';

export { CimeAPIError } from './errors/CimeAPIError';

export { CimeEventClient, CimeLiveEventName } from './ws/CimeEventClient';

export * from './types';

export * from './utils/chatUtils';
export { getVersion } from './utils/version';