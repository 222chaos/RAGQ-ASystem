import React, { useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import styles from "./CenterMode.module.css";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

function CenterMode({ setClicked, setSelectedImageInfo }) {
  const sliderRef = useRef(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const imageInfo = ["需求工程", "操作系统", "计算机网络"];
  const settings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "10px",
    slidesToShow: 3,
    speed: 500,

    dots: true,
    arrows: false,
  };
  const imageUrls = [
    "https://node2d-public.hep.com.cn/37197bc254b97d32e5a1743d1428c44e.jpg-small?e=1709741130&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:-ICrqml9NpE0GNWMuQ7aAU1e6lI=",
    "https://node2d-public.hep.com.cn/bbd7693befd221e400c76cd30adb086d.jpg-small?e=1709742273&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:Zn62YEcqP-WMlsKOH3dbSqeVnvs=",
    "https://node2d-public.hep.com.cn/0747dff8c1bf2f5d32531a6e5a9ec707.jpg-small?e=1709741710&token=fz_hnGR7k1CJg3gJX1rpSAWQve4fO7q2Ii7oUBxR:OFVZbtwB5rWnJgQldNA76WjcyPM=",
  ];

  const handleClick = (index) => {
    if (index === selectedImageIndex) {
      setSelectedImageIndex(null);
      setSelectedImageInfo(null);
    } else {
      setSelectedImageIndex(index);
      setSelectedImageInfo(imageInfo[index]);
      sliderRef.current.slickGoTo(index - 1);
      setClicked(true);
      console.log("info===", imageInfo[index]);
    }
  };

  const handlePrev = () => {
    sliderRef.current.slickPrev();
  };

  const handleNext = () => {
    sliderRef.current.slickNext();
  };

  return (
    <div className={styles.container}>
      <Slider ref={sliderRef} {...settings}>
        {imageUrls.map((url, index) => (
          <div key={index} className={styles["slider-item"]}>
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className={`${
                selectedImageIndex === index ? styles.selected : ""
              }`}
              onClick={() => handleClick(index)}
            />
          </div>
        ))}
      </Slider>
      <div className={styles.leftArrow} onClick={handlePrev}>
        <ArrowLeftOutlined style={{ fontSize: "32px" }} />
      </div>
      <div className={styles.rightArrow} onClick={handleNext}>
        <ArrowRightOutlined style={{ fontSize: "32px" }} />
      </div>
    </div>
  );
}

export default CenterMode;
