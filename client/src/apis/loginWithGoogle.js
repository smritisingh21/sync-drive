
//sending details in the body through this function
const BASEURL = "http://localhost:8000"

export const loginWithGoogle = async (idToken) => {
  const response = await fetch(`${BASEURL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ idToken }),
    credentials: "include",
  });

  const data = await response.json();

  return {
    ok: response.ok,
    data
  };
};