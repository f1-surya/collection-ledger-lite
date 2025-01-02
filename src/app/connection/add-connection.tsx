import FormTextInput from "@/components/form-text-input";
import { db } from "@/db";
import { areasTable, basePacksTable, connectionsTable } from "@/db/schema";
import i18n from "@/lib/i18";
import { zodResolver } from "@hookform/resolvers/zod";
import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { router, useLocalSearchParams } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, useColorScheme, View } from "react-native";
import {
  Button,
  Dialog,
  Icon,
  Portal,
  Text,
  TextInput,
} from "react-native-paper";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import SelectDropdown from "react-native-select-dropdown";
import { z } from "zod";

const formSchema = z.object({
  boxNumber: z.string().min(10).toLowerCase(),
  name: z.string(),
  area: z.number(),
  phoneNumber: z.string().min(10),
  basePack: z.number(),
});

export default function AddConnection() {
  const { control, setValue, handleSubmit, getValues, reset } = useForm<
    z.infer<typeof formSchema>
  >({
    resolver: zodResolver(formSchema),
  });
  const { data: packs } = useLiveQuery(db.select().from(basePacksTable));
  const { data: areas } = useLiveQuery(db.select().from(areasTable));
  const colorScheme = useColorScheme();
  const [addArea, setAddArea] = useState(false);
  const [areaName, setAreaName] = useState("");
  const { id } = useLocalSearchParams<{ id?: string }>();

  useEffect(() => {
    if (!id) return;
    const fetchConnection = async () => {
      const connection = await db.query.connectionsTable.findFirst({
        where: eq(connectionsTable.id, parseInt(id)),
      });
      if (connection) {
        setValue("name", connection.name);
        setValue("boxNumber", connection.boxNumber);
        setValue("phoneNumber", connection.phoneNumber ?? "");
        setValue("area", connection.area);
        setValue("basePack", connection.basePack);
      }
    };
    fetchConnection();
  }, [id]);

  const saveArea = async () => {
    const res = await db.insert(areasTable).values({ name: areaName });
    setValue("area", res.lastInsertRowId);
    setAreaName("");
    setAddArea(false);
  };

  const saveConnection = async (data: z.infer<typeof formSchema>) => {
    try {
      const prevConnection = await db.query.connectionsTable.findFirst({
        where: eq(connectionsTable.boxNumber, data.boxNumber),
      });
      if (id) {
        if (prevConnection && prevConnection.id !== parseInt(id)) {
          Toast.show(i18n.get("duplicateSmc"));
          return;
        } else {
          await db
            .update(connectionsTable)
            .set(data)
            .where(eq(connectionsTable.id, parseInt(id)));
        }
      } else {
        if (prevConnection) {
          Toast.show(i18n.get("duplicateSmc"));
          return;
        } else {
          await db.insert(connectionsTable).values(data);
        }
      }

      reset();
      router.back();
      Toast.show(i18n.get("savedConnection"));
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
                renderButton={(_selected, isOpened) => (
                  <View style={styles.dropDownButton}>
                    <Text style={styles.areaName}>
                      {areas.find((area) => area.id === getValues().area)
                        ?.name ?? "Select an area"}
                    </Text>
                    <Icon
                      source={isOpened ? "chevron-up" : "chevron-down"}
                      size={25}
                    />
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
                    {isSelected && <Icon source="check" size={20} />}
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
          <Plus color={colorScheme === "dark" ? "white" : "black"} size={25} />
        </Button>
      </View>
      {!id && (
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
                      <Icon
                        source={isOpened ? "chevron-up" : "chevron-down"}
                        size={25}
                      />
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
                      {isSelected && <Icon source="check" size={20} />}
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
            onPress={() => router.push("/connection/add-pack")}
          >
            <Plus
              color={colorScheme === "dark" ? "white" : "black"}
              size={25}
            />
          </Button>
        </View>
      )}
      <Button onPress={handleSubmit(saveConnection)} mode="contained">
        {i18n.get("save")}
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
              autoFocus
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
