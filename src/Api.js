import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// Fetch all buckets
export const getBuckets = async () => {
    const res = await axios.get(`${API_URL}/buckets`);
    return res.data;
};

// Add a new bucket
export const addBucket = async (name) => {
    const res = await axios.post(`${API_URL}/buckets`, { name });
    return res.data;
};

// Fetch tasks
export const getTasks = async () => {
    const res = await axios.get(`${API_URL}/tasks`);
    return res.data;
};

// Add a task
export const addTask = async (taskData) => {
    const res = await axios.post(`${API_URL}/tasks`, taskData);
    return res.data;
};

// Fetch user suggestions
export const getUserSuggestions = async (query) => {
    const res = await axios.get(`${API_URL}/users?q=${query}`);
    return res.data;
};