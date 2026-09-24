import { useEffect, useState } from "react";

const API = "http://localhost:5000/api";

function StoriesPage() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    animalName: "",
    description: "",
    date: "",
    image: "",
  });

  // =========================
  // LOAD STORIES
  // =========================

  async function loadStories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/stories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load stories");
      }

      setStories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Unable to load stories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =========================
  // ADD STORY
  // =========================

  function openAddStory() {
    setEditingStory(null);

    setFormData({
      title: "",
      animalName: "",
      description: "",
      date: "",
      image: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // =========================
  // EDIT STORY
  // =========================

  function openEditStory(story) {
    setEditingStory(story);

    setFormData({
      title: story.title || "",
      animalName: story.animalName || "",
      description: story.description || "",
      date: story.date || "",
      image: story.image || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  }

  // =========================
  // CLOSE MODAL
  // =========================

  function closeModal() {
    setShowModal(false);
    setEditingStory(null);

    setFormData({
      title: "",
      animalName: "",
      description: "",
      date: "",
      image: "",
    });

    setError("");
  }

  // =========================
  // SAVE / UPDATE STORY
  // =========================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.title.trim()) {
      setError("Please enter a story title.");
      return;
    }

    if (!formData.animalName.trim()) {
      setError("Please enter the animal name.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter the story description.");
      return;
    }

    try {
      const storyData = {
        title: formData.title,
        animalName: formData.animalName,
        description: formData.description,
        date: formData.date,
        image: formData.image,
      };

      let response;

      if (editingStory) {
        response = await fetch(
          `${API}/stories/${editingStory._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(storyData),
          }
        );
      } else {
        response = await fetch(`${API}/stories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(storyData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save story."
        );
      }

      if (editingStory) {
        setStories((previous) =>
          previous.map((story) =>
            story._id === data._id ? data : story
          )
        );

        setSuccess("Rescue story updated successfully.");
      } else {
        setStories((previous) => [data, ...previous]);

        setSuccess("Rescue story added successfully.");
      }

      closeModal();
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Something went wrong while saving."
      );
    }
  }

  // =========================
  // DELETE STORY
  // =========================

  async function deleteStory(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this rescue story?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API}/stories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete story."
        );
      }

      setStories((previous) =>
        previous.filter((story) => story._id !== id)
      );

      setSuccess("Rescue story deleted successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error.message || "Unable to delete rescue story."
      );
    }
  }

  return (
    <div className="management-page">

      {/* HEADER */}

      <div className="management-header">
        <div>
          <h1>Rescue Stories</h1>
          <p>
            Add, edit and manage rescue stories from your
            admin dashboard.
          </p>
        </div>

        <button
          className="edit-button"
          onClick={openAddStory}
        >
          + Add Story
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {/* ERROR */}

      {error && !showModal && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* STORIES */}

      {loading ? (
        <p>Loading rescue stories...</p>
      ) : stories.length === 0 ? (
        <p>No rescue stories found.</p>
      ) : (
        <div className="table-container">
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
              {stories.map((story) => (
                <tr key={story._id}>

                  <td>
                    {story.image ? (
                      <img
                        src={story.image}
                        alt={story.title}
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </td>

                  <td>{story.title}</td>

                  <td>{story.animalName}</td>

                  <td>{story.date || "—"}</td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() =>
                        openEditStory(story)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteStory(story._id)
                      }
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="modal-overlay">

          <div className="modal-box">

            <h2>
              {editingStory
                ? "Edit Rescue Story"
                : "Add Rescue Story"}
            </h2>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* TITLE */}

              <label>Story Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Enter story title"
              />

              {/* ANIMAL */}

              <label>Animal Name</label>

              <input
                type="text"
                name="animalName"
                value={formData.animalName}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Enter animal name"
              />

              {/* DESCRIPTION */}

              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Enter rescue story"
                rows="6"
              />

              {/* IMAGE URL */}

              <label>Story Image URL</label>

              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Paste image URL"
              />

              {/* IMAGE PREVIEW */}

              {formData.image && (
                <div
                  style={{
                    marginTop: "15px",
                    marginBottom: "15px",
                  }}
                >
                  <img
                    src={formData.image}
                    alt="Story preview"
                    style={{
                      width: "180px",
                      height: "130px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              )}

              {/* DATE */}

              <label>Date</label>

              <input
                type="text"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="admin-form-input"
                placeholder="Example: September 2026"
              />

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >

                <button
                  type="submit"
                  className="edit-button"
                >
                  {editingStory
                    ? "Update Story"
                    : "Save Story"}
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default StoriesPage;