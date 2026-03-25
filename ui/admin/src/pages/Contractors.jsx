import RoleUsersManagement from "./RoleUsersManagement.jsx";

export default function AdminContractors(props) {
  return (
    <RoleUsersManagement
      {...props}
      roleType="contractor"
      activeSidebar="contractors"
      title="Contractors Management"
      subtitle="Manage contractor accounts only"
      addButtonLabel="Add New Contractor"
    />
  );
}
