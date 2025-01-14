import { Control, Controller } from "react-hook-form";
import { View } from "react-native";
import { Text, TextInput } from "react-native-paper";

interface Props {
  placeHolder: string;
  name: string;
  control: Control<any>;
  password?: boolean;
}

export default function FormTextInput({
  placeHolder,
  name,
  control,
  password,
}: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value, onBlur }, fieldState }) => (
        <View>
          <TextInput
            label={placeHolder}
            value={value?.toString()}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            secureTextEntry={password}
          />
          {fieldState.error && (
            <Text variant="labelSmall" style={{ color: "red", marginTop: 5 }}>
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
}
