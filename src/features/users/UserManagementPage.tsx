"use client";

import { useNavigation } from "../navigation/location/NavigationContext";

export default function UserManagementPage() {
  const { selectedLocation } = useNavigation();
  return <div>{selectedLocation.name}</div>;
}
