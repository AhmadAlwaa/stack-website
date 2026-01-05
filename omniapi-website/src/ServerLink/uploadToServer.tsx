export const UploadToServer = async (selectedFile: File,location:string) => {
  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("location", location)
    const response = await fetch("http://127.0.0.1:8000/job/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Upload failed:", text);
      return null;
    }

    // If your backend returns JSON
    return await response.json();
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
};