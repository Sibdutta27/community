import { Link } from "react-router-dom";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import PageHeader from "@components/PageHeader/PageHeader";
import SectionNav from "@components/SectionNav/SectionNav";

import UserList from "./components/UserList/UserList";

import { USER_SECTION_ITEMS } from "./sections";

const Users = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <PageHeader
        title="Users"
        description="Everyone with an account. Select rows to change roles in bulk."
        action={
          <Button
            variant="contained"
            component={Link}
            to="/users/create"
            startIcon={<AddIcon />}
          >
            Add User
          </Button>
        }
      />

      <SectionNav items={USER_SECTION_ITEMS} />

      <UserList />
    </Box>
  );
};

export default Users;
