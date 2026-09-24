import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  NavLink
} from "react-router-dom";

import { useEffect, useState } from "react";

import "./index.css";

const API = "https://avipaw-rescue-production.up.railway.app/api";

async function uploadToImgBB(file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(
    "https://avipaw-rescue-production.up.railway.app/api/upload",
    { method: "POST", body: formData }
  );
  const data = await response.json();
  if (!response.ok || !data.url) {
    throw new Error(data.message || "Upload failed.");
  }
  return data.url;
}

function ImageUploadField({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFilePick(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await uploadToImgBB(file);
      onChange(url);
    } catch (err) {
      setUploadError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <input
        type="text"
        name="image"
        className="admin-form-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="https://images.unsplash.com/..."
      />

      <label
        className="admin-primary-button"
        style={{
          display: "inline-block",
          marginTop: "8px",
          padding: "10px 18px",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.6 : 1
        }}
      >
        {uploading ? "Uploading..." : "Choose File From PC"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFilePick}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {uploadError && (
        <p style={{ color: "#c0392b", fontSize: "13px", margin: "8px 0 0" }}>
          {uploadError}
        </p>
      )}

      {value && (
        <div style={{ marginTop: "10px" }}>
          <img
            src={value}
            alt="Preview"
            style={{
              width: "140px",
              height: "100px",
              objectFit: "cover",
              borderRadius: "10px",
              border: "1px solid #e2d5c7"
            }}
          />
        </div>
      )}
    </div>
  );
}

const animalPictures = [
  "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1648326665457-6e0669e6bc8c?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1781195693659-fd725cea602b?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1709788938324-889c6171e718?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1784058793086-0ef15cf76237?auto=format&fit=crop&w=200&q=80"
];

function getAdminToken() {
  return sessionStorage.getItem("adminToken");
}

function getAdminUser() {
  try {
    return JSON.parse(sessionStorage.getItem("adminUser") || "null");
  } catch {
    return null;
  }
}

function saveAdminLogin(data) {
  sessionStorage.setItem("adminToken", data.token);
  sessionStorage.setItem("adminUser", JSON.stringify(data.user));
}

function logoutAdmin() {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminUser");
}

function AdminRoute({ children }) {
  const token = getAdminToken();
  const user = getAdminUser();

  if (!token || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminLayout({ children }) {
  const navigate = useNavigate();
  const user = getAdminUser();

  function handleLogout() {
    logoutAdmin();
    navigate("/login");
  }

  return (
    <div className="admin-app">
      <header className="admin-navbar">
        <Link to="/dashboard" className="admin-logo">
          AVIPAW RESCUE
        </Link>

        <nav className="admin-nav-links">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => (isActive ? "admin-nav-active" : "")}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/animals"
            className={({ isActive }) => (isActive ? "admin-nav-active" : "")}
          >
            Animals
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) => (isActive ? "admin-nav-active" : "")}
          >
            Users
          </NavLink>

          <NavLink
            to="/stories"
            className={({ isActive }) => (isActive ? "admin-nav-active" : "")}
          >
            Stories
          </NavLink>

          <a href="http://localhost:5173/" target="_blank" rel="noreferrer">
            Website
          </a>
        </nav>

        <div className="admin-navbar-user">
          <span className="admin-user-name">
            {user?.name || "Administrator"}
          </span>

          <button
            type="button"
            className="admin-navbar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const existingToken = getAdminToken();
  const existingUser = getAdminUser();

  useEffect(() => {
    if (existingToken && existingUser && existingUser.role === "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      if (!data.user || data.user.role !== "admin") {
        throw new Error("This account does not have administrator access.");
      }

      saveAdminLogin(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-brand">AVIPAW RESCUE</div>

        <p className="admin-login-label">AVIPAW RESCUE ADMIN</p>

        <h1 className="admin-login-title">Admin Login</h1>

        <p className="admin-login-description">
          Sign in to manage animals, users and your rescue website.
        </p>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input
              type="email"
              className="admin-form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Password</label>
            <input
              type="password"
              className="admin-form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-primary-button admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <a href="http://localhost:5173/" className="admin-login-back">
          ← Back to Avipaw Rescue Website
        </a>
      </div>
    </div>
  );
}

function Dashboard() {
  return (
    <main className="admin-dashboard">
      <section className="admin-intro">
        <p className="admin-small-title">AVIPAW RESCUE ADMIN</p>
        <h1 className="admin-main-title">Admin Dashboard</h1>
        <p className="admin-subtitle">
          Manage your animal rescue website from one place.
        </p>
      </section>

      <section className="admin-block-grid">
        <Link to="/animals" className="admin-block">
          <div className="admin-block-icon">🐾</div>
          <div className="admin-block-content">
            <h2 className="admin-block-title">Manage Animals</h2>
            <p className="admin-block-description">
              Add, edit and delete animals from your rescue database.
            </p>
          </div>
          <div className="admin-block-arrow">→</div>
        </Link>

        <Link to="/users" className="admin-block">
          <div className="admin-block-icon">👥</div>
          <div className="admin-block-content">
            <h2 className="admin-block-title">Manage Users</h2>
            <p className="admin-block-description">
              View, create, edit and delete registered users.
            </p>
          </div>
          <div className="admin-block-arrow">→</div>
        </Link>

        <a
          href="http://localhost:5173/"
          target="_blank"
          rel="noreferrer"
          className="admin-block"
        >
          <div className="admin-block-icon">🌐</div>
          <div className="admin-block-content">
            <h2 className="admin-block-title">Public Website</h2>
            <p className="admin-block-description">
              Open the Avipaw Rescue website visitors see.
            </p>
          </div>
          <div className="admin-block-arrow">→</div>
        </a>

        <Link to="/stories" className="admin-block">
          <div className="admin-block-icon">❤️</div>
          <div className="admin-block-content">
            <h2 className="admin-block-title">Rescue Stories</h2>
            <p className="admin-block-description">
              View the rescue stories and successful second chances.
            </p>
          </div>
          <div className="admin-block-arrow">→</div>
        </Link>
      </section>

      <a href="http://localhost:5173/" className="admin-back">
        ← Back to Avipaw Rescue Website
      </a>
    </main>
  );
}function AnimalsPage() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState(null);

  const emptyForm = {
    name: "",
    species: "Dog",
    age: "",
    gender: "Male",
    status: "Available",
    description: "",
    image: ""
  };

  const [form, setForm] = useState(emptyForm);
  const token = getAdminToken();

  async function loadAnimals() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/animals`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load animals.");
      }

      setAnimals(data);
    } catch (err) {
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnimals();
  }, []);

  function openAddModal() {
    setEditingAnimal(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(animal) {
    setEditingAnimal(animal);
    setForm({
      name: animal.name || "",
      species: animal.species || "Dog",
      age: animal.age ?? "",
      gender: animal.gender || "Male",
      status: animal.status || "Available",
      description: animal.description || "",
      image: animal.image || ""
    });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingAnimal(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function validateAnimalForm() {
    if (!form.name.trim()) return "Animal name is required.";
    if (form.name.trim().length < 2)
      return "Animal name must be at least 2 characters.";
    if (form.age === "" || Number(form.age) < 0)
      return "Please enter a valid age.";
    if (!form.description.trim()) return "Description is required.";
    if (form.description.trim().length < 10)
      return "Description must be at least 10 characters.";
    if (!form.image.trim()) return "Image is required.";
    return "";
  }

  async function handleSaveAnimal(event) {
    event.preventDefault();

    const validationError = validateAnimalForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Your admin session has expired. Please log in again.");
      return;
    }

    setError("");

    const payload = {
      name: form.name.trim(),
      species: form.species,
      age: Number(form.age),
      gender: form.gender,
      status: form.status,
      description: form.description.trim(),
      image: form.image.trim()
    };

    try {
      if (editingAnimal) {
        const response = await fetch(
          `${API}/animals/${editingAnimal._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to update animal.");
        }

        setAnimals((previous) =>
          previous.map((animal) =>
            animal._id === editingAnimal._id ? data : animal
          )
        );
      } else {
        const response = await fetch(`${API}/animals`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to create animal.");
        }

        setAnimals((previous) => [data, ...previous]);
      }

      closeModal();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  async function handleDeleteAnimal(animal) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${animal.name}?`
    );

    if (!confirmed) return;

    if (!token) {
      setError("Your admin session has expired.");
      return;
    }

    try {
      const response = await fetch(`${API}/animals/${animal._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete animal.");
      }

      setAnimals((previous) =>
        previous.filter((item) => item._id !== animal._id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete animal.");
    }
  }

  const filteredAnimals = animals.filter((animal) => {
    const searchText = search.toLowerCase().trim();
    if (!searchText) return true;

    return (
      animal.name?.toLowerCase().includes(searchText) ||
      animal.species?.toLowerCase().includes(searchText) ||
      animal.status?.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="management-page">
      <div className="management-header">
        <div>
          <p className="admin-small-title">AVIPAW RESCUE</p>
          <h1 className="management-title">Manage Animals</h1>
          <p className="management-subtitle">
            Add, edit and manage animals in your rescue database.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={openAddModal}
        >
          + Add Animal
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="management-search">
        <input
          type="text"
          placeholder="Search by animal name, species or status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="management-loading">Loading animals...</div>
      ) : filteredAnimals.length === 0 ? (
        <div className="management-empty">No animals found.</div>
      ) : (
        <div className="management-table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>Animal</th>
                <th>Species</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAnimals.map((animal) => {
                const originalIndex = animals.findIndex(
                  (item) => item._id === animal._id
                );

                const animalPicture =
                  animal.image ||
                  animalPictures[originalIndex % animalPictures.length];

                return (
                  <tr key={animal._id}>
                    <td>
                      <div
                        className="animal-table-name"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px"
                        }}
                      >
                        <img
                          src={animalPicture}
                          alt={animal.name}
                          style={{
                            width: "58px",
                            height: "58px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "2px solid #e2d5c7",
                            background: "#f3eee8"
                          }}
                        />
                        <span>{animal.name}</span>
                      </div>
                    </td>

                    <td>{animal.species}</td>
                    <td>{animal.age} years</td>
                    <td>{animal.gender}</td>

                    <td>
                      <span
                        className={`status-badge ${
                          animal.status === "Available"
                            ? "status-available"
                            : animal.status === "Adopted"
                            ? "status-adopted"
                            : "status-treatment"
                        }`}
                      >
                        {animal.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => openEditModal(animal)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => handleDeleteAnimal(animal)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="modal-box">
            <h2 className="modal-title">
              {editingAnimal ? "Edit Animal" : "Add Animal"}
            </h2>

            <form onSubmit={handleSaveAnimal}>
              <div className="admin-form-group">
                <label className="admin-form-label">Animal Name</label>
                <input
                  name="name"
                  className="admin-form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Buddy"
                />
              </div>

              <div className="form-two-columns">
                <div className="admin-form-group">
                  <label className="admin-form-label">Species</label>
                  <select
                    name="species"
                    className="admin-form-select"
                    value={form.species}
                    onChange={handleChange}
                  >
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit">Rabbit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Age</label>
                  <input
                    type="number"
                    min="0"
                    name="age"
                    className="admin-form-input"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="2"
                  />
                </div>
              </div>

              <div className="form-two-columns">
                <div className="admin-form-group">
                  <label className="admin-form-label">Gender</label>
                  <select
                    name="gender"
                    className="admin-form-select"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    name="status"
                    className="admin-form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  name="description"
                  className="admin-form-textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell visitors about this animal..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Image</label>
                <ImageUploadField
                  value={form.image}
                  onChange={(url) =>
                    setForm((previous) => ({ ...previous, image: url }))
                  }
                />
              </div>

              {error && <div className="admin-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="admin-primary-button">
                  {editingAnimal ? "Save Changes" : "Add Animal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const emptyForm = { name: "", email: "", password: "", role: "user" };
  const [form, setForm] = useState(emptyForm);
  const token = getAdminToken();

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load users.");
      }

      setUsers(data);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openAddModal() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "user"
    });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function validateForm() {
    if (!form.name.trim()) return "Name is required.";
    if (form.name.trim().length < 2)
      return "Name must be at least 2 characters.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.email.includes("@")) return "Please enter a valid email.";
    if (!editingUser && form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (editingUser && form.password && form.password.length < 6)
      return "Password must be at least 6 characters.";
    if (form.role !== "user" && form.role !== "admin")
      return "Please select a valid role.";
    return "";
  }

  async function handleSaveUser(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role
    };

    if (form.password) payload.password = form.password;

    try {
      if (editingUser) {
        const response = await fetch(
          `${API}/users/${editingUser._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to update user.");
        }

        setUsers((previous) =>
          previous.map((user) =>
            user._id === editingUser._id ? data.user : user
          )
        );
      } else {
        const response = await fetch(`${API}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, password: form.password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to create user.");
        }

        setUsers((previous) => [data.user, ...previous]);
      }

      closeModal();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  async function handleDeleteUser(user) {
    const currentUser = getAdminUser();

    if (currentUser && currentUser.id === user._id) {
      setError("You cannot delete your own admin account.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${user.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/users/${user._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete user.");
      }

      setUsers((previous) =>
        previous.filter((item) => item._id !== user._id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete user.");
    }
  }

  const filteredUsers = users.filter((user) => {
    const text = search.toLowerCase().trim();
    if (!text) return true;

    return (
      user.name?.toLowerCase().includes(text) ||
      user.email?.toLowerCase().includes(text) ||
      user.role?.toLowerCase().includes(text)
    );
  });

  return (
    <main className="management-page">
      <div className="management-header">
        <div>
          <p className="admin-small-title">AVIPAW RESCUE</p>
          <h1 className="management-title">Manage Users</h1>
          <p className="management-subtitle">
            View and manage registered Avipaw Rescue users.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={openAddModal}
        >
          + Add User
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="management-search">
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="management-loading">Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="management-empty">No users found.</div>
      ) : (
        <div className="management-table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="animal-table-name">{user.name}</div>
                  </td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`role-badge ${
                        user.role === "admin" ? "role-admin" : "role-user"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="modal-box">
            <h2 className="modal-title">
              {editingUser ? "Edit User" : "Add User"}
            </h2>

            <form onSubmit={handleSaveUser}>
              <div className="admin-form-group">
                <label className="admin-form-label">Full Name</label>
                <input
                  name="name"
                  className="admin-form-input"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="User name"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="admin-form-input"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  {editingUser ? "New Password (optional)" : "Password"}
                </label>
                <input
                  type="password"
                  name="password"
                  className="admin-form-input"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Role</label>
                <select
                  name="role"
                  className="admin-form-select"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && <div className="admin-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="admin-primary-button">
                  {editingUser ? "Save Changes" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const emptyForm = {
    title: "",
    animalName: "",
    description: "",
    image: "",
    date: ""
  };

  const [form, setForm] = useState(emptyForm);
  const token = getAdminToken();

  async function loadStories() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/stories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load rescue stories.");
      }

      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  function openAddModal() {
    setEditingStory(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEditModal(story) {
    setEditingStory(story);
    setForm({
      title: story.title || "",
      animalName: story.animalName || "",
      description: story.description || "",
      image: story.image || "",
      date: story.date || ""
    });
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingStory(null);
    setForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSaveStory(event) {
    event.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Story title is required.");
      return;
    }

    if (!form.animalName.trim()) {
      setError("Animal name is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Story description is required.");
      return;
    }

    if (!token) {
      setError("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      const url = editingStory
        ? `${API}/stories/${editingStory._id}`
        : `${API}/stories`;

      const response = await fetch(url, {
        method: editingStory ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title.trim(),
          animalName: form.animalName.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
          date: form.date
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save rescue story.");
      }

      if (editingStory) {
        setStories((previous) =>
          previous.map((story) =>
            story._id === editingStory._id ? data : story
          )
        );
      } else {
        setStories((previous) => [data, ...previous]);
      }

      closeModal();
    } catch (err) {
      setError(err.message || "Unable to save rescue story.");
    }
  }

  async function handleDeleteStory(story) {
    if (!window.confirm(`Are you sure you want to delete "${story.title}"?`)) {
      return;
    }

    if (!token) {
      setError("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch(`${API}/stories/${story._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete rescue story.");
      }

      setStories((previous) =>
        previous.filter((item) => item._id !== story._id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete rescue story.");
    }
  }

  const filteredStories = stories.filter((story) => {
    const text = search.toLowerCase().trim();
    if (!text) return true;

    return (
      story.title?.toLowerCase().includes(text) ||
      story.animalName?.toLowerCase().includes(text) ||
      story.description?.toLowerCase().includes(text)
    );
  });

  return (
    <main className="management-page">
      <div className="management-header">
        <div>
          <p className="admin-small-title">AVIPAW RESCUE</p>
          <h1 className="management-title">Rescue Stories</h1>
          <p className="management-subtitle">
            Add, edit and manage rescue stories shown on the public website.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={openAddModal}
        >
          + Add Story
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="management-search">
        <input
          type="text"
          placeholder="Search by title, animal name or description..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="management-loading">Loading stories...</div>
      ) : filteredStories.length === 0 ? (
        <div className="management-empty">No rescue stories found.</div>
      ) : (
        <div className="management-table-wrapper">
          <table className="management-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Animal</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStories.map((story) => (
                <tr key={story._id}>
                  <td>
                    {story.image ? (
                      <img
                        src={story.image}
                        alt={story.animalName}
                        style={{
                          width: "58px",
                          height: "58px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #e2d5c7",
                          background: "#f3eee8"
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "58px",
                          height: "58px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f3eee8",
                          border: "2px solid #e2d5c7"
                        }}
                      >
                        ❤️
                      </div>
                    )}
                  </td>

                  <td>
                    <div className="animal-table-name">{story.title}</div>
                  </td>

                  <td>{story.animalName}</td>
                  <td>{story.date || "—"}</td>

                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() => openEditModal(story)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => handleDeleteStory(story)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="modal-box">
            <h2 className="modal-title">
              {editingStory ? "Edit Rescue Story" : "Add Rescue Story"}
            </h2>

            <form onSubmit={handleSaveStory}>
              <div className="admin-form-group">
                <label className="admin-form-label">Story Title</label>
                <input
                  name="title"
                  className="admin-form-input"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Story title"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Animal Name</label>
                <input
                  name="animalName"
                  className="admin-form-input"
                  value={form.animalName}
                  onChange={handleChange}
                  placeholder="Animal name"
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Description</label>
                <textarea
                  name="description"
                  className="admin-form-textarea"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write the rescue story..."
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Image</label>
                <ImageUploadField
                  value={form.image}
                  onChange={(url) =>
                    setForm((previous) => ({ ...previous, image: url }))
                  }
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  className="admin-form-input"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>

              {error && <div className="admin-error">{error}</div>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="admin-primary-button">
                  {editingStory ? "Save Changes" : "Add Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/dashboard"
          element={
            <AdminRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/animals"
          element={
            <AdminRoute>
              <AdminLayout>
                <AnimalsPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <UsersPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/stories"
          element={
            <AdminRoute>
              <AdminLayout>
                <StoriesPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
