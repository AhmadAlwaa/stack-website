const CheckPassword = async (link:string, password:string)=>{
try{
        const response = await fetch(`http://127.0.0.1:8000/job/checkPassword/${link}/${password}`,{
            method: "GET"
        })
        if (!response.ok) {
            const text = await response.text();
        console.error("failed checking password:", text);
        return null;
        }
        return await response.json();
    }catch (error) {
    console.error("failed connecting to backend when checking password:", error);
    return null;
  } 
}
export default CheckPassword