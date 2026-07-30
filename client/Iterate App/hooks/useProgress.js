// hooks/useProgress.js
import { useState, useEffect } from 'react';

export function useProgress(courseCode) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseCode) return;

    setLoading(true);
    setError(null);
    // 🌟 Check the address bar for a dynamic auto-login token
    const urlParams = new URLSearchParams(window.location.search);
    const emailToken = urlParams.get("token");

    // Configure headers dynamically
    const headers = {};
   
   
    fetch(`https://iterate-gy7v.onrender.com/api/progress/user`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error(`Progress fetch failed with status ${res.status}`);
        return res.json();
      })
      .then((payload) => {
        // payload.data is the array of all course progress items
        const allProgressRecords = payload?.data || [];
        
        // Find the specific course record we need for the tree
        const matchingCourse = allProgressRecords.find(
          (record) => record.courseCode === courseCode
        );

        if (matchingCourse) {
          setProgress(matchingCourse);
        } else {
          // Graceful fallback: User hasn't started this specific course yet
          setProgress({
            courseCode,
            currentOrderStep: 1, // Default to topic 1
            confidenceScore: 0
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error in useProgress filtering for ${courseCode}:`, err);
        setError(err.message);
        setLoading(false);
      });
  }, [courseCode]);

  return { progress, loading, error };
}