import axios from 'axios';
import pkg from '../../package.json';

/**
 * 로컬 패키지의 현재 버전을 반환합니다.
 */
export function getVersion(): string {
  return pkg.version;
}

/**
 * npm 레지스트리와 비교하여 최신 버전이 있는지 확인하고 콘솔에 알립니다.
 * 백그라운드에서 비동기로 실행됩니다.
 */
export async function checkVersion(): Promise<void> {
    try {
        const localVersion = pkg.version;
        const packageName = pkg.name; // 'cime-sdk'

        const { data, status } = await axios.get(`https://registry.npmjs.org/${packageName}/latest`, {
            timeout: 3000,
        });

        if (status !== 200 || !data || !data.version) {
            return;
        }

        const remoteVersion = data.version;

        if (isNewerVersion(localVersion, remoteVersion)) {
            console.log(`\n======================================================`);
            console.log(`🚀 [CIME SDK] 새로운 버전을 찾았습니다!`);
            console.log(`현재 버전: ${localVersion} -> 최신 버전: ${remoteVersion}`);
            console.log(`UPDATE: npm install ${packageName}@${remoteVersion}`);
            console.log(`======================================================\n`);
        }
    } catch (error) {
        return;
    }
}

/**
 * 두 버전 문자열을 비교합니다.
 * @returns remote가 local보다 크면 true
 */
function isNewerVersion(local: string, remote: string): boolean {
    const lParts = local.split('.').map(Number);
    const rParts = remote.split('.').map(Number);

    const maxLength = Math.max(lParts.length, rParts.length);

    for (let i = 0; i < maxLength; i++) {
        const l = lParts[i] || 0;
        const r = rParts[i] || 0;
        
        if (r > l) return true;
        if (r < l) return false;
    }
    
    return false;
}