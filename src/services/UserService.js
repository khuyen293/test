import axios from "./customize-axios";
const fetchAllUser = (page) => {
  return axios.get(`/api/users?page=${page}`);
};

const postCreateUser = (name, job) => {
  return axios.post("/api/users", {name, job})
}

const putUpdateUser = (name, job, page) => {
  return axios.put(`/api/users/${page}`, {name, job})
}
export { fetchAllUser, postCreateUser, putUpdateUser };
