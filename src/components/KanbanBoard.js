import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./KanbanBoard.css";
import TaskDetailsPopup from './TaskDetailsPopup';

const KanbanBoard = () => {
    const [buckets, setBuckets] = useState([]);
    const [tasks, setTasks] = useState({});
    const [menuOpen, setMenuOpen] = useState(null);
    const [taskMenuOpen, setTaskMenuOpen] = useState(null);
    const [editingBucket, setEditingBucket] = useState(null);
    const [newBucketName, setNewBucketName] = useState("");
    const [addingBucket, setAddingBucket] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [newTask, setNewTask] = useState({ name: "", dueDate: "", assignedTo: [], assigneeInput: "", bucketId: null });
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [taskEdits, setTaskEdits] = useState({ name: "", due_date: "", assignedTo: [], assigneeInput: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const boardRef = useRef(null);
    const userData = JSON.parse(localStorage.getItem("user"));
    const [currentUser, setCurrentUser] = useState(userData);
    const wrapperRef = useRef();
    const bucketMenuRef = useRef(null);
    const [shownImages, setShownImages] = useState({});
    const [openCompleted, setOpenCompleted] = useState({});





    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchBuckets();
                await fetchTasks();
                await fetchUserSuggestions("");
            } catch (err) {
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bucketMenuRef.current && !bucketMenuRef.current.contains(event.target)) {
                setMenuOpen(null); // Close bucket dropdown
            }
        };  
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);
    useEffect(() => {
        const board = boardRef.current;
        if (!board) return;
      
        let isDown = false;
        let startX;
        let scrollLeft;
      
        const handleMouseDown = (e) => {
            isDown = true;
            board.classList.add('active');
            startX = e.pageX - board.offsetLeft;
            scrollLeft = board.scrollLeft;         
            document.body.style.userSelect = 'none'; // Disable text selection completely
          };
      
        const handleMouseLeave = () => {
          isDown = false;
          board.classList.remove('active');
          document.body.style.userSelect = 'auto'; // Enable back
        };
      
        const handleMouseUp = () => {
            isDown = false;
            board.classList.remove('active');
            document.body.style.userSelect = 'auto'; // Enable back
          };
          
      
        const handleMouseMove = (e) => {
            if (!isDown) return;
            e.preventDefault();  // Important to stop text selection & other default behaviors
            const x = e.pageX - board.offsetLeft;
            const walk = (x - startX) * 2;
            board.scrollLeft = scrollLeft - walk;
        };
      
        board.addEventListener('mousedown', handleMouseDown);
        board.addEventListener('mouseleave', handleMouseLeave);
        board.addEventListener('mouseup', handleMouseUp);
        board.addEventListener('mousemove', handleMouseMove);
      
        return () => {
          board.removeEventListener('mousedown', handleMouseDown);
          board.removeEventListener('mouseleave', handleMouseLeave);
          board.removeEventListener('mouseup', handleMouseUp);
          board.removeEventListener('mousemove', handleMouseMove);
        };
      }, []);      
    
    useEffect(() => {
        const handleClickOutside = () => setTaskMenuOpen(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);
      

    const fetchBuckets = async () => {
        const response = await axios.get("http://localhost:8000/api/buckets");
        setBuckets(response.data);
    };

    const fetchTasks = async () => {
        const response = await axios.get("http://localhost:8000/api/tasks");
        const taskMap = response.data.reduce((acc, task) => {
            acc[task.bucket_id] = [...(acc[task.bucket_id] || []), task];
            return acc;
        }, {});
        setTasks(taskMap);
    };

    const fetchUserSuggestions = async (query) => {
        try {
            const res = await axios.get('http://localhost:8000/api/users/search?q=' + query);
            const usersWithFullPic = res.data.map(user => ({
                ...user,
                profile_pic: `http://localhost:8000${user.profile_pic}` // Always prepending because profile_pic is like "uploads/..."
            }));
            setUserSuggestions(usersWithFullPic);
    
            console.log(res.data);
            console.log(usersWithFullPic);   
        } catch (error) {
            console.error(error);
        }
    };
    const addBucket = async () => {
        if (!newBucketName.trim()) return;
        try {
            const response = await axios.post("http://localhost:8000/api/buckets", { name: newBucketName });
            setBuckets([...buckets, response.data]);
            setNewBucketName("");
            setAddingBucket(false);
        } catch (error) {
            console.error("Error adding bucket:", error);
        }
    };

    const toggleMenu = (bucketId) => setMenuOpen(menuOpen === bucketId ? null : bucketId);
    const toggleTaskMenu = (taskId) => setTaskMenuOpen(taskMenuOpen === taskId ? null : taskId);

    const handleEditBucket = (bucket) => {
        setEditingBucket(bucket.id);
        setNewBucketName(bucket.name);
        setMenuOpen(null);
    };

    const saveEditedBucket = async (bucketId) => {
        if (!newBucketName.trim()) return;
        try {
            await axios.put(`http://localhost:8000/api/buckets/${bucketId}`, { name: newBucketName });
            setBuckets(buckets.map(bucket => bucket.id === bucketId ? { ...bucket, name: newBucketName } : bucket));
            setEditingBucket(null);
        } catch (error) {
            console.error("Error updating bucket:", error);
        }
    };

    const handleDelete = (id) => {
        setDeleteConfirm(id);
        setMenuOpen(null);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`http://localhost:8000/api/buckets/${deleteConfirm}`);
            setBuckets(buckets.filter(bucket => bucket.id !== deleteConfirm));
            setTasks(prev => {
                const updated = { ...prev };
                delete updated[deleteConfirm];
                return updated;
            });
            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting bucket:", error);
        }
    };

    const handleAddTask = (bucketId) => {
        setNewTask({ name: "", dueDate: "", assignedTo: [], assigneeInput: "", bucketId });
    };

    const saveTask = async () => {
        if (!newTask.name.trim() || !newTask.bucketId) return;  // prevent empty save
        try {
            const response = await axios.post("http://localhost:8000/api/tasks", {
                name: newTask.name,
                due_date: newTask.dueDate,
                bucket_id: newTask.bucketId,
                assigned_users: newTask.assignedTo.map(id => parseInt(id)),
            });
            const updatedTask = response.data;

            setTasks(prev => ({
                ...prev,
                [newTask.bucketId]: [updatedTask, ...(prev[newTask.bucketId] || [])]
            }));

        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            // Reset task always after attempt
            setNewTask({ name: "", dueDate: "", assignedTo: [], assigneeInput: "", bucketId: null });
        }
    };

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                if (newTask.name.trim() && newTask.bucketId) {
                    saveTask();
                } else {
                    setNewTask({ name: "", dueDate: "", assignedTo: [], assigneeInput: "", bucketId: null });
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [newTask, saveTask]);
    const normalizeStatus = (status) => {
        const map = {
          'not started': 'Not Started',
          'in progress': 'In Progress',
          'completed': 'Completed'
        };
        return map[status?.toLowerCase()] || 'Not Started';
    };
    const formatDateInput = (dateStr) => {
        if (!dateStr) return ''; // Return empty if there's no date
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0]; // Convert to yyyy-MM-dd
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return null;
        // Check if it's already in the correct format (yyyy-MM-dd)
        if (dateString.includes('T')) {
            return dateString.split('T')[0]; // Get yyyy-MM-dd
        }
        return dateString; // If already in the correct format, return it
    };
    
    const saveEditedTask = async (task, oldBucketId) => {
        const normalizedStatus = normalizeStatus(task.progress);
    
        const payload = {
            name: task.name,
            bucket_id: task.bucket_id,
            status: normalizedStatus,
            priority: 'High',
            start_date: formatDate(task.start_date),
            due_date: formatDate(task.due_date),
            notes: task.notes,
            description: task.notes,
            checklist: task.checklist || [],
            attachments: task.attachments || [],
            comments: task.comments || [],
            assigned_users: task.assigned_users?.map(user =>
              typeof user === 'object' ? user.id : parseInt(user)
            ) || []
        };
    
        console.log("Sending payload:", payload);
    
        try {
            const response = await axios.put(
                `http://localhost:8000/api/tasks/${task.id}`,
                payload
            );
            const updatedTask = response.data;
            console.log("Server responded with:", response.data);
    
            setTasks(prev => {
                const updatedBuckets = { ...prev };
    
                // ✅ Remove task from old bucket (correctly)
                if (updatedBuckets[oldBucketId]) {
                    updatedBuckets[oldBucketId] = updatedBuckets[oldBucketId].filter(t => t.id !== task.id);
                }
    
                // ✅ Add task to new bucket
                const newBucket = updatedBuckets[updatedTask.bucket_id] || [];
                updatedBuckets[updatedTask.bucket_id] = [...newBucket, updatedTask];
    
                return updatedBuckets;
            });
    
            setEditingTaskId(null);
        } catch (error) {
            console.error("Error editing task:", error);
            if (error.response) {
                console.error("Server says:", error.response.data);
                if (error.response.status === 422) {
                    alert('Validation failed! Please check your inputs.');
                }
            }
        }
    };
    const deleteTask = async (taskId, bucketId) => {
        try {
            await axios.delete(`http://localhost:8000/api/tasks/${taskId}`);
            setTasks(prev => ({
                ...prev,
                [bucketId]: prev[bucketId].filter(t => t.id !== taskId)
            }));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };
    const toggleTaskStatus = async (task, bucketId) => {
        const updatedStatus = task.status === 'Completed' ? 'Not Started' : 'Completed';
      
        try {
          const response = await axios.put(`http://localhost:8000/api/tasks/${task.id}`, {
            name: task.name,
            bucket_id: task.bucket_id,
            status: updatedStatus,
            priority: task.priority || 'Low',
            start_date: task.start_date || null,
            due_date: task.due_date || null,
            notes: task.notes || '',
            description: task.notes || '',
            checklist: task.checklist || [],
            attachments: task.attachments || [],
            comments: task.comments || [],
            assigned_users: task.assigned_users?.map(user =>
              typeof user === 'object' ? user.id : parseInt(user)
            ) || []
          });
      
          const updatedTask = response.data;
      
          const updatedTasks = { ...tasks };
          updatedTasks[bucketId] = updatedTasks[bucketId].map(t =>
            t.id === task.id ? updatedTask : t
          );
      
          setTasks(updatedTasks);
        } catch (err) {
          console.error('Failed to update task status:', err);
        }
    };
      
    const renderTask = (task, bucketId) => (
        <motion.div
          key={task.id}
          className={`task ${task.status === 'Completed' ? "completed-task" : ""}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => editingTaskId !== task.id && setSelectedTask(task)}
        >
          <div className="task-header">
            <div className="taskcn">
              <input
                type="radio"
                className="radio-task"
                title="Do you want to complete it?"
                onChange={() => {}}
                checked={task.status === 'Completed'}
                onClick={(e) => {
                e.stopPropagation();
                toggleTaskStatus(task, bucketId);
                }}
              />
              <strong className={task.completed ? 'task-completed' : ''}>
                {task.name}
              </strong>
            </div>
      
            <div className="menu-icon" onClick={(e) => {
              e.stopPropagation();
              toggleTaskMenu(task.id);
            }}>⋮</div>
      
            {taskMenuOpen === task.id && (
              <div className="dropdown-menu">
                <button onClick={(e) => {
                  e.stopPropagation();
                  setEditingTaskId(task.id);
                  setTaskEdits({
                        id: task.id,                    // Add ID
                        bucket_id: task.bucket_id,       // Add bucket_id
                        progress: task.status,           // Add progress (needed for normalizeStatus)
                        name: task.name,
                        due_date: task.due_date,
                        start_date: task.start_date || null,   // Optional but safe
                        notes: task.notes || "",               // Optional
                        checklist: task.checklist || [],
                        attachments: task.attachments || [],
                        comments: task.comments || [],
                        assignedTo: task.assigned_users?.map(u => u.id.toString()) || [],
                        assigneeInput: ""
                    });
                  setTaskMenuOpen(null);
                }}>Edit</button>
                <button onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task.id, bucketId);
                }}>Delete</button>
              </div>
            )}  
          </div>
      
          {editingTaskId === task.id ? (
            <div className="edit-task-form">
                <input
                    type="text"
                    value={taskEdits.name}
                    onChange={(e) => setTaskEdits({ ...taskEdits, name: e.target.value })}
                    placeholder="Task Name"
                />
                <input
                    type="date"
                    value={formatDateInput(taskEdits.due_date)} // Correctly formatted date for input
                    onChange={(e) => setTaskEdits({ ...taskEdits, due_date: e.target.value })}
                />
                <div className="assigned-user-input">
                    <div className="selected-users">
                        {taskEdits.assignedTo.map((id) => {
                            const user = userSuggestions.find((u) => u.id.toString() === id);
                            return user ? (
                                <span key={id} className="tag">
                                    {user.email}
                                </span>
                            ) : null;
                        })}
                    </div>
                    <input
                        type="text"
                        placeholder="Type email"
                        value={taskEdits.assigneeInput}
                        onChange={async (e) => {
                            setTaskEdits({ ...taskEdits, assigneeInput: e.target.value });
                            await fetchUserSuggestions(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && userSuggestions.length) {
                                const selected = userSuggestions[0];
                                if (!taskEdits.assignedTo.includes(selected.id.toString())) {
                                    setTaskEdits((prev) => ({
                                        ...prev,
                                        assignedTo: [...prev.assignedTo, selected.id.toString()],
                                        assigneeInput: "",
                                    }));
                                }
                                e.preventDefault();
                            }
                        }}
                    />
                    {taskEdits.assigneeInput && (
                        <div className="autocomplete-dropdown">
                            {userSuggestions.map((user) => (
                                <div
                                    key={user.id}
                                    className="autocomplete-item"
                                    onClick={() => {
                                        if (!taskEdits.assignedTo.includes(user.id.toString())) {
                                            setTaskEdits((prev) => ({
                                                ...prev,
                                                assignedTo: [...prev.assignedTo, user.id.toString()],
                                                assigneeInput: "",
                                            }));
                                        }
                                    }}
                                >
                                    {user.email}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button onClick={() => {
    console.log("Sending edited task:", taskEdits);
    saveEditedTask(taskEdits);
}}>
  Save
</button>
                <button onClick={() => setEditingTaskId(null)}>Cancel</button>
            </div>
        ) : (
            <>
                <p>Due: {task.due_date ? formatDate(task.due_date) : "No due date"}</p>
                {shownImages[task.id] && (
                    <div style={{ marginTop: '10px' }}>
                        <img
                            src="https://icon-library.com/images/image-icon/image-icon-17.jpg"
                            alt="View"
                            style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(shownImages[task.id], '_blank');
                            }}
                        />
                    </div>
                )}
                <div className="assigned-user-avatarss">
                    {task.assigned_users?.length ? (
                        task.assigned_users.map(user => (
                            <img
                                key={user.id}
                                src={`http://localhost:8000${user.profile_pic}`}
                                alt={user.email}
                                title={user.email}
                                className="user-avatarr"
                            />
                        ))
                    ) : (
                        <span>Unassigned</span>
                    )}
                </div>
            </>
        )}
        </motion.div>
    );
        

    const closeDeletePopup = () => setDeleteConfirm(null);

    if (loading) return <div className="loader-div">
        <div className="loader"></div>
    </div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="kanban-container">
            <div className="kanban-board" ref={boardRef} >
                {buckets.map(bucket => (
                    <motion.div key={bucket.id} className="bucket" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="bucket-header">
                            {editingBucket === bucket.id ? (
                                <input
                                    type="text"
                                    value={newBucketName}
                                    onChange={e => setNewBucketName(e.target.value)}
                                    onBlur={() => saveEditedBucket(bucket.id)}
                                    onKeyDown={e => e.key === "Enter" && saveEditedBucket(bucket.id)}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <h5>{bucket.name}</h5>
                                    <div className="menu-icon" onClick={() => toggleMenu(bucket.id)}>⋮</div>
                                    {menuOpen === bucket.id && (
                                        <div className="dropdown-menu" ref={bucketMenuRef}> {/* Step 3 */}
                                            <button onClick={() => handleEditBucket(bucket)}>Edit</button>
                                            <button onClick={() => handleDelete(bucket.id)}>Delete</button>
                                        </div>
                                    )}</>
                            )}
                        </div>

                        <button className="add-task-btn" onClick={() => handleAddTask(bucket.id)}>+ Add Task</button>
                        {newTask.bucketId === bucket.id && (
                            <motion.div ref={wrapperRef} className="task new-task-form" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                                <input type="text" placeholder="Task name" value={newTask.name} onChange={e => setNewTask({ ...newTask, name: e.target.value })} />
                                <input type="date" value={formatDateInput(newTask.dueDate)} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                                <div className="assigned-user-input">
                                    <input
                                        type="text"
                                        placeholder="Type name or email"
                                        value={newTask.assigneeInput}
                                        onChange={async (e) => {
                                            setNewTask({ ...newTask, assigneeInput: e.target.value });
                                            await fetchUserSuggestions(e.target.value); // Your API call to get suggestions
                                        }}
                                    />
                                    {(newTask.assigneeInput || newTask.assignedTo.length) && (
                                        <div className="autocomplete-dropdown">
                                            {newTask.assignedTo.length > 0 && (
                                                <>
                                                    <div className="assigned-label">Assigned</div>
                                                    {newTask.assignedTo.map(id => {
                                                        const user = userSuggestions.find(u => u.id.toString() === id);
                                                        return user && (
                                                            <div key={user.id} className="autocomplete-item">
                                                            <img src={user.profile_pic} alt={user.name} className="avatar" />
                                                                <div className="user-info">
                                                                    <div className="name">{user.name}</div>
                                                                    <div className="email">{user.email}</div>
                                                                </div>
                                                                <button className="closeuser" onClick={() => {
                                                                    setNewTask(prev => ({
                                                                        ...prev,
                                                                        assignedTo: prev.assignedTo.filter(uid => uid !== id)
                                                                    }));
                                                                }}>x</button>
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            )}
                                            <div className="suggestions-label">Suggestions</div>
                                            {userSuggestions
                                                .filter(user => !newTask.assignedTo.includes(user.id.toString()))
                                                .map(user => (
                                                    <div
                                                        key={user.id}
                                                        className="autocomplete-item"
                                                        onClick={() => {
                                                            setNewTask(prev => ({
                                                                ...prev,
                                                                  assignedTo: [...prev.assignedTo, user.id.toString()],
                                                                assigneeInput: ""
                                                            }));
                                                        }}>
                                                        <img src={user.profile_pic} alt={user.name} className="avatar" />
                                                        {console.log(userSuggestions)}

                                                        <div className="user-info">
                                                            <div className="name">{user.name}</div>
                                                            <div className="email">{user.email}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={saveTask}>Save Task</button>
                            </motion.div>)}
                            
                            <div className="task-list">
                                {(tasks[bucket.id] || [])
                                    .filter(task => task.status !== 'completed')  // Filter out completed tasks
                                    .map(task => renderTask(task, bucket.id))}
                            </div>

                            <div className="task-list completed-section">
                                <div
                                    className="completed-header"
                                    onClick={() => setOpenCompleted(prev => ({
                                        ...prev,
                                        [bucket.id]: !prev[bucket.id]
                                    }))}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        cursor: 'pointer',
                                        background: '#f5f5f5',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <span>Completed tasks</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{(tasks[bucket.id] || []).filter(task => task.status === 'completed').length}</span>  {/* Completed task count */}
                                        <span>{openCompleted[bucket.id] ? '^' : 'v'}</span>
                                    </div>
                                </div>

                                {openCompleted[bucket.id] && (
                                    <div className="completed-task-list" style={{ marginTop: '10px' }}>
                                        {(tasks[bucket.id] || [])
                                            .filter(task => task.status === 'completed')  // Only show completed tasks
                                            .map(task => renderTask(task, bucket.id))}
                                    </div>
                                )}
                            </div>

                        {selectedTask && (
                            <TaskDetailsPopup  
                                task={selectedTask} 
                                buckets={buckets} 
                                onClose={() => setSelectedTask(null)} 
                                currentUser={currentUser}
                                onTaskUpdate={saveEditedTask}
                                shownImages={shownImages}
                                setShownImages={setShownImages}
                            />
                        )}
                    </motion.div>
                ))}
                <div className="add-bucket-container">
                    {addingBucket ? (
                        <div className="new-bucket-form">
                            <input
                                type="text"
                                value={newBucketName}
                                onChange={e => setNewBucketName(e.target.value)}
                                onBlur={addBucket}
                                onKeyDown={e => e.key === "Enter" && addBucket()}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <button className="add-bucket-btn" onClick={() => setAddingBucket(true)}>+ Add New Bucket</button>
                    )}
                </div>
            </div>
            {deleteConfirm !== null && (
                <div className="popup-overlay">
                    <div className="delete-popup ">
                        <p>Are you sure you want to delete this bucket?</p>
                        <button className="confirm-btn" onClick={confirmDelete}>Delete</button>
                        <button className="cancel-btn" onClick={closeDeletePopup}>Cancel</button>
                    </div>
                </div>)}
        </div>
    );
};

export default KanbanBoard;
