import { db } from "@/db";
import { areasTable } from "@/db/schema";
import toast from "@/lib/toast";
import { captureException } from "@sentry/react-native";
import { eq } from "drizzle-orm";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Appbar, Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddArea() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [areaName, setAreaName] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      db.query.areasTable
        .findFirst({ where: eq(areasTable.id, parseInt(id)) })
        .then((area) => {
          if (area) {
            setAreaName(area.name);
          }
        });
    } else {
      setAreaName("");
    }
  }, [id]);

  const saveArea = async () => {
    try {
      if (areaName.length === 0) {
        toast(t("emptyName"));
      } else {
        if (id) {
          await db
            .update(areasTable)
            .set({ name: areaName.toUpperCase() })
            .where(eq(areasTable.id, parseInt(id)));
        } else {
          await db.insert(areasTable).values({ name: areaName });
        }
        setAreaName("");
        toast("Success");
        router.back();
      }
    } catch (e) {
      captureException(e);
      console.error(e);
      toast("Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        name="/connection/add-area"
        options={{
          title: "Add area",
          headerLeft: (props) => (
            <Appbar.BackAction
              {...props}
              onPress={router.back}
              style={{ margin: 0, width: "auto", marginRight: 25 }}
            />
          ),
        }}
      />
      <TextInput
        label="Area name"
        testID="area-name"
        value={areaName}
        onChangeText={setAreaName}
        mode="outlined"
      />
      <Button
        mode="contained"
        disabled={areaName.length === 0}
        onPress={saveArea}
        style={styles.save}
      >
        Save
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 10,
  },
  save: {
    marginTop: 10,
  },
});
