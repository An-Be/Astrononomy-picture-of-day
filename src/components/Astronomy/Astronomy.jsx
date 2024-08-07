import React, { useEffect, useState } from "react";
import "./Astronomy.scss";
import Loader from "../Loader/Loader";
import ReactPlayer from 'react-player'

export const Astronomy = () => {
  const [pictureOfDay, setPictureOfDay] = useState(null);
  const [error, setError] = useState(null);

  const fetchPictureOfDay = async () => {
    try {
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.REACT_APP_API_URL}`);
      const data = await res.json();
      setPictureOfDay(data);
    } catch (e) {
      setError("Sorry something went wrong, please try again.");
    }
  };

  console.log(pictureOfDay)

  useEffect(() => {
    fetchPictureOfDay();
  }, []);

  return (
    <>
      {error && <h1 className="error">{error}</h1>}
      {!pictureOfDay && !error ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (

        <div className="wrapper">
          <div className="wrapper__top-wrapper">
            <div className="rainbow">
              <div className="yellow"></div>
              <div className="aqua"></div>
              <div className="green"></div>
              <div className="red"></div>
              <div className="blue"></div>
            </div>
            <img
              className="wrapper__top-wrapper__nasa"
              src={require("../../images/nasa.png")}
              alt="nasa logo"
            />
            <h1 className="wrapper__top-wrapper__title">
              {pictureOfDay?.title}
            </h1>
            {
              pictureOfDay.media_type === 'video' ?
                <ReactPlayer
                  url={pictureOfDay?.url}
                  width='100%'
                  height='100%'
                  controls={true}

                />
                :
                <img
                  className="wrapper__top-wrapper__image"
                  src={pictureOfDay?.url}
                  alt="pic of day"
                />

            }

            {pictureOfDay?.copyright ? (
              <p className="wrapper__bottom-wrapper__copyright">
                Copyright: {pictureOfDay?.copyright}
              </p>
            ) : null}
          </div>
          <div className="wrapper__bottom-wrapper">
            <p className="wrapper__bottom-wrapper__explanation">
              {pictureOfDay?.explanation}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
