export const convertToServer = async (id:string, file_type:string, to_type:string, location:string, task_id:string) => {
  try {
    const formData = new FormData();
    console.log(id, file_type, to_type)
    formData.append("id", id)
    formData.append("file_type", file_type)
    formData.append("to_type", to_type)
    formData.append("location", location)
    formData.append("task_id", task_id)
    
    

    const response = await fetch("http://127.0.0.1:8000/job/convert", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("convert failed:", text);
      return null;
    }

    // If your backend returns JSON
    return await response.json();
  } catch (error) {
    console.error("Error converting file:", error);
    return null;
  }
};