export const checkJobStatus = async (job_id) => {
  try {
    const response = await fetch(`http://127.0.0.1:8000/job/status/${job_id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("job status failed:", text);
      return null;
    }

    // If your backend returns JSON
    return await response.json();
  } catch (error) {
    console.error("Error getting job status:", error);
    return null;
  } 
};