import * as FileSystem from "expo-file-system";
import Toast from "react-native-root-toast";
import { localStorage } from "./mmkv";

/**
 * Ask permission to access the media library
 * @returns {Promise<{granted: boolean, directoryUri: string}>}
 */
export const askPermission = async () => {
  const uriFromLocalStorage = localStorage.getString("directoryUri");
  if (uriFromLocalStorage) {
    return { granted: true, directoryUri: uriFromLocalStorage };
  }
  // @ts-expect-error Some types are missing in the FileSystem module
  const { granted, directoryUri } =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!granted) {
    Toast.show("Permission to access media library is required");
    return { granted, directoryUri: "" };
  }
  localStorage.set("directoryUri", directoryUri);
  return { granted, directoryUri };
};

/**
 * Save a file in the device
 * @param fileName Name of the file
 * @param base64 Content of the file
 * @param mimeType Mime type of the file
 * @param destiny Directory where the file will be saved
 */
export const saveFile = async (
  fileName: string,
  base64: string,
  mimeType: string,
  destiny: string,
) => {
  const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    destiny,
    fileName,
    mimeType,
  );
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
};
