const GetLinks=async(link:string)=>{
    try{
        const response = await fetch(`http://127.0.0.1:8000/job/checkifPass/${link}`,{
            method: "GET"
        })
        if (!response.ok) {
            const text = await response.text();
        console.error("failed getting link:", text);
        return null;
        }
        return await response.json();
    }catch (error) {
    console.error("failed connecting to backend when checking link:", error);
    return null;
  } 
}
export default GetLinks