import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
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

  // ✅ Move fetchUsers outside useEffect so we can call it again
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
      setSelectedUser(null);
      fetchUsers(); // ✅ Refresh after closing edit modal
    }, 300);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setTimeout(() => {
      fetchUsers(); // ✅ Refresh after closing add modal
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

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
        fullName.includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
      <div className={`AU-container ${(selectedUser || showEditModal || showAddModal) ? "modal-blurred" : ""}`}>
        <AdminHeader />

        <div className="AU-dashboard">
          <div className="AU-header-row">
            <h1 className="AU-title">Manage Users</h1>
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
            </tr>
            </thead>
            <tbody>
            {filteredUsers.map((user) => (
                <tr
                    key={user.id}
                    className="AU-row"
                    onClick={() => setSelectedUser(user)}
                >
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>

        {/* VIEW MODAL */}
        {selectedUser && !showEditModal && (
            <div className="modal-overlay" onClick={handleBackgroundClick}>
              <ViewUser
                  user={selectedUser}
                  onClose={handleCloseViewModal}
                  onEdit={handleOpenEditModal}
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
      </div>
  );
};

export default AdminManageUsers;
