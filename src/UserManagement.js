import React, { useState, useEffect } from "react";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [confirmation, setConfirmation] = useState({
    show: false,
    userId: null,
    action: "",
  });

  const fetchUsers = () => {
    fetch("http://127.0.0.1:8000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { name, email, password } = newUser;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!name || !email || !password) {
      alert("All fields are required.");
      return false;
    }
    if (!emailRegex.test(email)) {
      alert("Invalid email format.");
      return false;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return false;
    }
    return true;
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setNewUser({ ...newUser, password: pass });
  };

  const handleAddUser = () => {
    if (!validateForm()) return;

    fetch("http://127.0.0.1:8000/api/add-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },  
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          alert("User added successfully!");
          setUsers([...users, { ...data.user, status: "enabled" }]);
          setNewUser({ name: "", email: "", password: "", role: "user" });
          setShowModal(false);
        } else {
          alert("Failed to add user.");
        }
      })
      .catch((err) => console.error("Error adding user:", err));
  };

  const confirmAction = (id, action) => {
    setConfirmation({ show: true, userId: id, action });
  };

  const proceedAction = () => {
    const { userId, action } = confirmation;
    const method = action === "delete" ? "DELETE" : "PUT";
    const url =
      action === "delete"
        ? `http://127.0.0.1:8000/api/users/${userId}`
        : `http://127.0.0.1:8000/api/users/${userId}/${action}`;

    fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then(() => {
        fetchUsers();
        setConfirmation({ show: false, userId: null, action: "" });
      })
      .catch((err) => console.error(`Error during ${action}:`, err));
  };

  return (
    <div className="container mt-4">
      <h2>User Management</h2>

      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        Add User
      </button>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={user.status === "disabled" ? "table-secondary" : ""}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.status === "disabled" ? (
                  <button className="btn btn-success btn-sm me-2" onClick={() => confirmAction(user.id, "enable")}>
                    Enable
                  </button>
                ) : (
                  <button className="btn btn-warning btn-sm me-2" onClick={() => confirmAction(user.id, "disable")}>
                    Disable
                  </button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => confirmAction(user.id, "delete")}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ➕ Add User Modal */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add User</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input
                  type="text"
                  name="name"
                  className="form-control mb-2"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={handleInputChange}
                />
                <input
                  type="email"
                  name="email"
                  className="form-control mb-2"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={handleInputChange}
                />
                <div className="input-group mb-2">
                  <input
                    type="text"
                    name="password"
                    className="form-control"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={handleInputChange}
                  />
                  <button className="btn btn-outline-secondary" onClick={generatePassword}>
                    Generate
                  </button>
                </div>
                <select name="role" className="form-control mb-2" value={newUser.role} onChange={handleInputChange}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn btn-success w-100" onClick={handleAddUser}>
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🛑 Confirmation Popup */}
      {confirmation.show && (
        <div className="modal fade show d-block bg-dark bg-opacity-50">
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Confirm Action</h5>
                <button type="button" className="btn-close" onClick={() => setConfirmation({ show: false })}></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to{" "}
                  <strong>{confirmation.action === "delete" ? "delete" : confirmation.action}</strong> this user?
                </p>
                <button className="btn btn-danger w-100 mb-2" onClick={proceedAction}>
                  Yes, Confirm
                </button>
                <button className="btn btn-secondary w-100" onClick={() => setConfirmation({ show: false })}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
