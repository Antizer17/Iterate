// hooks/useMaterials.js
import { useState, useEffect } from 'react';

export function useMaterials(courseCode) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseCode) return;

    setLoading(true);
    setError(null);

    fetch(`/api/materials/${courseCode}`, { credentials: 'include' })
      .then((res) => {
        
        if (!res.ok) {
          throw new Error(`Materials fetch failed with server status ${res.status}`);
        }
        return res.json();
      })
      .then((payload) => {
        console.log(`materials payload for ${courseCode}:`, payload);
        const topics = payload?.data?.courseTopics || [];
        setMaterials(topics);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error inside useMaterials hook for ${courseCode}:`, err);
        setError(err.message);
        setLoading(false);
      });
  }, [courseCode]);

  return { materials, loading, error };
}