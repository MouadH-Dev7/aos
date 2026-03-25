import RoleUsersManagement from "./RoleUsersManagement.jsx";

export default function AdminAgencies(props) {
  return (
    <RoleUsersManagement
      {...props}
      roleType="agency"
      activeSidebar="agencies"
      title="Agencies Management"
      subtitle="Manage agency accounts only"
      addButtonLabel="Add New Agency"
    />
  );
}
