export const CutToServer = async (id, start_times, end_times, location, task_id) => {
  try {
    const formData = new FormData();
    formData.append("file_id", id)
    formData.append("start_times", start_times)
    formData.append("end_times", end_times)
    formData.append("location", location)
    formData.append("task_id", task_id)
    const response = await fetch("http://127.0.0.1:8000/job/edit/video", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("cut failed:", text);
      return null;
    }

    // If your backend returns JSON
    return await response.json();
  } catch (error) {
    console.error("Error cutting file:", error);
    return null;
  }
};