import FormTextInput from "@/components/form-text-input";
import { db } from "@/db";
import { areasTable, basePacksTable, connectionsTable } from "@/db/schema";
import i18 from "@/lib/i18";
import i18n from "@/lib/i18";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router } from "expo-router";
import { Check, ChevronDown, ChevronUp, Plus } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, useColorScheme, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput } from "react-native-paper";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";
import { z } from "zod";

const formSchema = z.object({
  boxNumber: z.string().min(10),
  name: z.string(),
  area: z.number(),
  phoneNumber: z.string().min(10),
  basePack: z.number(),
});

export default function AddConnection() {
  const { control, setValue, handleSubmit } = useForm<
    z.infer<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
  });
  const { data: packs } = useLiveQuery(db.select().from(basePacksTable));
  const { data: areas } = useLiveQuery(db.select().from(areasTable));
  const colorScheme = useColorScheme();
  const [addArea, setAddArea] = useState(false);
  const [areaName, setAreaName] = useState("");

  const saveArea = async () => {
    const res = await db.insert(areasTable).values({ name: areaName });
    setValue("area", res.lastInsertRowId);
    setAreaName("");
    setAddArea(false);
  };

  const saveConnection = async (data: z.infer<typeof formSchema>) => {
    try {
      await db.insert(connectionsTable).values(data);
      router.back();
      Toast.show(i18.get("savedConnection"));
    } catch (err) {
      console.error(err);
      // @ts-expect-error Message will be there
      Toast.show(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <FormTextInput
        name="name"
        placeHolder={i18n.get("customerName")}
        control={control}
      />
      <FormTextInput
        name="boxNumber"
        placeHolder={i18n.get("boxNumber")}
        control={control}
      />
      <FormTextInput
        name="phoneNumber"
        placeHolder={i18n.get("phoneNumber")}
        control={control}
      />
      <View style={styles.areaSelector}>
        <Controller
          name="area"
          control={control}
          render={({ field: { onChange }, fieldState }) => (
            <View style={{ width: "80%" }}>
              <SelectDropdown
                data={areas}
                renderButton={(selected, isOpened) => (
                  <View style={styles.dropDownButton}>
                    <Text style={styles.areaName}>
                      {selected?.name ?? "Select an area"}
                    </Text>
                    {!isOpened ? (
                      <ChevronDown
                        color={colorScheme === "dark" ? "white" : "black"}
                      />
                    ) : (
                      <ChevronUp
                        color={colorScheme === "dark" ? "white" : "black"}
                      />
                    )}
                  </View>
                )}
                renderItem={(item, _index, isSelected) => (
                  <View
                    style={
                      colorScheme === "dark"
                        ? styles.areaDark
                        : styles.areaLight
                    }
                  >
                    <Text>{item.name}</Text>
                    {isSelected && <Check />}
                  </View>
                )}
                onSelect={(item) => onChange(item.id)}
              />
              {fieldState.error && (
                <Text
                  variant="labelSmall"
                  style={{ color: "red", marginTop: 5 }}
                >
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />

        <Button
          mode="outlined"
          style={styles.addButton}
          onPress={() => setAddArea(true)}
        >
          <Plus color={colorScheme === "dark" ? "white" : "black"} size={20} />
        </Button>
      </View>
      <View style={styles.areaSelector}>
        <Controller
          name="basePack"
          control={control}
          render={({ field: { onChange }, fieldState }) => (
            <View style={{ width: "80%" }}>
              <SelectDropdown
                data={packs}
                renderButton={(selected, isOpened) => (
                  <View style={styles.dropDownButton}>
                    <Text style={styles.areaName}>
                      {selected?.name ?? "Select base pack"}
                    </Text>
                    {!isOpened ? (
                      <ChevronDown
                        color={colorScheme === "dark" ? "white" : "black"}
                      />
                    ) : (
                      <ChevronUp
                        color={colorScheme === "dark" ? "white" : "black"}
                      />
                    )}
                  </View>
                )}
                renderItem={(item, _index, isSelected) => (
                  <View
                    style={
                      colorScheme === "dark"
                        ? styles.areaDark
                        : styles.areaLight
                    }
                  >
                    <Text>{item.name}</Text>
                    {isSelected && <Check />}
                  </View>
                )}
                onSelect={(item) => onChange(item.id)}
              />
              {fieldState.error && (
                <Text
                  variant="labelSmall"
                  style={{ color: "red", marginTop: 5 }}
                >
                  {fieldState.error.message}
                </Text>
              )}
            </View>
          )}
        />
        <Button
          mode="outlined"
          style={styles.addButton}
          onPress={() => router.push("/add-pack")}
        >
          <Plus color={colorScheme === "dark" ? "white" : "black"} size={20} />
        </Button>
      </View>
      <Button onPress={handleSubmit(saveConnection)} mode="contained">
        {i18.get("save")}
      </Button>
      <Portal>
        <Dialog visible={addArea} onDismiss={() => setAddArea(false)}>
          <Dialog.Title>{i18n.get("addArea")}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={i18n.get("areaName")}
              mode="outlined"
              value={areaName}
              onChangeText={setAreaName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddArea(false)}>Cancel</Button>
            <Button onPress={saveArea}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 10,
    gap: 15,
  },
  areaSelector: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  areaLight: {
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
  },
  areaDark: {
    backgroundColor: "gray",
    padding: 10,
    flexDirection: "row",
  },
  dropDownButton: {
    width: "100%",
    flexDirection: "row",
    borderColor: "gray",
    borderRadius: 5,
    borderWidth: 2,
    height: 40,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  areaName: {
    fontWeight: 600,
    fontSize: 17,
  },
});
