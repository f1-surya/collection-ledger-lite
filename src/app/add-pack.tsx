import FormTextInput from "@/components/form-text-input";
import { db } from "@/db";
import { basePacksTable } from "@/db/schema";
import i18 from "@/lib/i18";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import Toast from "react-native-root-toast";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const packSchema = z.object({
  name: z.string().min(5),
  lcoPrice: z.coerce.number(),
  customerPrice: z.coerce.number(),
});

export default function AddPack() {
  const { control, handleSubmit, reset } = useForm<z.infer<typeof packSchema>>({
    resolver: zodResolver(packSchema),
  });

  const savePack = async (data: z.infer<typeof packSchema>) => {
    try {
      const res = await db.insert(basePacksTable).values(data);
      reset();
      router.back();
    } catch (error) {
      console.error(error);
      // @ts-expect-error
      Toast.show(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text variant="titleSmall">{i18.get("createPackTitle")}</Text>
      <FormTextInput
        name="name"
        placeHolder={i18.get("packName")}
        control={control}
      />
      <FormTextInput
        name="lcoPrice"
        placeHolder={i18.get("lcoPrice")}
        control={control}
      />
      <FormTextInput
        name="customerPrice"
        placeHolder={i18.get("customerPrice")}
        control={control}
      />
      <Button
        mode="contained"
        onPress={handleSubmit(savePack)}
        style={{ marginTop: 20 }}
      >
        {i18.get("savePack")}
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, flex: 1, gap: 10 },
});
