import RoleUsersManagement from "./RoleUsersManagement.jsx";

export default function AdminUsers(props) {
  return (
    <RoleUsersManagement
      {...props}
      roleType="user"
      activeSidebar="users"
      title="Users Management"
      subtitle="Manage user accounts only"
      addButtonLabel="Add New User"
    />
  );
}
