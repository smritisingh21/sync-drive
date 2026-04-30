import axios from "axios";


export const axiosWithCreds = axios.create({
  baseURL: import.meta.env.BASE_URL,
  withCredentials: true,
});

export const axiosWithoutCreds = axios.create({
  baseURL: import.meta.env.BASE_URL,
});
