import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const [sentiment, setSentiment] = useState('');

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorderRef.current.start();
        setRecording(true);
        startSpeechRecognition();
      })
      .catch((error) => console.error('Error accessing microphone:', error));
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
      stopSpeechRecognition();
      analyzeSentiment(transcript); // Perform sentiment analysis
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      const audioBlob = new Blob([event.data], { type: 'audio/webm' });
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
    }
  };

  const startSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.start();

    recognition.onresult = (event) => {
      const { transcript } = event.results[0][0];
      setTranscript(transcript);
      analyzeSentiment(transcript); // Add this line to invoke the analyzeSentiment function
    };
  };
  const stopSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition(); // Use the appropriate vendor prefix for your targeted browsers
    recognition.stop();
  };

  const analyzeSentiment = async (transcript) => {
    try {
      const response = await axios.post('http://localhost:5000/api/analyze-sentiment', { text: transcript });
      console.log(response.data);
      const sentiment = response.data.sentiment; // Access the sentiment value from the response
      setSentiment(sentiment); // Set the sentiment value in the component's state
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <audio ref={audioRef} controls />
      {recording ? (
        <button onClick={stopRecording}>Stop Recording</button>
      ) : (
        <button onClick={startRecording}>Start Recording</button>
      )}
      <button onClick={downloadAudio} disabled={!audioBlob}>
        Download Recording
      </button>
      <h3>Transcript:</h3>
      <p>{transcript}</p>
      {sentiment && (
        <div>
          <h3>Sentiment Analysis:</h3>
          <p>{sentiment}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
