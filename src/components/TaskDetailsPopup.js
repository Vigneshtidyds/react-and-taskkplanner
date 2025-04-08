import React from 'react';

const TaskDetailsModal = ({ task, buckets, onClose }) => {
  if (!task) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('custom-modal-overlay')) {
      onClose();
    }
  };

  // Helper function to format date to dd-mm-yyyy
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const getBucketName = (bucket_id) => {
    const bucket = buckets?.find((b) => b.id === bucket_id);
    return bucket ? bucket.name : 'No Bucket';
  };

  return (
    <div
      className="modal show d-block custom-modal-overlay"
      tabIndex="-1"
      role="dialog"
      onClick={handleOverlayClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div className="modal-content rounded-3 p-4">

          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 className="text-success fw-semibold mb-1">{getBucketName(task.bucket_id)}</h6>
              <h2 className="fw-bold mb-1">{task.name}</h2>
            </div>

            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Assign Button */}
          <div className="mb-3">
            <button className="btn btn-outline-secondary btn-sm me-2">Assign</button>

            {/* Assigned Users List */}
            <div className="mt-2">
              <h6 className="fw-semibold mb-1">Assigned Users:</h6>
              {task.assigned_users?.length > 0 ? (
                <ul className="mb-0">
                  {task.assigned_users.map((user) => (
                    <li key={user.id}>{user.email}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Unassigned</p>
              )}
            </div>
          </div>

          <hr />

          {/* Task Details Section */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Add label</h6>
            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label fw-semibold">Bucket</label>
                <select className="form-select" >
                  <option>{task.bucket_name || 'No Bucket'}</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Progress</label>
                <select className="form-select" >
                  <option>{task.progress || 'Not started'}</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Priority</label>
                <select className="form-select" >
                  <option>{task.priority || 'Medium'}</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Repeat</label>
                <select className="form-select" >
                  <option>{task.repeat || 'Does not repeat'}</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Start Date</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Start anytime"
                  value={formatDate(task.start_date)}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Due Date</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Due anytime"
                  value={formatDate(task.due_date)}
                  readOnly
                />
              </div>

            </div>

            <h6 className="fw-semibold mt-4 mb-2">Notes</h6>
            <textarea
              className="form-control"
              placeholder="Type a description or add notes here"
              rows="3"
              value={task.notes || ''}
              readOnly
            />
          </div>

          {/* Checklist */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Checklist</h6>
            <input type="text" className="form-control" placeholder="Add an item" />
          </div>

          {/* Comments */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Comments</h6>
            <button className="btn btn-outline-secondary btn-sm">Add attachment</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
