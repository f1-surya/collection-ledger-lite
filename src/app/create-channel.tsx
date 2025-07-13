import FormTextInput from "@/components/form-text-input";
import { db } from "@/db";
import { channelsTable } from "@/db/schema";
import toast from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { captureException } from "@sentry/react-native";
import { eq } from "drizzle-orm";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const addonSchema = z.object({
  name: z.string().min(5).toUpperCase(),
  lcoPrice: z.coerce.number(),
  customerPrice: z.coerce.number(),
});

export default function CreateAddon() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { control, handleSubmit, reset } = useForm<z.infer<typeof addonSchema>>(
    { resolver: zodResolver(addonSchema) },
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      db.query.channelsTable
        .findFirst({ where: eq(channelsTable.id, parseInt(id)) })
        .then((data) => {
          if (data) {
            reset(data);
          }
        });
    } else {
      reset({
        name: "",
        lcoPrice: undefined,
        customerPrice: undefined,
      });
    }
  }, [id]);

  const save = async (data: z.infer<typeof addonSchema>) => {
    try {
      if (id) {
        await db
          .update(channelsTable)
          .set(data)
          .where(eq(channelsTable.id, parseInt(id)));
      } else {
        await db.insert(channelsTable).values({ ...data });
      }
      reset();
      router.back();
    } catch (e) {
      console.error(e);
      captureException(e);
      toast("Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <Stack.Screen
        name="/connection/create-channel"
        options={{ title: "Add channel" }}
      />
      <Text variant="titleMedium" style={styles.title}>
        {t("createChannel")}
      </Text>
      <FormTextInput
        name="name"
        placeHolder={t("channelName")}
        control={control}
      />
      <FormTextInput
        name="lcoPrice"
        placeHolder={t("lcoPrice")}
        control={control}
      />
      <FormTextInput
        name="customerPrice"
        placeHolder={t("customerPrice")}
        control={control}
      />
      <Button
        mode="contained"
        onPress={handleSubmit(save)}
        style={{ marginTop: 20 }}
      >
        Save
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 5,
    gap: 5,
  },
  title: {
    textAlign: "center",
    marginVertical: 5,
  },
});
