import { ToastAndroid } from "react-native";

export default function toast(message: string, duration = 3000) {
  ToastAndroid.show(message, duration);
}
