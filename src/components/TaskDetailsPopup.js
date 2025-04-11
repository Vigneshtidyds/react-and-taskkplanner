import React, { useState } from 'react';

const TaskDetailsModal = ({ task, buckets, onClose, currentUser, onTaskUpdate }) => {
  const [selectedBucket, setSelectedBucket] = useState(task.bucket_id);
  const [progress, setProgress] = useState(task.progress || 'Not Started');
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [startDate, setStartDate] = useState(task.start_date || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [notes, setNotes] = useState(task.notes || '');
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newItemVisible, setNewItemVisible] = useState(false);
  const [newItem, setNewItem] = useState('');
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [comments, setComments] = useState(task.comments || []);
  const [commentInput, setCommentInput] = useState('');

  if (!task) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('custom-modal-overlay')) {
      onClose();
    }
  };

  const handleAddChecklistItem = () => {
    if (newItem.trim() !== '') {
      setChecklist(prev => [...prev, newItem]);
      setNewItem('');
      setNewItemVisible(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => URL.createObjectURL(file));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleAddComment = () => {
    if (commentInput.trim() !== '') {
      const newComment = {
        user: currentUser?.name || "Unknown User",
        text: commentInput,
        time: new Date().toLocaleString(),
      };
      setComments(prev => [...prev, newComment]);
      setCommentInput('');
    }
  };

  const getBucketName = (bucket_id) => {
    const bucket = buckets?.find((b) => b.id === bucket_id);
    return bucket ? bucket.name : 'No Bucket';
  };

  const handleSave = () => {
    const updatedTask = {
      ...task,
      bucket_id: selectedBucket,
      progress,
      priority,
      start_date: startDate,
      due_date: dueDate,
      notes,
      checklist,
      attachments,
      comments,
    };

    onTaskUpdate(updatedTask);
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
              <h6 className="text-success fw-semibold mb-1">{getBucketName(selectedBucket)}</h6>
              <h2 className="fw-bold mb-1">{task.name}</h2>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Assigned Users */}
          <div className="mt-2">
            <h6 className="fw-semibold mb-1">Assigned Users:</h6>
            {task.assigned_users?.length > 0 ? (
              <div className="d-flex flex-wrap align-items-center gap-2">
                {task.assigned_users.map((user) => (
                  <div key={user.id} className="d-flex align-items-center">
                    <img
                      src={user.profile_pic}
                      alt={user.name}
                      className="rounded-circle"
                      width="32"
                      height="32"
                    />
                    <span className="ms-2 fw-medium">{user.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">Unassigned</p>
            )}
          </div>

          {/* Editable Fields */}
          <div className="mb-4 row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Bucket</label>
              <select className="form-select" value={selectedBucket} onChange={(e) => setSelectedBucket(e.target.value)}>
                {buckets.map(bucket => (
                  <option key={bucket.id} value={bucket.id}>{bucket.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Progress</label>
              <select className="form-select" value={progress} onChange={(e) => setProgress(e.target.value)}>
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Start Date</label>
              <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Due Date</label>
              <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">Notes</label>
              <textarea className="form-control" rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>
          </div>

          {/* Checklist */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Checklist</h6>
            {checklist.map((item, index) => (
              <div key={index} className="mb-1">{item}</div>
            ))}
            {newItemVisible ? (
              <input
                type="text"
                className="form-control mt-2"
                value={newItem}
                autoFocus
                onChange={(e) => setNewItem(e.target.value)}
                onBlur={handleAddChecklistItem}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
              />
            ) : (
              <div className="text-muted mt-2" style={{ cursor: 'pointer' }} onClick={() => setNewItemVisible(true)}>
                Add an item
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Attachments</h6>
            <div className="mb-2 d-flex flex-wrap gap-2">
              {attachments.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="attachment"
                  style={{ width: '80px', height: '80px', cursor: 'pointer' }}
                  onClick={() => window.open(img, '_blank')}
                />
              ))}
            </div>
            <input type="file" multiple onChange={handleFileChange} />
          </div>

          {/* Comments */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2">Comments</h6>
            <textarea
              className="form-control mb-2"
              rows="2"
              placeholder="Type your message here"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
            ></textarea>
            <button className="btn btn-primary mb-3" onClick={handleAddComment}>Send</button>

            {comments.map((comment, index) => (
              <div key={index} className="border p-2 rounded mb-2">
                <div className="fw-semibold">{comment.user}</div>
                <div>{comment.text}</div>
                <small className="text-muted">{comment.time}</small>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="d-flex justify-content-end">
            <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
