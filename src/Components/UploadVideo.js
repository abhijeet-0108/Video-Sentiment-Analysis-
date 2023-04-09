import React from 'react';
import {useState, useRef} from 'react';
import {makeStyles} from '@material-ui/core';
import Papa from 'papaparse';
import {useEffect} from 'react';
import Records from '../Components/responseData.csv';
import ReactPlayer from 'react-player';
import Button from '@material-ui/core/Button';
import axios from 'axios';



const useStyles = makeStyles({
  inputBox: {
    margin: 10,
    padding: 10,
    marginLeft:50,
  },
  inputFeild: {
    borderRadius: 8,
    margin: 10,
    padding: 10,
    fontSize: 16,
  },
  video: {
    height: 700,
    width: 700,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    display: 'flex',
    justifyContent: 'center',
    justifySelf: 'center',
  },
});

const UploadVideo = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [recordsData, setRecordsData] = useState([]);
  const [value, setValue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoPaused, setVideoPaused] = useState(false);
  const [filterValue, setFilterValue] = useState([]);
  const [calmValue, setCalmValue] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  const classes = useStyles();

  function handleVideoUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const videoUrl = event.target.result;
      setVideoUrl(videoUrl);
      fetchRecordsData(); // fetch data again when a new video is uploaded
    };
    reader.readAsDataURL(file);
  }
  function fetchRecordsData() {
    Papa.parse(Records, {
      download: true,
      delimiter: ',',
      complete: (result) => {
        setRecordsData(result.data);
      },
    });
  }


  async function fetchData() {
    const response = await axios.get('http://localhost:5050/api/admin/interview-answer/video-analysis');
    console.log(response.data) ;
  }


  // useEffect(() => {
  //   async function fetchData() {
  //     const response = await axios.get('http://localhost:5050/api/admin/interview-answer/video-analysis');
  //     console.log(response.data);
  //   }

  //   fetchData();
  // }, []);

  useEffect(() => {
    fetchRecordsData();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setCurrentTime(0);
  }, [videoUrl]);

  const handleProgress = (progress) => {
    const currentTimeMs = parseInt(progress.playedSeconds * 1000);
    if (
      currentIndex < value.length - 1 &&
      currentTimeMs >= parseInt(value[currentIndex + 1][0])
    ) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTime(currentTimeMs);
    }
  };

  function handleVideoLoad() {
    setIsVideoLoaded(true);
  }

  const handlePlay = () => {
    setVideoPlaying(true);
    setVideoPaused(false);
    setCurrentIndex(0);
  };

  const handlePause = () => {
    setVideoPaused(true);
  };

  const handleEnded = () => {
    setVideoPlaying(false);
    setVideoPaused(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    console.log(typeof inputValue);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const newRecords = recordsData.map((innerArr) => [
      innerArr[1],
      innerArr[2],
    ]);
    setValue(newRecords);
    // console.log(recordsData);
  }, [recordsData]);

  useEffect(() => {
    const filterData = value.map((innerArr) => [innerArr[1]]);
    setFilterValue(filterData);
    // console.log(filterValue);
  }, [value]);

  useEffect(() => {
    const filterDataTime = value.map((innerArr) => [innerArr[0]]);
    setCalmValue(filterDataTime);
    // console.log(calmValue);
  }, [value]);

  useEffect(() => {
    if (inputValue.length > 0) {
      Math.round(filterValue[currentIndex][0].split('|')[0] >= inputValue);
    }
  }, [filterValue, inputValue]);

  const overlayStyle = {
    position: 'absolute',
    top: -90,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    fontSize: '2rem',
    color: 'black',
    fontWeight: 'bold',
    textShadow: '1px 1px black',
    margin: '10px',
  };

  return (
    <div style={{position: 'relative'}}>
      <div className={classes.inputBox}>
        <label>Upload a Video :</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className={classes.inputFeild}
        />
        <label style={{marginLeft:"200px"}}>Filter with Threeshold :</label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className={classes.inputFeild}
        />
        <Button variant="contained" color="primary" type='submit' onSubmit={handleSubmit}>
        Submit
      </Button>
      </div>

      <div className={classes.videoContainer}>
        {videoUrl && (
          <ReactPlayer
            controls
            url={videoUrl}
            ref={videoRef}
            className={classes.video}
            onProgress={handleProgress}
            onReady={handleVideoLoad}
            onPlay={handlePlay}
            onEnded={handleEnded}
            onPause={handlePause}
          />
        )}
        <div style={overlayStyle}>
          <p>
            {inputValue
              ? videoPlaying &&
                !videoPaused &&
                Number(
                  filterValue[currentIndex][0].split('|')[0].split(':')[1],
                ) >= Number(inputValue)
                ? filterValue[currentIndex][0].split('|')[0]
                : ''
              : videoPlaying &&
                !videoPaused &&
                filterValue[currentIndex][0].split('|')[0] +
                  `Time ${calmValue[currentIndex][0]}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;
