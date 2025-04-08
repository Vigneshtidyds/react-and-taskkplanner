import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminDashboard = () => {
  const [admin, setAdmin] = useState({
    name: "Admin",
    email: "admin@gmail.com",
    profilePic: "https://github.com/mdo.png", // Default profile pic
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: admin.name,
    password: "",
    profilePic: null,
  });

  const navigate = useNavigate();

  // ✅ Fetch Profile Data from Laravel API
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        setAdmin({
          name: response.data.name,
          email: response.data.email,
          profilePic: response.data.profile_pic
            ? `http://127.0.0.1:8000${response.data.profile_pic}`
            : "https://github.com/mdo.png", // Fallback image
        });
        setProfileData({ ...profileData, name: response.data.name });
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, []);

  // ✅ Handle Profile Changes
  const handleProfileChange = (e) => {
    if (e.target.name === "profilePic") {
      setProfileData({ ...profileData, profilePic: e.target.files[0] });
    } else {
      setProfileData({ ...profileData, [e.target.name]: e.target.value });
    }
  };

  // ✅ Save Profile Updates
  const handleProfileUpdate = async () => {
    const formData = new FormData();
    formData.append("name", profileData.name);
    if (profileData.password) {
      formData.append("password", profileData.password);
    }
    if (profileData.profilePic) {
      formData.append("profile_pic", profileData.profilePic);
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/update-profile", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile updated successfully!");
      setAdmin({
        ...admin,
        name: response.data.name,
        profilePic: response.data.profile_pic
          ? `http://127.0.0.1:8000${response.data.profile_pic}`
          : admin.profilePic,
      });
      setShowProfileModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  // ✅ Logout Function
  const handleLogout = () => {
    alert("Logging out...");
    localStorage.removeItem("token"); // Clear token
    navigate("/");
  };

  return (
    <div>
      <header className="p-3 mb-3 border-bottom bg-light">
        <div className="container d-flex justify-content-between align-items-center">
          <h2>Taskplanner</h2>

          {/* Profile Dropdown */}
          <div className="dropdown">
            <button className="btn btn-light dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)}>
              <img src={admin.profilePic} alt="Profile" width="32" height="32" className="rounded-circle" />
            </button>
            {showDropdown && (
              <ul className="dropdown-menu show">
                <li>
                  <button className="dropdown-item btn btn-link">{admin.name}</button>
                </li>
                <li>
                  <button className="dropdown-item btn btn-link" onClick={() => setShowProfileModal(true)}>
                    Profile Settings
                  </button>
                </li>
                <li>
                  <button className="dropdown-item btn btn-link" onClick={() => navigate("/user-management")}>
                    User Management
                  </button>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item btn btn-link text-danger" onClick={handleLogout}>
                    Sign out
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </header>

      {/* ✅ Profile Settings Modal */}
      {showProfileModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Profile Settings</h5>
                <button type="button" className="btn-close" onClick={() => setShowProfileModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={profileData.profilePic || admin.profilePic}
                  alt="Profile"
                  width="100"
                  height="100"
                  className="rounded-circle mb-3"
                />
                <input
                  type="text"
                  name="name"
                  className="form-control my-2"
                  placeholder="Name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                />
                <input
                  type="password"
                  name="password"
                  className="form-control my-2"
                  placeholder="New Password"
                  onChange={handleProfileChange}
                />
                <input
                  type="file"
                  name="profilePic"
                  className="form-control my-2"
                  onChange={handleProfileChange}
                />
                <button className="btn btn-success w-100" onClick={handleProfileUpdate}>
                  Update Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
