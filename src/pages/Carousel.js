import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function CenterMode() {
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "60px",
    slidesToShow: 3,
    speed: 500,
    dots: true,
  };

  const imageUrls = [
    "https://blognumbers.files.wordpress.com/2010/09/1.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/2.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/3.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/4.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/5.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/6.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/7.jpg",
    "https://blognumbers.files.wordpress.com/2010/09/9.jpg",
  ];

  return (
    <div
      className="slider-container"
      style={{ width: "60%", margin: "0 auto", background: "#ffffff" }}
    >
      <Slider {...settings}>
        {imageUrls.map((url, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <img
              src={url}
              alt={`Image ${index + 1}`}
              style={{
                display: "block",
                margin: "auto",
                maxWidth: "30%",
                maxHeight: "30%",
              }}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CenterMode;
