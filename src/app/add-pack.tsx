import FormTextInput from "@/components/form-text-input";
import { db } from "@/db";
import { basePacksTable } from "@/db/schema";
import toast from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureException } from "@sentry/react-native";
import { eq } from "drizzle-orm";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Appbar, Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const packSchema = z.object({
  name: z.string().min(5).toUpperCase(),
  lcoPrice: z.coerce.number(),
  customerPrice: z.coerce.number(),
});

export default function AddPack() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { control, handleSubmit, reset } = useForm<z.infer<typeof packSchema>>({
    resolver: zodResolver(packSchema),
  });
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      db.query.basePacksTable
        .findFirst({ where: eq(basePacksTable.id, parseInt(id)) })
        .then((data) => {
          reset(data);
        });
    } else {
      reset({
        name: "",
        lcoPrice: undefined,
        customerPrice: undefined,
      });
    }
  }, [id]);

  const savePack = async (data: z.infer<typeof packSchema>) => {
    try {
      if (id) {
        await db
          .update(basePacksTable)
          .set(data)
          .where(eq(basePacksTable.id, parseInt(id)));
      } else {
        await db.insert(basePacksTable).values(data);
      }
      reset();
      router.back();
    } catch (e) {
      console.error(e);
      captureException(e);
      // @ts-expect-error - Message will be there
      toast(e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        name="/connection/add-pack"
        options={{
          title: "Add connection",
          headerLeft: (props) => (
            <Appbar.BackAction
              {...props}
              onPress={router.back}
              style={{ margin: 0, width: "auto", marginRight: 25 }}
            />
          ),
        }}
      />
      <Text variant="titleSmall">{t("createPackTitle")}</Text>
      <FormTextInput
        name="name"
        testId="pack-name"
        placeHolder={t("packName")}
        control={control}
      />
      <FormTextInput
        name="lcoPrice"
        testId="lco-price"
        placeHolder={t("lcoPrice")}
        control={control}
      />
      <FormTextInput
        name="customerPrice"
        testId="customer-price"
        placeHolder={t("customerPrice")}
        control={control}
      />
      <Button
        mode="contained"
        testID="save-pack-button"
        onPress={handleSubmit(savePack)}
        style={{ marginTop: 20 }}
      >
        {t("savePack")}
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, flex: 1, gap: 10 },
});
