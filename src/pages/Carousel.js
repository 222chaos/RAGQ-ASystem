import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./CenterMode.module.css";

function CenterMode() {
  const settings = {
    className: styles.center,
    centerMode: true,
    infinite: true,
    centerPadding: "10px",
    slidesToShow: 3,
    speed: 888,
    dots: true,
  };

  const imageUrls = [
    "https://node2d-public.hep.com.cn/37197bc254b97d32e5a1743d1428c44e.jpg-small?e=1709741130&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:-ICrqml9NpE0GNWMuQ7aAU1e6lI=",
    "https://node2d-public.hep.com.cn/bbd7693befd221e400c76cd30adb086d.jpg-small?e=1709742273&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:Zn62YEcqP-WMlsKOH3dbSqeVnvs=",
    "https://node2d-public.hep.com.cn/0747dff8c1bf2f5d32531a6e5a9ec707.jpg-small?e=1709741710&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:OFVZbtwB5rWnJgQldNA76WjcyPM=",
  ];

  return (
    <div className={styles.sliderContainer}>
      <Slider {...settings}>
        {imageUrls.map((url, index) => (
          <div key={index} className="slick-slide-container">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className={`slick-slide-image ${styles.center}`}
            />
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default CenterMode;
