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
import Popup from "reactjs-popup";
import { TbCopyPlus } from "react-icons/tb";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { PiFilePlusBold } from "react-icons/pi";
import Badge from "react-bootstrap/Badge";
import { PiCalendarStarDuotone } from "react-icons/pi";
import { asiaformatDate } from "~utils/datetimeFormat";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "amplify-json";
import { generateClient } from "aws-amplify/data";
import { toast } from "react-toastify";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
Amplify.configure(amplifyOutputs);

const client = generateClient({
  authMode: "userPool",
});
/**
 * @type {import('aws-amplify/data').Client<import('~/amplify/data/resource').Schema>}
 */

export default function Homepage() {
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

  async function softDeleteNote({ id }) {
    const toBeDeletedNote = {
      id: id,
      deleted: true,
    };

    const { data: deletedNote } =
      await client.models.Note.update(toBeDeletedNote);
    fetchNotes();
  }

  async function deleteNote({ id }) {
    const toBeDeletedNote = {
      id: id,
    };

    const { data: deletedNote } =
      await client.models.Note.delete(toBeDeletedNote);

    async function markCompleted({ id }) {
      const completedNote = {
        id: id,
        completed: true,
      };

      const { data: updatedNote } =
        await client.models.Note.update(completedNote);
    }
    fetchNotes();
  }
  return (
    <div>
      <p> Welcome to Note App</p>
      </div>
  );
}
