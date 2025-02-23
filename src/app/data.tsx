import { StyleSheet } from "react-native";
import {
  ActivityIndicator,
  Dialog,
  List,
  Portal,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDocumentAsync } from "expo-document-picker";
import toast from "@/lib/toast";
import * as FileSystem from "expo-file-system";
import { importFromSheet } from "@/lib/data";
import { useState } from "react";
import { router } from "expo-router";

export default function Advanced() {
  const [isLoading, setIsLoading] = useState(false);
  const pickSheet = async () => {
    try {
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
        setIsLoading(true);
        importFromSheet(base64)
          .then(() => {
            setIsLoading(false);
            router.replace("/");
          })
          .catch(() => setIsLoading(false));
      }
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <List.Item
        title="Import data"
        left={(props) => <List.Icon icon="google-spreadsheet" {...props} />}
        onPress={pickSheet}
      />
      <Portal>
        <Dialog visible={isLoading}>
          <ActivityIndicator />
          <Text>Loading...</Text>
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
