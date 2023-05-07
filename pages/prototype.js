import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Viewer from '@/components/Viewer';
import Image from 'next/image';
import UploadIcon from '@mui/icons-material/Upload';
import Button from '@mui/material/Button';
import MouseIcon from '@mui/icons-material/Mouse';
import CheckIcon from '@mui/icons-material/Check';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Head from 'next/head';

const drawerWidth = 350;

export default function ClippedDrawer() {

  const [file, setFile] = React.useState(null);
  const [selectPoint, setSelectPoint] = React.useState(null);
  const [firstPoint, setFirstPoint] = React.useState(null);
  const [secondPoint, setSecondPoint] = React.useState(null);
  const [calculateDistance, setCalculateDistance] = React.useState(false);
  const [distance, setDistance] = React.useState(null);

  const [firstMesh, setFirstMesh] = React.useState(null);
  const [secondMesh, setSecondMesh] = React.useState(null);

  const [diffMesh, setDiffMesh] = React.useState(null);

  const [showCheckboxes, setShowCheckboxes] = React.useState(false);
  const [showBase, setShowBase] = React.useState(false);
  const [showTwin, setShowTwin] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  const sendMeshes = () => {
    const formData = new FormData();
    formData.append('mesh1', firstMesh);
    formData.append('mesh2', secondMesh);
    fetch('http://localhost:8000/api/compare/', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        response.arrayBuffer()
          .then(data => {
            setDiffMesh(data);
            setShowBase(true);
            setShowTwin(true);
            setShowError(true);
            setShowCheckboxes(true);
          })
      })
      .catch(error => {
        // handle error
      });
  };

  const handleFileUpload = (event) => {
    let newFile = event.target.files[0];
    if (!newFile) {
      return;
    }
    setFile(newFile);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Head>
        <title>MTU Digital Twins</title>
      </Head>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" noWrap component="div">
            <Image
              src={"/logo.png"}
              width={124}
              height={62}
              style={{
                margin: "5px"
              }}
              alt="Logo"
            />
          </Typography>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadIcon />}
            label="Upload 3D file"
            sx={{
              backgroundColor: "#3598DC",
            }}
          >
            Upload 3D file
            <input
              type="file"
              hidden
              onChange={(e) => { handleFileUpload(e) }}
            />
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar sx={{ height: "80px" }} />
        <Box sx={{ overflow: 'auto' }}>
          <Typography variant="h5" sx={{ marginTop: "20px", marginBottom: "20px", marginLeft: "5px" }}>Features</Typography>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                Distance between 2 points</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {selectPoint !== 1 ?
                <Button
                  variant="contained"
                  fullWidth
                  color={firstPoint === null ? "primary" : "success"}
                  component="label"
                  startIcon={firstPoint === null ? <MouseIcon /> : <CheckIcon />}
                  onClick={() => setSelectPoint(1)}
                  sx={{
                    marginBottom: "5px"
                  }}
                >
                  {firstPoint === null ? "Select 1st point" : "Point 1 selected"}
                </Button> :
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  startIcon={<MouseIcon />}
                  onClick={() => setSelectPoint(false)}
                  sx={{
                    marginBottom: "5px"
                  }}
                >
                  Cancel selection
                </Button>
              }

              {selectPoint !== 2 ?
                <Button
                  variant="contained"
                  fullWidth
                  color={secondPoint === null ? "primary" : "success"}
                  component="label"
                  startIcon={secondPoint === null ? <MouseIcon /> : <CheckIcon />}
                  onClick={() => setSelectPoint(2)}
                  sx={{
                    marginBottom: "5px"
                  }}
                >
                  {secondPoint === null ? "Select 2nd point" : "Point 2 selected"}
                </Button> :
                <Button
                  variant="outlined"
                  fullWidth
                  color="error"
                  startIcon={<MouseIcon />}
                  onClick={() => setSelectPoint(false)}
                  sx={{
                    marginBottom: "5px"
                  }}
                >
                  Cancel selection
                </Button>
              }
              {firstPoint && secondPoint &&
                <Button
                  variant="contained"
                  fullWidth
                  component="label"
                  onClick={() => {
                    setFirstPoint(null);
                    setSecondPoint(null);
                    setDistance(null);
                  }}
                >
                  Reset points
                </Button>}
              {distance &&
                <Typography
                  align="center"
                  sx={{
                    marginTop: "5px",
                  }}
                >
                  Distance: {distance.toFixed(3)} cm
                </Typography>
              }
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>Compare 3D models</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Button
                variant="contained"
                component="label"
                fullWidth
                color={firstMesh === null ? "primary" : "success"}
                startIcon={firstMesh === null ? <UploadIcon /> : <CheckIcon />}
                label="Select 1st 3D model"
                sx={{
                  marginBottom: "10px"
                }}
              >
                {firstMesh === null ? "Select base model" : "Model selected"}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    setFirstMesh(e.target.files[0]);
                  }}
                />
              </Button>
              <Button
                variant="contained"
                component="label"
                fullWidth
                color={secondMesh === null ? "primary" : "success"}
                startIcon={secondMesh === null ? <UploadIcon /> : <CheckIcon />}
                label="Select 2nd 3D model"
                sx={{
                  marginBottom: "10px"
                }}
              >
                {secondMesh === null ? "Select digital twin" : "Model selected"}
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    setSecondMesh(e.target.files[0]);
                  }}
                />
              </Button>
              <Button
                variant="contained"
                disabled={!firstMesh || !secondMesh}
                fullWidth
                onClick={() => sendMeshes()}
              >
                Compare 3D models
              </Button>
              {showCheckboxes &&
                <FormGroup>
                  <FormControlLabel control={<Checkbox />} label="Base model" onChange={(e) => setShowBase(e.target.checked)} checked={showBase} />
                  <FormControlLabel control={<Checkbox />} label="Digital twin" onChange={(e) => setShowTwin(e.target.checked)} checked={showTwin} />
                  <FormControlLabel control={<Checkbox />} label="Error estimate" onChange={(e) => setShowError(e.target.checked)} checked={showError} />
                </FormGroup>
              }
            </AccordionDetails>
          </Accordion>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Viewer
          file={file}
          selectPoint={selectPoint}
          setFirstPoint={setFirstPoint}
          setSecondPoint={setSecondPoint}
          firstPoint={firstPoint}
          secondPoint={secondPoint}
          setSelectPoint={setSelectPoint}
          calculateDistance={calculateDistance}
          setCalculateDistance={setCalculateDistance}
          setDistance={setDistance}
          diffMesh={diffMesh}
          firstMesh={firstMesh}
          secondMesh={secondMesh}
          showBase={showBase}
          showTwin={showTwin}
          showError={showError}
        />
      </Box>
    </Box>
  );
}