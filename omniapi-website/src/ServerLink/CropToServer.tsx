export const CropToServer = async(file_id, width, height,x,y,location, task_id) => {
    try{
        const formData = new FormData();
        formData.append("file_id", file_id)
        formData.append("width", Math.round(width))
        formData.append('height', Math.round(height))
        formData.append('x', Math.round(x))
        formData.append('y', Math.round(y))
        formData.append('location',location)
        formData.append("task_id",task_id)
        const response = await fetch("http://127.0.0.1:8000/job/crop/video", {
        method: "POST",
        body: formData,
        });
        if (!response.ok) {
        const text = await response.text();
        console.error("crop failed:", text);
        return null;
        }
        return await response.json();
    }catch (error) {
        console.error("Error cropping file:", error);
        return null;
  }
}