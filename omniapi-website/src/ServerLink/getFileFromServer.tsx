export const GetFileFromServer = async (id:string, location:string) => {
  try {


    const response = await fetch(`http://127.0.0.1:8000/job/download/${location}/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const text = response.text();
      console.error("download failed:", text);
      return null;
    }
    if(response.body){
      return response
    }
    else{
      const text = response.text();
      console.error("download failed:", text);
      return null;
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
};