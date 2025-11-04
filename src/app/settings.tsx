import { db } from "@/db";
import { connectionsTable } from "@/db/schema";
import { exportDb, importDb, importFromSheet } from "@/lib/data";
import { askPermission, saveFile } from "@/lib/file-system";
import { mmkv } from "@/lib/mmkv";
import { writeSheet } from "@/lib/sheet";
import toast from "@/lib/toast";
import { Picker } from "@react-native-picker/picker";
import { captureException } from "@sentry/react-native";
import { getDocumentAsync } from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Dialog,
  List,
  Portal,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Data() {
  const [isLoading, setIsLoading] = useState(false);
  const { i18n } = useTranslation();
  const theme = useTheme();

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
      captureException(e);
      toast("Something went wrong");
      setIsLoading(false);
    }
  };

  const exportAsSheet = async () => {
    setIsLoading(true);
    const conns = await db.query.connectionsTable.findMany({
      with: {
        area: true,
        basePack: true,
      },
      orderBy: connectionsTable.name,
    });
    const sheetData = {
      Connections: [
        ["NAME", "SMARTCARD", "ADDRESS", "PACKAGE"],
        ...conns.map((conn) => [
          conn.name,
          conn.boxNumber,
          conn.area.name,
          conn.basePack.name,
        ]),
      ],
    };

    const permissions = await askPermission();
    if (!permissions.granted) {
      return;
    }

    const file = writeSheet(sheetData);
    try {
      await saveFile(
        "Connections_List.xlsx",
        file,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        permissions.directoryUri,
      );
    } catch (e) {
      captureException(e);
      toast("Something went wrong");
    }
    setIsLoading(false);
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

  const handleLangChange = (newLang: string) => {
    i18n.changeLanguage(newLang);
    mmkv.set("lang", newLang);
  };

  return (
    <SafeAreaView style={styles.root}>
      <List.Section>
        <List.Subheader>Language</List.Subheader>
        <View
          style={[
            styles.dropdownWrapper,
            { borderColor: theme.colors.secondary },
          ]}
        >
          <Picker
            selectedValue={i18n.language}
            style={{ color: theme.colors.onBackground }}
            dropdownIconColor={theme.colors.secondary}
            onValueChange={handleLangChange}
          >
            <Picker.Item label="Tamil" value="tn" />
            <Picker.Item label="English" value="en" />
          </Picker>
        </View>
      </List.Section>
      <List.Section>
        <List.Subheader>Data</List.Subheader>
        <List.Item
          title="Import data"
          left={(props) => <List.Icon icon="google-spreadsheet" {...props} />}
          onPress={pickSheet}
        />
        <List.Item
          title="Export data"
          left={(props) => <List.Icon icon="file-export" {...props} />}
          onPress={exportAsSheet}
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
      </List.Section>
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
  dropdownWrapper: {
    marginHorizontal: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
