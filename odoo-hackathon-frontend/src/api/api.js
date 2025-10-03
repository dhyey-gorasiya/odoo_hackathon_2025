import axios from "axios";
import Cookies from "js-cookie";

// ✅ Define BASE_URL properly (with `const`) and reuse it cleanly
const BASE_URL = "http://localhost:8080";

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("currentUserToken"); // get from cookie
    const expiry = Cookies.get("tokenExpiry");

    if (token && expiry && new Date().getTime() <= Number(expiry)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && (!expiry || new Date().getTime() > Number(expiry))) {
      // If expired, clear cookies
      Cookies.remove("currentUserToken");
      Cookies.remove("tokenExpiry");
      Cookies.remove("loginSuccess");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor
apiClient.interceptors.response.use(
  (response) => response.data, // Auto-extract `data`
  (error) => {
    console.error("API request error:", error);
    return Promise.reject(error);
  }
);






//
// 🔹 USER APIs
//
export const loginUser = (userData) => {
  return apiClient.post(`/auth/login`, userData);
};

export const registerUser = (userData) => {
  return apiClient.post(`/auth/add`, userData);
};

export const updateUser = (userData) => {
  return apiClient.post(`/auth/update`, userData);
};

export const deleteUser = (id) => {
  return apiClient.delete(`/auth/delete/${id}`);
};

export const getAllUser = () => {
  return apiClient.get(`/auth/all`);
};




//
// 🔹 USER APIs (Commented out as mentioned in original)
// 🔹 (This thing is not used in the project, It is for future reference)
//
// export const getUser = (userId) => {
//   return apiClient.get(`/users/${userId}`);
// };

// export const createUser = (userData) => {
//   return apiClient.post("/users", userData);
// };

// export const updateUser = (userId, userData) => {
//   return apiClient.put(`/users/${userId}`, userData);
// };

// export const deleteUser = (userId) => {
//   return apiClient.delete(`/users/${userId}`);
// };

//
// 🔹 IMAGE UPLOAD API
//
// export const uploadImage = (imageFile) => {
//     const formData = new FormData();
//     formData.append("file", imageFile);
//     console.log("Uploading image");
//     return apiClient.post("/image", formData, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//     });
// };
