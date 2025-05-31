import { useState, useEffect } from "react";
import {
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getUrl } from "aws-amplify/storage";
import { uploadData } from "aws-amplify/storage";
import Popup from "reactjs-popup"
import "~css/App.css"
import { TbCopyPlus } from "react-icons/tb";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { PiFilePlusBold } from "react-icons/pi";
import Badge from 'react-bootstrap/Badge';
import { PiCalendarStarDuotone } from "react-icons/pi";
/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */
export default function homeage() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        if (note.image) {
          const linkToStorageFile = await getUrl({
            path: ({ identityId }) => `media/${identityId}/${note.image}`,
          });
          console.log(linkToStorageFile.url);
          note.image = linkToStorageFile.url;
        }
        return note;
      })
    );
    console.log(notes);
    setNotes(notes);
  }
  function formatDate(date) {
    date = new Date(date)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
  async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    console.log(form.get("image").name);

    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: form.get("image").name,
    });

    console.log(newNote);
    if (newNote.image)
      if (newNote.image)
        await uploadData({
          path: ({ identityId }) => `media/${identityId}/${newNote.image}`,

          data: form.get("image"),
        }).result;

    fetchNotes();
    event.target.reset();
  }

  async function deleteNote({ id }) {
    const toBeDeletedNote = {
      id: id,
    };

    const { data: deletedNote } = await client.models.Note.delete(
      toBeDeletedNote
    );
    console.log(deletedNote);

    fetchNotes();
  }
  return (
        <Flex
          className="App"
          justifyContent="center"
          alignItems="center"
          direction="column"
          width="70%"
          margin="0 auto"
        >
          {/* <CuteNav /> */}
          <Heading level={1}>My Notes App</Heading>
          <Popup trigger={<Button>
            <TbCopyPlus />
          </Button>} position={"center center"}
          >
            <View as="form" margin="3rem 0" onSubmit={createNote} className="new-note">
              <Flex
                direction="column"
                justifyContent="center"
                gap="2rem"
                padding="2rem"
              >
                <TextField
                  name="name"
                  placeholder="Note Name"
                  label="Note Name"
                  labelHidden
                  variation="quiet"
                  required
                />
                <TextField
                  name="description"
                  placeholder="Note Description"
                  label="Note Description"
                  labelHidden
                  variation="quiet"
                  required
                />
                <View
                  name="image"
                  as="input"
                  type="file"
                  alignSelf={"end"}
                  accept="image/png, image/jpeg"
                />

                <Button type="submit" variation="primary">
                  <PiFilePlusBold />
                </Button>
              </Flex>
            </View>
          </Popup>
          <Divider />
          <Heading level={2}>Current Notes</Heading>
          <Grid
            margin="3rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="2rem"
            alignContent="center"
          >
            {notes.map((note) => (
              <Flex
                key={note.id || note.name}
                direction="column"
                justifyContent="center"
                alignItems="center"
                gap="2rem"
                border="1px solid #ccc"
                padding="2rem"
                borderRadius="5%"
                className="box"
              >
                <View>
                  <Heading level="3">{note.name}</Heading>
                </View>
                <View>

                  <Text><PiCalendarStarDuotone />{formatDate(note.createdAt)}</Text>
                </View>
                <Text fontStyle="italic">{note.description}</Text>
                {note.image && (
                  <Image
                    src={note.image}
                    alt={`visual aid for ${notes.name}`}
                    style={{ width: 400 }}
                  />
                )}
                <Button
                  variation="destructive"
                  onClick={() => deleteNote(note)}
                >
                  <RiDeleteBin2Fill />
                </Button>
              </Flex>
            ))}
          </Grid>
          {/* <Button onClick={signOut}>Sign Out</Button> */}
        </Flex>
  );
}