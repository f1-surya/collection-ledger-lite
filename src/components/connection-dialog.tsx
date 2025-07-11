import { markConnectionAsPaid } from "@/db/connection-funcs";
import { GetConnectionsReturnType } from "@/hooks/connections";
import toast from "@/lib/toast";
import { isThisMonth } from "date-fns";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import {
  Button,
  Dialog,
  Icon,
  IconButton,
  Portal,
  Text,
} from "react-native-paper";

interface Props {
  currConnection: GetConnectionsReturnType[number] | null;
  setCurrConnection: (a: GetConnectionsReturnType[number] | null) => void;
  refresh: () => void;
}

export default function ConnectionDialog({
  currConnection,
  setCurrConnection,
  refresh,
}: Props) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();

  const viewConnection = () => {
    if (!currConnection) return;
    router.push({
      pathname: "/connection",
      params: { id: currConnection?.id },
    });
    setCurrConnection(null);
  };

  const launchSmsTamil = () => {
    if (!currConnection) return;
    const uri = encodeURI(
      `sms://${currConnection.phoneNumber}?body=${t("sms")}`,
    );
    Linking.openURL(uri);
  };

  const copySmc = () => {
    if (!currConnection) return;
    Clipboard.setStringAsync(currConnection.boxNumber);
    toast("SMC number copied to clipboard.");
  };

  const markAsPaid = async () => {
    if (!currConnection) return;
    try {
      await markConnectionAsPaid(currConnection.id, currConnection.basePack);
      refresh();
      setCurrConnection(null);
    } catch (e) {
      console.error(e);
      toast("Something went wrong");
    }
  };
  return (
    <Portal>
      <Dialog
        visible={currConnection !== null}
        onDismiss={() => setCurrConnection(null)}
      >
        <Dialog.Title>{currConnection?.name}</Dialog.Title>
        <Dialog.Content>
          <Pressable onPress={copySmc}>
            <Text variant="titleMedium">SMC #{currConnection?.boxNumber}</Text>
          </Pressable>
          <Text
            variant="titleMedium"
            style={{ color: colorScheme === "dark" ? "cyan" : "blue" }}
          >
            Plan name: {currConnection?.basePack.name}
          </Text>
          <View style={styles.address}>
            <Icon source="map-marker" size={20} />
            <Text variant="bodyLarge">{currConnection?.area}</Text>
          </View>
          {currConnection?.phoneNumber && (
            <View
              style={[
                styles.contact,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "darkgray" : "lightgray",
                },
              ]}
            >
              <IconButton
                icon="android-messages"
                mode="contained"
                onPress={launchSmsTamil}
              />
              <IconButton
                icon="phone"
                mode="contained"
                onPress={() =>
                  Linking.openURL(`tel://${currConnection!.phoneNumber}`)
                }
              />
              <IconButton
                icon="whatsapp"
                mode="contained"
                onPress={() =>
                  Linking.openURL(
                    `https://wa.me/${currConnection!.phoneNumber}`,
                  )
                }
              />
              <Text variant="titleMedium">{currConnection?.phoneNumber}</Text>
            </View>
          )}
          <Text style={styles.prices}>
            MRP: ₹
            {(currConnection?.basePack.customerPrice ?? 0) +
              (currConnection?.addonPrices ?? 0)}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button onPress={viewConnection}>View</Button>
          <Button
            testID="mark-as-paid-button"
            onPress={markAsPaid}
            disabled={
              Boolean(currConnection?.lastPayment) &&
              isThisMonth(currConnection!.lastPayment!)
            }
          >
            {t("markAsPaid")}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  prices: {
    fontWeight: "bold",
  },
  address: {
    flexDirection: "row",
    gap: 5,
    marginVertical: 10,
    alignItems: "center",
  },
  contact: {
    padding: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 10,
  },
});
