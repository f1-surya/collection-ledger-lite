import { useTranslation } from "react-i18next";
import { Button, Dialog, Portal, Text } from "react-native-paper";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteWarning({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();

  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose}>
        <Dialog.Title>{t("warning")} !!!</Dialog.Title>
        <Dialog.Content>
          <Text>{t("deleteWarning")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose}>Cancel</Button>
          <Button onPress={onConfirm}>Continue</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
