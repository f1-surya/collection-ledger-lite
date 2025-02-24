import { exportDb, importDb, importFromSheet } from "@/lib/data";
import toast from "@/lib/toast";
import { getDocumentAsync } from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { ActivityIndicator, Dialog, List, Portal } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Data() {
  const [isLoading, setIsLoading] = useState(false);
  const pickSheet = async () => {
    try {
      setIsLoading(true);
      const res = await getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
      });
      if (!res.canceled) {
        const uri = res.assets[0].uri;
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await importFromSheet(base64);
        setIsLoading(false);
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsLoading(true);
    await exportDb();
    setIsLoading(false);
    toast("Export succeeded");
  };

  const handleImport = async () => {
    setIsLoading(true);
    await importDb();
    setIsLoading(false);
    router.push("/");
  };

  return (
    <SafeAreaView style={styles.root}>
      <List.Item
        title="Import data"
        left={(props) => <List.Icon icon="google-spreadsheet" {...props} />}
        onPress={pickSheet}
      />
      <List.Item
        title="Export database"
        left={(props) => <List.Icon icon="database-export" {...props} />}
        onPress={handleExport}
      />
      <List.Item
        title="Import database"
        left={(props) => <List.Icon icon="database-import" {...props} />}
        onPress={handleImport}
      />
      <Portal>
        <Dialog visible={isLoading}>
          <Dialog.Content>
            <ActivityIndicator size="large" />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
