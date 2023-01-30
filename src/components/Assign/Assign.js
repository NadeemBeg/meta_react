import React, { useState, userId } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { navigate } from '@reach/router';
import {
  Box,
  Button,
  Container,
  Heading,
  TextField,
  Table,
  Text,
  Toast,
} from "gestalt";
import "gestalt/dist/gestalt.css";
import { addSignee, selectAssignees } from "./AssignSlice";
import { useNavigate } from "react-router-dom";
const Assign = () => {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const assignees = useSelector(selectAssignees);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const prepare = () => {
    if (assignees.length > 0) {
      navigate(`/prepareDocument`);
    } else {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 1000);
    }
  };

  const addUser = (name, email) => {
    const key = `${new Date().getTime()}${email}`;
    if (name !== "" && email !== "") {
      dispatch(addSignee({ key, name, email }));
      setEmail("");
      setDisplayName("");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "auto",
        backgroundColor: " #6d4cd4",
        color: "white",
      }}
    >
      {/* <Box padding={3}> */}
      <Container>
        <Box padding={3}>
          <Heading size="md" color="white">
            Who needs to sign?
          </Heading>
        </Box>
        <Box padding={2}>
          <Heading size="sm" color="white">{`Name`}</Heading>
          <TextField
            id="displayName"
            onChange={(event) => setDisplayName(event.value)}
            placeholder="Enter recipient's name"
            color="white"
            value={displayName}
            type="text"
          />
        </Box>
        <Box padding={2}>
          <Heading size="sm" color="white">{`Email`}</Heading>
          <TextField
            id="email"
            onChange={(event) => setEmail(event.value)}
            placeholder="Enter recipient's email"
            value={email}
            type="email"
          />
        </Box>
        <Box padding={2}>
          <Button
            onClick={(event) => {
              addUser(displayName, email);
            }}
            text="Add user"
            color="blue"
            inline
          />
        </Box>
        <Box padding={2}>
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>
                  <Text color="white" weight="bold">
                    Name
                  </Text>
                </Table.HeaderCell>
                <Table.HeaderCell>
                  <Text color="white" weight="bold">
                    Email
                  </Text>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {assignees.map((user) => (
                <Table.Row key={user.key}>
                  <Table.Cell>
                    <Text color="white">{user.name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text color="white">{user.email}</Text>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Box>
        <Box padding={2}>
          <Button onClick={prepare} text="Continue" color="blue" inline />
        </Box>
        <Box
          fit
          dangerouslySetInlineStyle={{
            __style: {
              bottom: 50,
              left: "50%",
              transform: "translateX(-50%)",
            },
          }}
          paddingX={1}
          position="fixed"
        >
          {showToast && (
            <Toast color="red" text={<>Please add at least one user</>} />
          )}
        </Box>
      </Container>
      {/* </Box> */}
    </div>
  );
};

export default Assign;
