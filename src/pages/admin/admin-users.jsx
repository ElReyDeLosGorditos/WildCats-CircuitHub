import React, { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import AdminHeader from "./AdminHeader";
import ViewUser from "./view-user.jsx";
import UpdateUser from "./edit-user.jsx";
import AddUser from "./add-user.jsx";
import "../../components/css/admin/admin-users.css";

const AdminManageUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
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

  const handleCloseViewModal = () => {
    setSelectedUser(null);
  };

  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setTimeout(() => {
      fetchUsers();
    }, 300);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setTimeout(() => {
      fetchUsers();
    }, 300);
  };

  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      if (showEditModal) {
        handleCloseEditModal();
      } else {
        handleCloseViewModal();
      }
    }
  };

  const handleDeleteUser = (user, e) => {
    e.stopPropagation();
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", userToDelete.id));
      setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      // Close view modal if the deleted user was being viewed
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
        fullName.includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
      <div className="AU-container">
        <div className={`AU-content-wrapper ${(selectedUser || showEditModal || showAddModal || showDeleteConfirm) ? "modal-blurred" : ""}`}>
          <AdminHeader />

          <div className="AU-dashboard">
            <div className="AU-header-row">
              <h1 className="AU-title">Manage Users</h1>
              <button className="AU-add-user-btn" onClick={() => setShowAddModal(true)}>
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
                  <tr
                      key={user.id}
                      className="AU-row"
                  >
                    <td onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
                      {user.email}
                    </td>
                    <td onClick={() => setSelectedUser(user)} style={{ cursor: "pointer" }}>
                      {user.role}
                    </td>
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

        {/* VIEW MODAL */}
        {selectedUser && !showEditModal && (
            <div className="modal-overlay" onClick={handleBackgroundClick}>
              <ViewUser
                  user={selectedUser}
                  onClose={handleCloseViewModal}
                  onEdit={handleOpenEditModal}
                  onDelete={(e) => handleDeleteUser(selectedUser, e || new Event('click'))}
              />
            </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && (
            <div className="modal-overlay" onClick={handleBackgroundClick}>
              <UpdateUser
                  user={selectedUser}
                  onClose={handleCloseEditModal}
              />
            </div>
        )}

        {/* ADD MODAL */}
        {showAddModal && (
            <AddUser onClose={handleCloseAddModal} />
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && (
            <div className="AU-delete-modal-overlay">
              <div className="AU-delete-modal">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?</p>
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
