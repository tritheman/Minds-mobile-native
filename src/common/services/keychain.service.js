import { AsyncStorage } from 'react-native';
import CryptoJS from 'crypto-js';

const STORAGE_KEY_PREFIX = '@MindsKeychainChallenge:';

import KeychainStore from '../../keychain/KeychainStore';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheStillValid(cacheEntry) {
  if (!cacheEntry || !cacheEntry.timestamp) {
    return false;
  }

  const expires = cacheEntry.timestamp + CACHE_TTL;

  return Date.now() < expires;
}

async function isKeychainInStorage(keychain) {
  return !!(await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${keychain}`));
}

async function saveKeychainToStorage(keychain, secret) {
  await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${keychain}`, CryptoJS.AES.encrypt(secret, secret).toString());
}

async function challengeKeychainFromSecret(keychain, secretAttempt) {
  if (!secretAttempt) {
    return false;
  }

  const value = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${keychain}`);

  if (!value) {
    return null;
  }

  try {
    const secret = CryptoJS.AES.decrypt(value, secretAttempt).toString(CryptoJS.enc.Utf8);

    if (!secret) {
      return null;
    }

    return secret;
  } catch (e) {
    return null;
  }
}

const MAX_ATTEMPS = 3;

class KeychainService {
  unlocked = {};

  async getSecret(keychain) {
    if (
      typeof this.unlocked[keychain] !== 'undefined' &&
      isCacheStillValid(this.unlocked[keychain])
    ) {
      return this.unlocked[keychain].secret;
    }

    let secret;

    if (await isKeychainInStorage(keychain)) {
      let attempts = -1;

      while (attempts < MAX_ATTEMPS) {
        attempts++;

        try {
          const secretAttempt = await KeychainStore.waitForUnlock(keychain, true, attempts);
          await new Promise(r => setTimeout(r, 500)); // Modals have a "cooldown"

          if (!secretAttempt) {
            break;
          }

          secret = await challengeKeychainFromSecret(keychain, secretAttempt);
        } catch (e) { }

        if (secret) {
          break;
        }
      }

      if (!secret) {
        throw new Error('E_INVALID_PASSWORD_CHALLENGE_OUTCOME');
      }
    } else {
      secret = await KeychainStore.waitForUnlock(keychain, false);

      if (!secret) {
        throw new Error('E_INVALID_SECRET');
      }

      await saveKeychainToStorage(keychain, secret);
      await new Promise(r => setTimeout(r, 500)); // Modals have a "cooldown"
    }

    this.unlocked[keychain] = {
      secret,
      timestamp: Date.now(),
    };

    return secret;
  }
}

export default new KeychainService();
