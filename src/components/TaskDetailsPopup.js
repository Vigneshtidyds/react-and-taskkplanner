  import React, { useState } from 'react';
  import "./TaskDetailsPopup.css";

  const TaskDetailsModal = ({ task, buckets, onClose, currentUser, onTaskUpdate, shownImages, setShownImages }) => {
    const [selectedBucket, setSelectedBucket] = useState(task.bucket_id);
    const [progress, setProgress] = useState(task.progress || 'Not Started');
    const [priority, setPriority] = useState(task.priority || 'Medium');
    const [startDate, setStartDate] = useState(task.start_date || '');
    const [notes, setNotes] = useState(task.notes || '');
    const [checklist, setChecklist] = useState(task.checklist || []);
    const [newItemVisible, setNewItemVisible] = useState(false);
    const [newItem, setNewItem] = useState('');
    const [attachments, setAttachments] = useState(task.attachments || []);
    const [comments, setComments] = useState(task.comments || []);
    const [commentInput, setCommentInput] = useState('');
    const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : '');
    const [showSuccess, setShowSuccess] = useState(false);

    if (!task) return null;
    const handleOverlayClick = (e) => {
      if (e.target.classList.contains('custom-modal-overlay')) {
        onClose();
      }
    };
    const handleFile = (e) => {
      const files = Array.from(e.target.files);
      const newAttachments = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    };
    const handleAddChecklistItem = () => {
      if (newItem.trim() !== '') {
        setChecklist(prev => [...prev, { text: newItem, done: false }]);
        setNewItem('');
        setNewItemVisible(false);
      }
    };
    const toggleChecklistItem = (index) => {
      const updated = [...checklist];
      updated[index].done = !updated[index].done;
      setChecklist(updated);
    };
    const removeChecklistItem = (index) => {
      setChecklist(prev => prev.filter((_, i) => i !== index));
    };
    const removeAttachment = (index) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    };
    const getChecklistProgress = () => {
      if (checklist.length === 0) return 0;
      const completed = checklist.filter(item => item.done).length;
      return Math.round((completed / checklist.length) * 100);
    };    
    return (
      <div
        className="modal show d-block custom-modal-overlay"
        role="dialog"
        onClick={handleOverlayClick}
        aria-modal="true"
        aria-labelledby="taskDetailsTitle"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.22)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content rounded-3 p-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 className="text-success fw-semibold mb-1">{getBucketName(selectedBucket)}</h6>
                <h2 id="taskDetailsTitle" className="fw-bold mb-1">{task.name}</h2>
              </div>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
            </div>
            {/* Assigned Users */}
            <div className="mt-2">
              <h6 className="fw-semibold mb-1">Assigned Users:</h6>
              {task.assigned_users?.length > 0 ? (
                <div className="d-flex flex-wrap align-items-center gap-2">
                  {task.assigned_users.map((user) => (
                    <div key={user.id} className="d-flex align-items-center">
                      <img
                        src={`http://localhost:8000/${user.profile_pic}`}
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
              <small className="text-muted">{getChecklistProgress()}% complete</small>
              {checklist.map((item, index) => (
                <div key={index} className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={item.done}
                      onChange={() => toggleChecklistItem(index)}
                    />
                    <span className={item.done ? 'text-decoration-line-through' : ''}>{item.text}</span>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => removeChecklistItem(index)}>Delete</button>
                </div>
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
              <div className="mb-2 d-flex flex-wrap gap-3">
                {attachments.map((file, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px' }}>
                    <img
                      src={file.url}
                      alt="attachment"
                      style={{ width: '100%', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => window.open(file.url, '_blank')}
                    />
                    <small className="d-block text-truncate">{file.name}</small>
                    <button
                      className="btn btn-sm btn-outline-success mt-1 w-100"
                      onClick={() => {
                        setShownImages(prev => ({ ...prev, [task.id]: file.url }));
                      }}
                    >
                      Show on Card
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger mt-1 w-100"
                      onClick={() => removeAttachment(index)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <input type="file" multiple onChange={handleFile} />
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
            <div className="d-flex justify-content-end">
              <button className="btn btn-success" onClick={handleSave}>Save Changes</button>
            </div>
            {showSuccess && <div className="alert alert-success mt-3">Changes saved successfully!</div>}
          </div>
        </div>
      </div>
    );
  };

  export default TaskDetailsModal;
