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
import dayjs from "dayjs";
import { Amplify } from "aws-amplify";
import amplifyOutputs from "amplify-json";
import { generateClient } from "aws-amplify/data";
import { toast } from "react-toastify";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { PageContainer } from "@toolpad/core/PageContainer";
import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import DescriptionIcon from "@mui/icons-material/Description";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import testData from "~data/test.json";

export default function Testpage() {
  return (
    <div>
      <PageContainer title="Notes">
        {testData.map((note) => (
          <div key={note.id}>
            <Accordion
              // if completed background color is green, else white
              sx={{
                backgroundColor: note.completed ? "#d4edda" : "#fff",
                marginBottom: "20px",
                marginTop: "20px",
                borderRadius: "5px"
              }}
            >
              <AccordionSummary>
                <DescriptionIcon />{" "}
                <Typography>{note.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{note.description}</Typography>
                {/* footer */}
                <Flex
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="20px"
                    >
                      <Flex direction="row" alignItems="center">
                        <Text>
                          Created on:{" "}
                          {dayjs(note.createdAt).format("DD/MM/YYYY")}
                        </Text>
                        </Flex>
                        <Flex direction="row" alignItems="center">
                          <Text>
                            Last updated:{" "}
                            {dayjs(note.updatedAt).format("DD/MM/YYYY")}
                          </Text>
                    </Flex>
                    </Flex>
                    {/* display line of image */}
                    {/* for meida */}
                    <Divider marginTop="20px" />
                    <Flex direction="row" alignItems="center" marginTop="20px">
                      <Text>Media:</Text>
                    </Flex>
                    <Box sx={{ width: "100%", marginTop: "10px" }}>
                      <ImageList
                        sx={{ 
                          width: "100%", 
                          height: 450, 
                          dísplay: "flex", 
                          flowDirection: "row", 
                          overflowY: "auto", 
                          flexWrap: "nowrap", 
                          overflow: "hidden",
                          transform: "translateZ(0)"
                         }}
                        cols={3}
                        rowHeight={164}
                      >
                        {note.media &&
                          note.media.map((item) => (
                            <ImageListItem key={item}>
                              <img
                                src={`${item}?w=164&h=164&fit=crop&auto=format`}
                                srcSet={`${item}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                                alt={item}
                                loading="lazy"
                              />
                            </ImageListItem>
                          ))}
                      </ImageList>
                      </Box>
                    <Divider marginTop="20px" />
                    {/* attachments */}
                    <Flex direction="row" alignItems="center" marginTop="20px">
                      <Text>Attachments:</Text>
                    </Flex>
              </AccordionDetails>
            </Accordion>
          </div>
        ))}
      </PageContainer>
    </div>
  );
}
