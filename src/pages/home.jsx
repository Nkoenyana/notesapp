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
import "~css/home.css";
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
    <div class="notely-empty-notes-state">
      <div class="notely-empty-notes-state-child"></div>
      <div class="notely-empty-notes-state-inner">
        <div class="risearch-2-line-parent">
          <img
            class="risearch-2-line-icon"
            alt=""
            src="/assets/img/ri_search.svg"
          ></img>

          <div class="search-task">Search task</div>
        </div>
      </div>
      <div class="frame-div">
        <div class="risearch-2-line-parent">
          <img
            class="risearch-2-line-icon"
            alt=""
            src="/assets/img/ri_search.svg"
          ></img>
          <div class="search">Search</div>
        </div>
      </div>
      <div class="tab">
        <div class="all">Personal</div>
        <div class="tab-child"></div>
      </div>
      <div class="tab1">
        <div class="all">Home</div>
        <div class="tab-child"></div>
      </div>
      <div class="tab2">
        <div class="all">Business</div>
        <div class="tab-child"></div>
      </div>
      <div class="notely-empty-notes-state-item"></div>
      <div class="tab3">
        <div class="all">All</div>
        <div class="line-div"></div>
      </div>
      <div class="your-notes">Your notes</div>
      <div class="notes">
        <img class="notes-child" alt="" src="/assets/img/nothing notes.svg"></img>
      </div>
      <div class="show-only-completed-notes-parent">
        <div class="show-only-completed">Show only completed notes</div>
        <div class="task-actions-buttons">
          <img
            class="material-symbolscheck-box-out-icon"
            alt=""
            src="/assets/img/tick-no.svg"
          ></img>
        </div>
      </div>
      <button class="button">
        <img class="material-symbolsadd-icon" alt="" src="/assets/img/add.svg"></img>

        <div class="add">Add</div>
      </button>
      <div class="content">
              <div class="you-dont-have">You don't have any notes</div>
              <img class="user-1-icon" alt="" src="/assets/img/user.png"></img>
        </div>
    </div>
  );
}
