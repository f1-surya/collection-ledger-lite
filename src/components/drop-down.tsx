import { StyleSheet, useColorScheme, View } from "react-native";
import { Icon, Text } from "react-native-paper";
import SelectDropdown from "react-native-select-dropdown";

interface DropDownProps {
  data: string[];
  onChange: (value: string) => void;
  defaultValue: string;
}

export default function Dropdown({
  data,
  onChange,
  defaultValue,
}: DropDownProps) {
  const colorScheme = useColorScheme();

  return (
    <SelectDropdown
      data={data}
      defaultValue={defaultValue}
      onSelect={(selectedItem) => onChange(selectedItem)}
      renderButton={(selected, isOpened) => (
        <View style={styles.dropDownButton}>
          <Text style={styles.areaName} numberOfLines={1}>
            {selected ?? "All"}
          </Text>
          <Icon source={isOpened ? "chevron-up" : "chevron-down"} size={25} />
        </View>
      )}
      renderItem={(item, _index, isSelected) => (
        <View
          style={colorScheme === "dark" ? styles.areaDark : styles.areaLight}
        >
          <Text>{item}</Text>
          {isSelected && <Icon source="check" size={20} />}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  dropDownButton: {
    width: "30%",
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
    width: "75%",
    fontWeight: 600,
    fontSize: 17,
    textOverflow: "ellipsis",
  },
  areaLight: {
    backgroundColor: "white",
    padding: 10,
    flexDirection: "row",
  },
  areaDark: {
    backgroundColor: "#262626",
    padding: 10,
    flexDirection: "row",
  },
});
