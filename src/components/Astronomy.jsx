import React, { useEffect, useState } from "react";
import "./Astronomy.scss";
import { API_URL } from "./constants";

export const Astronomy = () => {
  const [pictureOfDay, setPictureOfDay] = useState(null);

  const fetchPictureOfDay = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPictureOfDay(data);
  };

  useEffect(() => {
    fetchPictureOfDay();
  }, []);

  return (
    <div className="wrapper">
      <div className="wrapper__top-wrapper">
        <img className="wrapper__top-wrapper__nasa" src={require('../nasa_logo.png')} alt='nasa logo' />
        <h1 className="wrapper__top-wrapper__title">{pictureOfDay?.title}</h1>
        <img
          className="wrapper__top-wrapper__image"
          src={pictureOfDay?.url}
          alt="pic of day"
        />
                <p className="wrapper__bottom-wrapper__copyright">
          Copyright: {pictureOfDay?.copyright}
        </p>
      </div>
      <div className="wrapper__bottom-wrapper">
        <p className="wrapper__bottom-wrapper__explanation">
          {pictureOfDay?.explanation}
        </p>
      </div>
    </div>
  );
};
