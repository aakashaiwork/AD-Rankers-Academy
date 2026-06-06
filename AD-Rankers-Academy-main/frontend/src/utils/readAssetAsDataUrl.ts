import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

type PickedAsset = {
  uri: string;
  mimeType?: string | null;
};

/**
 * Reads a document-picker asset into a data URL string.
 * Web uses FileReader (expo-file-system readAsStringAsync is not available on web).
 */
export async function readAssetAsDataUrl(asset: PickedAsset): Promise<string> {
  const mimeType = asset.mimeType || 'application/octet-stream';

  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Could not read file as data URL'));
        }
      };
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    });
  }

  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:${mimeType};base64,${base64}`;
}
