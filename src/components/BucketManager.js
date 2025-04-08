import React, { useState, useEffect } from "react";
import { getBuckets, addBucket } from "../Api";

const BucketManager = () => {
    const [buckets, setBuckets] = useState([]);
    const [newBucket, setNewBucket] = useState("");

    useEffect(() => {
        getBuckets().then(setBuckets);
    }, []);

    const handleAddBucket = async () => {
        if (!newBucket) return;
        const bucket = await addBucket(newBucket);
        setBuckets([...buckets, bucket]);
        setNewBucket("");
    };

    return (
            <div>
                <h2>Buckets</h2>
            <ul>
                {buckets.map((bucket) => (
                    <li key={bucket.id}>{bucket.name}</li>
                ))}
            </ul>
            <input 
                type="text" 
                value={newBucket} 
                onChange={(e) => setNewBucket(e.target.value)}
                placeholder="New Bucket Name"
            />
            <button onClick={handleAddBucket}>Add Bucket</button>
        </div>
    );
};

export default BucketManager;
