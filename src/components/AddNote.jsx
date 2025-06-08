import React from "react";
import { uploadData } from "aws-amplify/data";
import { toast } from "react-toastify";
import { getUrl } from "aws-amplify/data";

export function AddNote({ client, fetchNotes }) {
    async function createNote(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    console.log(form.get("image").name);

    const { data: newNote } = await client.models.Note.create({
      name: form.get("name"),
      description: form.get("description"),
      image: form.get("image").name,
      createdAt: new Date().toISOString(),
    })
      .then((response) => {
        toast.success("Note created successfully!", {
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.log("Note created successfully:", response);
      })
      .catch((error) => {
        toast.error("Error creating note: " + error.message, {
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        console.error("Error creating note:", error);
      });
    if (newNote.image)
      if (newNote.image)
        await uploadData({
          path: ({ identityId }) => `media/${identityId}/${newNote.image}`,
          data: form.get("image"),
        }).result;

    fetchNotes();
    event.target.reset();
  }

  return (

  )
}