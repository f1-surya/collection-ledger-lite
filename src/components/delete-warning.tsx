import i18n from "@/lib/i18";
import { Button, Dialog, Portal, Text } from "react-native-paper";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteWarning({ open, onClose, onConfirm }: Props) {
  return (
    <Portal>
      <Dialog visible={open} onDismiss={onClose}>
        <Dialog.Title>{i18n.get("warning")} !!!</Dialog.Title>
        <Dialog.Content>
          <Text>{i18n.get("deleteWarning")}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onClose}>Cancel</Button>
          <Button onPress={onConfirm}>Continue</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
