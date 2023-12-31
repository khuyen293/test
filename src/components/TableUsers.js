import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import _ from "lodash";
import { debounce } from "lodash";
import { CSVLink, CSVDownload } from "react-csv";
import Papa from "papaparse";

import { fetchAllUser } from "../services/UserService";
import ModalAddNew from "./ModalAddNew";
import ModalEditUser from "./ModalEditUser";
import ModalConfirm from "./ModalConfirm";
import "./TableUser.scss";
import { toast } from "react-toastify";

function TableUsers() {
  const [listUsers, setListUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isShowModalAddNew, setIsShowModalAddNew] = useState(false);

  const [isShowModalEdit, setIsShowModalEdit] = useState(false);
  const [dataUserEdit, setDataUserEdit] = useState({});

  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [dataUserDelete, setDataUserDelete] = useState({});

  const [sortBy, setSortBy] = useState("asc");
  const [sortField, setSortField] = useState("id");

  const [keyword, setKeyword] = useState("");

  const [dataExport, setDataExport] = useState([]);

  const handleClose = () => {
    setIsShowModalAddNew(false);
    setIsShowModalEdit(false);
    setIsShowModalDelete(false);
  };
  const handleUpdateTable = (user) => {
    setListUsers([user, ...listUsers]);
  };

  const handleEditUserFromModal = (user) => {
    let closeListUsers = _.cloneDeep(listUsers);
    let index = listUsers.findIndex((item) => item.id === user.id);
    closeListUsers[index].first_name = user.first_name;
    setListUsers(closeListUsers);
  };

  useEffect(() => {
    getUser(1);
  }, []);

  const getUser = async (page) => {
    let res = await fetchAllUser(page);
    if (res && res.data) {
      setTotalUsers(res.total);
      setListUsers(res.data);
      setTotalPages(res.total_pages);
    }
  };
  const handlePageClick = (event) => {
    getUser(event.selected + 1);
  };

  const handleEditUser = (user) => {
    setIsShowModalEdit(true);
    setDataUserEdit(user);
  };

  const handleDeleteUser = (user) => {
    setIsShowModalDelete(true);
    setDataUserDelete(user);
  };

  const handleDeleteUserFormModal = (user) => {
    let closeListUsers = _.cloneDeep(listUsers);
    closeListUsers = closeListUsers.filter((item) => item.id !== user.id);
    setListUsers(closeListUsers);
  };

  const handleSort = (sortBy, sortField) => {
    setSortBy(sortBy);
    setSortField(sortField);
    let closeListUsers = _.cloneDeep(listUsers);
    closeListUsers = _.orderBy(closeListUsers, [sortField], [sortBy]);
    setListUsers(closeListUsers);
    console.log(closeListUsers);
  };

  const handleSearch = debounce((event) => {
    let term = event.target.value;
    if (term) {
      let closeListUsers = _.cloneDeep(listUsers);
      // filter: chay tung phan tu trong mang voi dieu kiem la lay nhung phan tu co truong la term
      closeListUsers = closeListUsers.filter((item) =>
        item.email.includes(term)
      );
      setListUsers(closeListUsers);
    } else {
      getUser(1);
    }
  }, 500);

  const csvData = [
    ["firstname", "lastname", "email"],
    ["Ahmed", "Tomi", "ah@smthing.co.com"],
    ["Raed", "Labes", "rl@smthing.co.com"],
    ["Yezzi", "Min l3b", "ymin@cocococo.com"],
  ];

  const getUsersExport = (event, done) => {
    let result = [];
    if (listUsers && listUsers.length > 0) {
      result.push(["ID", "Email", "First Name", "Last Name"]);
      listUsers.map((item, index) => {
        let arr = [];
        arr[0] = item.id;
        arr[1] = item.email;
        arr[2] = item.first_name;
        arr[3] = item.last_name;
        result.push(arr);
      })
      setDataExport(result);
      done();
    }
  }

  const handleImportCSV = (event) => {
    if (event.target && event.target.files && event.target.files[0]) {
      let file = event.target.files[0];

      if (file.type !== "text/csv") {
        toast.error("Only accept cvs files...");
        return;
      }
    Papa.parse(file, {
      complete: function(results) {
        let rawCSV = results.data;
        if (rawCSV.length > 0) {
          if (rawCSV[0] && rawCSV[0].length === 4) {
            if (rawCSV[0][0] !== "id" || rawCSV[0][1] !== "email" || rawCSV[0][2] !== "first_name" || rawCSV[0][3] !== "last_name") {
              toast.error("Wrong format Heading CSV file");
            } else {
              let result = []
              rawCSV.map((item, index) => {
                if (index > 0 && item.length === 4) {
                  let obj = {}
                  obj.id = item[0];
                  obj.email = item[1];
                  obj.first_name = item[2];
                  obj.last_name = item[3];
                  result.push(obj);
                }
              })
              setListUsers(result);
            }
          } else {
            toast.error("Wrong format  CSV file");
          }
        } else {
          toast.error("Wrong CSV")
        }
      }
    });
    }

  }

  return (
    <>
      <div className="my-3 add-new">
        <span>
          <b>List User:</b>
        </span>
        <div className="group-btns">
          <label htmlFor="test" className="btn btn-warning">
            <i className="fa-solid fa-upload"></i>
            Import
          </label>
          <input
            id="test"
            type="file"
            hidden
            onChange={(event) => handleImportCSV(event)}
          />
          <CSVLink
            filename={"users.csv"}
            className="btn btn-primary"
            data={dataExport}
            asyncOnClick={true}
            onClick={getUsersExport}
          >
            <i className="fa-solid fa-download"></i>
            Export
          </CSVLink>
          <button
            className="btn btn-success"
            onClick={() => setIsShowModalAddNew(true)}
          >
            <i className="fa-solid fa-circle-plus"></i>Add new
          </button>
        </div>
      </div>
      <div className="col-4 my-3">
        <input
          className="form-control"
          placeholder="Search user by email..."
          onChange={(event) => handleSearch(event)}
        />
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <div className="sort-header">
                <span>ID</span>
                <span>
                  <i
                    onClick={() => handleSort("desc", "id")}
                    className="fa-solid fa-arrow-down"
                  ></i>
                  <i
                    onClick={() => handleSort("asc", "id")}
                    className="fa-solid fa-arrow-up"
                  ></i>
                </span>
              </div>
            </th>
            <th>Email</th>
            <th>
              <div className="sort-header">
                <span>First Name</span>
                <span>
                  <i
                    onClick={() => handleSort("desc", "first_name")}
                    className="fa-solid fa-arrow-down"
                  ></i>
                  <i
                    onClick={() => handleSort("asc", "first_name")}
                    className="fa-solid fa-arrow-up"
                  ></i>
                </span>
              </div>
            </th>
            <th>Last Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listUsers &&
            listUsers.length > 0 &&
            listUsers.map((item, index) => {
              return (
                <tr key={`user-${index}`}>
                  <td>{item.id}</td>
                  <td>{item.email}</td>
                  <td>{item.first_name}</td>
                  <td>{item.last_name}</td>
                  <td>
                    <button
                      className="btn btn-warning mx-3"
                      onClick={() => handleEditUser(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteUser(item)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </Table>

      <ReactPaginate
        breakLabel="..."
        nextLabel="next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={totalPages}
        previousLabel="< previous"
        pageClassName="page-item"
        pageLinkClassName="page-link"
        previousLinkClassName="page-link"
        nextClassName="page-item"
        nextLinkClassName="page-link"
        breakClassName="page-item"
        breakLinkClassName="page-link"
        containerClassName="pagination"
        activeClassName="active"
        renderOnZeroPageCount={null}
      />

      <ModalAddNew
        show={isShowModalAddNew}
        handleClose={handleClose}
        handleUpdateTable={handleUpdateTable}
      />
      <ModalEditUser
        show={isShowModalEdit}
        handleClose={handleClose}
        dataUserEdit={dataUserEdit}
        handleEditUserFromModal={handleEditUserFromModal}
      />
      <ModalConfirm
        show={isShowModalDelete}
        handleClose={handleClose}
        dataUserDelete={dataUserDelete}
        handleDeleteUserFormModal={handleDeleteUserFormModal}
      />
    </>
  );
}

export default TableUsers;
