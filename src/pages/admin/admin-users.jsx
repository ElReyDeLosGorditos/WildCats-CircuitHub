import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import AdminHeader from "./AdminHeader";
import AddUser from "./add-user.jsx";
import UserModal from "./admin-user-modal.jsx"; // ✅ NEW
import "../../components/css/admin/admin-users.css";

const AdminManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users from Firebase:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =====================
     DELETE HANDLING
     ===================== */

  const handleDeleteUser = (user, e) => {
    e?.stopPropagation();
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);

      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  /* =====================
     FILTER USERS
     ===================== */

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
        fullName.includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
      <div className="AU-container">
        <div
            className={`AU-content-wrapper ${
                selectedUser || showAddModal || showDeleteConfirm ? "modal-blurred" : ""
            }`}
        >
          <AdminHeader />

          <div className="AU-dashboard">
            <div className="AU-header-row">
              <h1 className="AU-title">Manage Users</h1>
              <button
                  className="AU-add-user-btn"
                  onClick={() => setShowAddModal(true)}
              >
                + Add User
              </button>
            </div>

            <div className="AU-filters">
              <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="AU-search violet-input"
              />
            </div>

            <table className="AU-table">
              <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
              </thead>
              <tbody>
              {filteredUsers.map((user) => (
                  <tr key={user.id} className="AU-row">
                    <td onClick={() => setSelectedUser(user)}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td onClick={() => setSelectedUser(user)}>{user.email}</td>
                    <td onClick={() => setSelectedUser(user)}>{user.role}</td>
                    <td>
                      <button
                          className="AU-delete-icon-btn"
                          onClick={(e) => handleDeleteUser(user, e)}
                          title="Delete User"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================
         VIEW + EDIT MODAL
         ===================== */}
        {selectedUser && (
            <UserModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onDelete={(e) => handleDeleteUser(selectedUser, e)}
                onUpdated={fetchUsers}
            />
        )}

        {/* =====================
         ADD USER MODAL
         ===================== */}
        {showAddModal && (
            <AddUser
                onClose={() => {
                  setShowAddModal(false);
                  setTimeout(fetchUsers, 300);
                }}
            />
        )}

        {/* =====================
         DELETE CONFIRM MODAL
         ===================== */}
        {showDeleteConfirm && (
            <div className="AU-delete-modal-overlay">
              <div className="AU-delete-modal">
                <h3>Confirm Delete</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {userToDelete?.firstName} {userToDelete?.lastName}
                  </strong>
                  ?
                </p>
                <p className="AU-warning">This action cannot be undone.</p>
                <div className="AU-delete-buttons">
                  <button
                      className="AU-cancel-delete-btn"
                      onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                      className="AU-confirm-delete-btn"
                      onClick={confirmDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default AdminManageUsers;
